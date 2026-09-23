# pyright: reportAttributeAccessIssue=false

import asyncio
import time

from lib.config import Config
from lib.i18n import t
from lib.schedule import Schedule
from lib.utils import get_current_time, rgb
from modules.st7735 import ST7735


class Display:
    __instance: Display | None = None

    _lcd: ST7735
    _schedule: Schedule
    _config: Config
    _dialog: dict | None
    _dialog_until: int
    _boot_until: int
    _main_drawn: bool
    _last_clock: str | None
    _last_clock_parts: tuple | None
    _last_date: str | None
    _last_schedule_snapshot: tuple
    _last_render: str
    _last_dialog_remaining: int

    def __init__(self) -> None:
        self._lcd = ST7735.create()
        self._lcd.init()
        self._lcd.rotation(1)  # 160x128, easier to show schedule information
        self._schedule = Schedule.create()
        self._config = Config.create()
        self._dialog = None
        self._dialog_until = 0
        self._boot_until = time.ticks_add(time.ticks_ms(), 2000)
        self._main_drawn = False
        self._last_clock = None
        self._last_clock_parts = None
        self._last_date = None
        self._last_schedule_snapshot = ()
        self._last_render = "boot"
        self._last_dialog_remaining = 0

        # Boot logo is rendered immediately after LCD initialization.
        self.show_boot_logo()

    def show_boot_logo(self, duration_ms: int = 2000) -> None:
        """Render the default boot screen and restart its display duration."""
        self._dialog = None
        self._boot_until = time.ticks_add(time.ticks_ms(), duration_ms)
        self._main_drawn = False
        self._last_clock = None
        self._last_clock_parts = None
        self._last_date = None
        self._last_schedule_snapshot = ()
        self._last_dialog_remaining = 0
        self._last_render = "boot"
        self._draw_boot_logo()

    def show_drop_result(self, success: bool, title: str, body: str = "") -> None:
        """Show a compact drop result dialog for 5 seconds without blocking the drop task."""
        self._dialog = {
            "type": "result",
            "success": success,
            "title": title,
            "body": body,
        }
        self._dialog_until = time.ticks_add(time.ticks_ms(), 5000)

    def show_schedule_info(self, schedule: dict) -> None:
        """Show schedule details on the LCD when an automatic schedule starts."""
        self._dialog = {
            "type": "schedule",
            "success": True,
            "schedule": schedule,
        }
        self._dialog_until = time.ticks_add(time.ticks_ms(), 5000)

    def _text(self, x: int, y: int, value: str, color: int, size: int = 1) -> None:
        self._lcd.text((x, y), str(value), color, size=size)

    def _draw_boot_logo(self) -> None:
        """Show the Rozumari boot logo centered for a short startup period."""
        width, height = self._lcd.size()
        black = rgb(0, 0, 0)
        white = rgb(255, 255, 255)
        blue = rgb(50, 160, 255)
        logo = "Rozumari"
        size = 2
        char_width = 6 * size + 1
        text_width = len(logo) * char_width - 1
        x = max(0, (width - text_width) // 2)
        y = max(0, (height - 16) // 2)

        self._lcd.fill(black)
        self._lcd.text((x, y), logo, white, size=size)
        self._lcd.hline((x, y + 19), text_width, blue)

    def _get_pending_snapshot(self) -> tuple:
        schedules = self._schedule.get_schedules()
        pending = [s for s in schedules if s.get("status", "pending") == "pending"]
        pending.sort(key=lambda s: ((s.get("date") or ""), (s.get("time") or "")))
        return tuple(
            (
                str(s.get("id", "")),
                str(s.get("date", "")),
                str(s.get("time", "")),
                len(s.get("items") or []),
            )
            for s in pending[:5]
        )

    def _draw_header(self, now) -> None:
        width, _ = self._lcd.size()
        white = rgb(255, 255, 255)
        gray = rgb(170, 170, 170)
        black = rgb(0, 0, 0)

        # Initial/full header draw. Subsequent ticks update only the changed
        # hour/minute/second fields instead of repainting the whole clock area.
        self._lcd.fill_rect((0, 0), (width, 40), black)
        self._text(4, 4, f"{now[3]:02d}:{now[4]:02d}:{now[5]:02d}", white, size=2)
        self._text(4, 27, f"{now[2]:02d}/{now[1]:02d}/{now[0]:04d}", gray, size=1)

        self._last_clock_parts = (now[3], now[4], now[5])
        self._last_clock = f"{now[3]:02d}:{now[4]:02d}:{now[5]:02d}"
        self._last_date = f"{now[2]:02d}/{now[1]:02d}/{now[0]:04d}"

    def _update_clock(self, now) -> None:
        white = rgb(255, 255, 255)
        black = rgb(0, 0, 0)
        current = (now[3], now[4], now[5])
        previous = self._last_clock_parts

        if previous is None:
            self._draw_header(now)
            return

        # Font width is 5px at size 1, so size 2 advances by 11px per char.
        # HH:MM:SS starts at x=4: HH x=4, MM x=37, SS x=70.
        fields = ((0, 4), (1, 37), (2, 70))
        for index, x in fields:
            if current[index] != previous[index]:
                self._lcd.fill_rect((x, 4), (22, 17), black)
                self._text(x, 4, f"{current[index]:02d}", white, size=2)

        if current != previous:
            self._last_clock_parts = current
            self._last_clock = f"{now[3]:02d}:{now[4]:02d}:{now[5]:02d}"

        date = f"{now[2]:02d}/{now[1]:02d}/{now[0]:04d}"
        if date != self._last_date:
            self._lcd.fill_rect((0, 26), (110, 12), black)
            self._text(4, 27, date, rgb(170, 170, 170), size=1)
            self._last_date = date

    def _draw_main(self, now=None) -> None:
        width, _height = self._lcd.size()
        white = rgb(255, 255, 255)
        gray = rgb(170, 170, 170)
        blue = rgb(50, 160, 255)
        green = rgb(60, 220, 100)
        black = rgb(0, 0, 0)

        self._lcd.fill(black)

        if now is None:
            now = get_current_time()
        self._draw_header(now)
        self._lcd.hline((0, 40), width, blue)

        device = self._config.get("device", {}) or {}
        device_name = device.get("name", "") or device.get("factoryModel", "")
        device_position = device.get("position", "")

        device_label = str(device_name)
        if device_position:
            device_label = f"{device_label} - {device_position}"

        self._text(4, 44, device_label[:25], green, size=1)

        snapshot = self._get_pending_snapshot()
        self._last_schedule_snapshot = snapshot

        y = 57
        if not snapshot:
            self._text(4, y, t("lcd.no_pending"), gray)
            self._main_drawn = True
            self._last_render = "main"
            return

        self._text(4, y, t("lcd.schedules"), blue)
        y += 11
        for index, (_schedule_id, _date, schedule_time, item_count) in enumerate(
            snapshot, 1
        ):
            schedule_time = schedule_time[:5] if schedule_time else "--:--"
            item_label = t("lcd.item_one") if item_count == 1 else t("lcd.item_many")
            label = f"{index}. {schedule_time}  {item_count} {item_label}"
            self._text(4, y, label[:26], white)
            y += 11

        self._main_drawn = True
        self._last_render = "main"

    def _update_main(self) -> None:
        now = get_current_time()
        clock = f"{now[3]:02d}:{now[4]:02d}:{now[5]:02d}"
        snapshot = self._get_pending_snapshot()

        # Redraw the complete screen only when schedule/device data changed.
        if snapshot != self._last_schedule_snapshot or not self._main_drawn:
            self._draw_main(now)
            return

        # Update only the fields that changed. A second change touches only
        # SS; a minute change touches MM (and SS); an hour change touches HH
        # (and any other changed fields). The rest of the LCD stays untouched.
        if (
            clock != self._last_clock
            or self._last_date != f"{now[2]:02d}/{now[1]:02d}/{now[0]:04d}"
        ):
            self._update_clock(now)

    def _draw_dialog(self, remaining: int | None = None) -> None:
        if self._dialog is None:
            return

        width, height = self._lcd.size()
        black = rgb(0, 0, 0)
        white = rgb(255, 255, 255)
        green = rgb(50, 220, 100)
        red = rgb(240, 70, 70)
        gray = rgb(180, 180, 180)
        _blue = rgb(50, 160, 255)

        dialog_type = self._dialog.get("type", "result")

        self._lcd.fill(black)

        if dialog_type == "schedule":
            self._draw_schedule_dialog(remaining)
            return

        # Compact result dialog.
        box_x1, box_y1 = 20, 34
        box_x2, box_y2 = width - 20, height - 34
        accent = green if self._dialog["success"] else red

        self._lcd.rect(
            (box_x1, box_y1), (box_x2 - box_x1 + 1, box_y2 - box_y1 + 1), accent
        )

        title = str(self._dialog["title"])[:20]
        title_x = max(box_x1 + 4, (width - len(title) * 6) // 2)
        self._text(title_x, box_y1 + 8, title, accent, size=1)

        body = str(self._dialog.get("body", ""))[:22]
        body_x = max(box_x1 + 4, (width - len(body) * 6) // 2)
        self._text(body_x, box_y1 + 25, body, gray, size=1)

        if remaining is None:
            remaining = 5
        countdown = t("lcd.auto_close", seconds=remaining)
        countdown_x = max(box_x1 + 4, (width - len(countdown) * 6) // 2)
        self._text(countdown_x, box_y2 - 13, countdown, white, size=1)

    def _draw_schedule_dialog(self, remaining: int | None = None) -> None:
        """Render schedule details before the dispensing sequence starts."""
        if self._dialog is None:
            return

        width, height = self._lcd.size()
        _black = rgb(0, 0, 0)
        white = rgb(255, 255, 255)
        gray = rgb(180, 180, 180)
        blue = rgb(50, 160, 255)

        schedule = self._dialog.get("schedule", {})
        schedule_id = str(schedule.get("id", ""))
        date = str(schedule.get("date", ""))
        schedule_time = str(schedule.get("time", ""))[:5]
        items = schedule.get("items") or []

        box_x1, box_y1 = 3, 3
        box_x2, box_y2 = width - 4, height - 4
        self._lcd.rect(
            (box_x1, box_y1),
            (box_x2 - box_x1 + 1, box_y2 - box_y1 + 1),
            blue,
        )

        title = t("lcd.schedule")
        title_x = max(box_x1 + 4, (width - len(title) * 6) // 2)
        self._text(title_x, 7, title, blue, size=1)

        self._text(7, 20, f"{t('lcd.schedule_id')}: {schedule_id}"[:25], white)
        self._text(
            7, 31, f"{t('lcd.schedule_datetime')}: {date} {schedule_time}"[:25], gray
        )
        self._text(7, 43, t("lcd.schedule_items"), blue)

        y = 54
        for item in items[:5]:
            slot = str(item.get("slot", "-"))
            medicine = str(item.get("medicine", "-"))
            quantity = item.get("quantity", 0)
            # Keep each row on one line so the complete schedule remains visible.
            label = f"{slot} {medicine} x{quantity}"
            self._text(7, y, label[:24], white)
            y += 11

        if remaining is None:
            remaining = 5
        countdown = t("lcd.auto_close", seconds=remaining)
        countdown_x = max(box_x1 + 4, (width - len(countdown) * 6) // 2)
        self._text(countdown_x, box_y2 - 10, countdown, gray)

    def _update_dialog(self, remaining: int) -> None:
        if self._dialog is None:
            return

        # Only redraw the countdown area.
        width, height = self._lcd.size()
        black = rgb(0, 0, 0)
        white = rgb(255, 255, 255)

        if self._dialog.get("type", "result") == "schedule":
            box_x1, _box_y1 = 3, 3
            box_x2, box_y2 = width - 4, height - 4
            self._lcd.fill_rect(
                (box_x1 + 1, box_y2 - 17), (box_x2 - box_x1 - 1, 17), black
            )
            countdown = t("lcd.auto_close", seconds=remaining)
            countdown_x = max(box_x1 + 4, (width - len(countdown) * 6) // 2)
            self._text(countdown_x, box_y2 - 10, countdown, white, size=1)
            return

        box_x1, _box_y1 = 20, 34
        box_x2, box_y2 = width - 20, height - 34
        self._lcd.fill_rect((box_x1 + 1, box_y2 - 17), (box_x2 - box_x1 - 1, 17), black)
        countdown = t("lcd.auto_close", seconds=remaining)
        countdown_x = max(box_x1 + 4, (width - len(countdown) * 6) // 2)
        self._text(countdown_x, box_y2 - 13, countdown, white, size=1)

    def show_config_mode(self) -> None:
        """Render the persistent Config Mode screen."""
        width, height = self._lcd.size()
        black = rgb(0, 0, 0)
        white = rgb(255, 255, 255)
        blue = rgb(50, 160, 255)
        gray = rgb(170, 170, 170)

        self._lcd.fill(black)

        logo = "Rozumari"
        size = 2
        char_width = 6 * size + 1
        text_width = len(logo) * char_width - 1
        logo_x = max(0, (width - text_width) // 2)
        logo_y = max(0, (height - 38) // 2 - 8)
        self._lcd.text((logo_x, logo_y), logo, white, size=size)

        separator_y = logo_y + 19
        self._lcd.hline((logo_x, separator_y), text_width, blue)

        status = t("lcd.configuring")
        status_width = len(status) * 6
        status_x = max(0, (width - status_width) // 2)
        self._lcd.text((status_x, separator_y + 9), status, gray, size=1)

        self._last_render = "config"
        self._main_drawn = False
        self._last_clock = None
        self._last_clock_parts = None
        self._last_date = None
        self._last_schedule_snapshot = ()

    async def start(self) -> None:
        print(t("display.started"))
        while True:
            try:
                now_ms = time.ticks_ms()

                if time.ticks_diff(self._boot_until, now_ms) > 0:
                    # Boot logo stays untouched on the LCD.
                    pass
                elif (
                    self._dialog is not None
                    and time.ticks_diff(self._dialog_until, now_ms) > 0
                ):
                    remaining_ms = time.ticks_diff(self._dialog_until, now_ms)
                    remaining = max(1, (remaining_ms + 999) // 1000)
                    if self._last_render != "dialog":
                        self._draw_dialog(remaining)
                        self._last_dialog_remaining = remaining
                        self._last_render = "dialog"
                    elif remaining != self._last_dialog_remaining:
                        self._update_dialog(remaining)
                        self._last_dialog_remaining = remaining
                else:
                    if self._dialog is not None:
                        self._dialog = None
                        self._main_drawn = False
                    self._update_main()
            except Exception as error:
                print(t("display.error", error=error))

            # Run frequently for responsive dialog transitions, but only touch
            # the LCD when something actually changed.
            await asyncio.sleep(0.100)

    @classmethod
    def create(cls) -> Display:
        if cls.__instance is None:
            cls.__instance = Display()
        return cls.__instance
