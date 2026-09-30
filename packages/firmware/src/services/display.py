# pyright: reportAttributeAccessIssue=false

import asyncio
import gc
import time

from lib.config import Config
from lib.i18n import t
from lib.schedule import Schedule
from lib.uqr import QRCode
from lib.utils import get_current_time
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
    _link_qr_until: int

    def __init__(self) -> None:
        self._lcd = ST7735.create()
        self._lcd.init()
        self._lcd.rotation(1)

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

        self._link_qr_until = 0

        self.show_boot_logo()

    def show_boot_logo(self, duration_ms: int = 2000) -> None:
        """Render the default boot screen and restart its display duration."""
        self._dialog = None
        self._link_qr_until = 0

        self._boot_until = time.ticks_add(
            time.ticks_ms(),
            duration_ms,
        )

        self._main_drawn = False
        self._last_clock = None
        self._last_clock_parts = None
        self._last_date = None
        self._last_schedule_snapshot = ()
        self._last_dialog_remaining = 0
        self._last_render = "boot"

        self._draw_boot_logo()

    def show_result(
        self,
        success: bool,
        title: str,
        body: str = "",
    ) -> None:
        """Show a compact drop result dialog for 5 seconds."""
        self._dialog = {
            "type": "result",
            "success": success,
            "title": title,
            "body": body,
        }

        self._dialog_until = time.ticks_add(
            time.ticks_ms(),
            5000,
        )

    def show_schedule_info(self, schedule: dict) -> None:
        """Show schedule details on the LCD."""
        self._dialog = {
            "type": "schedule",
            "success": True,
            "schedule": schedule,
        }

        self._dialog_until = time.ticks_add(
            time.ticks_ms(),
            5000,
        )

    def show_info_dialog(
        self,
        title: str,
        body: str = "",
        duration_ms: int = 5000,
    ) -> None:
        """Show a compact informational dialog."""
        self._dialog = {
            "type": "info",
            "success": True,
            "title": title,
            "body": body,
        }

        self._dialog_until = time.ticks_add(
            time.ticks_ms(),
            duration_ms,
        )

    def is_link_qr_active(self) -> bool:
        """Return True while the temporary link QR screen is active."""
        return (
            time.ticks_diff(
                self._link_qr_until,
                time.ticks_ms(),
            )
            > 0
        )

    def show_link_qr(
        self,
        qr: QRCode,
        size: int = 2,
        duration_ms: int = 60000,
    ) -> None:
        """Render QR code without keeping the QR matrix or full framebuffer."""
        gc.collect()

        matrix = qr.get_matrix()
        qr_width, qr_height = qr.get_size()

        width, height = self._lcd.size()

        pixel_width = qr_width * size
        pixel_height = qr_height * size

        x = (width - pixel_width) // 2
        y = (height - pixel_height) // 2

        x = max(x, 0)

        y = max(y, 0)

        self._lcd.fill(self._lcd.BLACK)

        white_hi = self._lcd.WHITE >> 8
        white_lo = self._lcd.WHITE & 0xFF

        row_buffer = bytearray(pixel_width * 2)

        for row in range(qr_height):
            for index in range(len(row_buffer)):
                row_buffer[index] = 0

            for col in range(qr_width):
                if not matrix[row][col]:  # pyright: ignore[reportOptionalSubscript]
                    continue

                pixel_x = col * size

                for dx in range(size):
                    index = (pixel_x + dx) * 2
                    row_buffer[index] = white_hi
                    row_buffer[index + 1] = white_lo

            pixel_y = y + row * size

            for dy in range(size):
                self._lcd.blit(
                    x,
                    pixel_y + dy,
                    pixel_width,
                    1,
                    row_buffer,
                )

        del row_buffer
        del matrix
        gc.collect()

        self._link_qr_until = time.ticks_add(
            time.ticks_ms(),
            duration_ms,
        )

        self._dialog = None
        self._main_drawn = False
        self._last_clock = None
        self._last_clock_parts = None
        self._last_date = None
        self._last_schedule_snapshot = ()
        self._last_render = "link_qr"

    def _draw_boot_logo(self) -> None:
        """Show the Rozumari boot logo centered."""
        width, height = self._lcd.size()

        logo = "Rozumari"
        size = 2

        char_width = 6 * size + 1
        text_width = len(logo) * char_width - 1

        x = max(
            0,
            (width - text_width) // 2,
        )

        y = max(
            0,
            (height - 16) // 2,
        )

        self._lcd.fill(self._lcd.BLACK)

        self._lcd.text((x, y), logo, self._lcd.WHITE, size=size)

        self._lcd.hline((x, y + 19), text_width, self._lcd.BLUE)

    def _get_pending_snapshot(self) -> tuple:
        schedules = self._schedule.get_schedules()

        pending = [s for s in schedules if s.get("status", "pending") == "pending"]

        pending.sort(
            key=lambda s: (
                (s.get("date") or ""),
                (s.get("time") or ""),
            )
        )

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

        self._lcd.fill_rect(
            (0, 0),
            (width, 40),
            self._lcd.BLACK,
        )

        self._lcd.text(
            (4, 4),
            f"{now[3]:02d}:{now[4]:02d}:{now[5]:02d}",
            self._lcd.WHITE,
            size=2,
        )

        self._lcd.text(
            (4, 27),
            f"{now[2]:02d}/{now[1]:02d}/{now[0]:04d}",
            self._lcd.GRAY,
        )

        self._last_clock_parts = (
            now[3],
            now[4],
            now[5],
        )

        self._last_clock = f"{now[3]:02d}:{now[4]:02d}:{now[5]:02d}"

        self._last_date = f"{now[2]:02d}/{now[1]:02d}/{now[0]:04d}"

    def _update_clock(self, now) -> None:
        current = (now[3], now[4], now[5])
        previous = self._last_clock_parts

        if previous is None:
            self._draw_header(now)
            return

        fields = (
            (0, 4),
            (1, 37),
            (2, 70),
        )

        for index, x in fields:
            if current[index] != previous[index]:
                self._lcd.fill_rect(
                    (x, 4),
                    (22, 17),
                    self._lcd.BLACK,
                )

                self._lcd.text(
                    (x, 4),
                    f"{current[index]:02d}",
                    self._lcd.WHITE,
                    size=2,
                )

        if current != previous:
            self._last_clock_parts = current

            self._last_clock = f"{now[3]:02d}:{now[4]:02d}:{now[5]:02d}"

        date = f"{now[2]:02d}/{now[1]:02d}/{now[0]:04d}"

        if date != self._last_date:
            self._lcd.fill_rect(
                (0, 26),
                (110, 12),
                self._lcd.BLACK,
            )

            self._lcd.text(
                (4, 27),
                date,
                self._lcd.GRAY,
            )

            self._last_date = date

    def _draw_main(self, now=None) -> None:
        width, _height = self._lcd.size()

        self._lcd.fill(self._lcd.BLACK)

        if now is None:
            now = get_current_time()

        self._draw_header(now)

        self._lcd.hline(
            (0, 40),
            width,
            self._lcd.BLUE,
        )

        device = self._config.get("device", {}) or {}

        device_name = device.get("name", "") or device.get("factoryModel", "")

        device_position = device.get(
            "position",
            "",
        )

        device_label = str(device_name)

        if device_position:
            device_label = f"{device_label} - {device_position}"

        self._lcd.text(
            (4, 44),
            device_label[:25],
            self._lcd.GREEN,
        )

        snapshot = self._get_pending_snapshot()

        self._last_schedule_snapshot = snapshot

        y = 57

        if not snapshot:
            self._lcd.text(
                (4, y),
                t("lcd.no_pending"),
                self._lcd.GRAY,
            )

            self._main_drawn = True
            self._last_render = "main"
            return

        self._lcd.text(
            (4, y),
            t("lcd.schedules"),
            self._lcd.BLUE,
        )

        y += 11

        for index, (
            _schedule_id,
            _date,
            schedule_time,
            item_count,
        ) in enumerate(
            snapshot,
            1,
        ):
            schedule_time = schedule_time[:5] if schedule_time else "--:--"

            item_label = t("lcd.item_one") if item_count == 1 else t("lcd.item_many")

            label = f"{index}. {schedule_time}  {item_count} {item_label}"

            self._lcd.text(
                (4, y),
                label[:26],
                self._lcd.WHITE,
            )

            y += 11

        self._main_drawn = True
        self._last_render = "main"

    def _update_main(self) -> None:
        now = get_current_time()

        clock = f"{now[3]:02d}:{now[4]:02d}:{now[5]:02d}"

        snapshot = self._get_pending_snapshot()

        if snapshot != self._last_schedule_snapshot or not self._main_drawn:
            self._draw_main(now)
            return

        if (
            clock != self._last_clock
            or self._last_date != f"{now[2]:02d}/{now[1]:02d}/{now[0]:04d}"
        ):
            self._update_clock(now)

    def _draw_dialog(
        self,
        remaining: int | None = None,
    ) -> None:
        if self._dialog is None:
            return

        width, height = self._lcd.size()
        dialog_type = self._dialog.get("type", "result")

        self._lcd.fill(self._lcd.BLACK)

        if dialog_type == "schedule":
            self._draw_schedule_dialog(remaining)
            return

        box_x1, box_y1 = 20, 34
        box_x2, box_y2 = (
            width - 20,
            height - 34,
        )

        if dialog_type == "info":
            accent = self._lcd.BLUE
        else:
            accent = self._lcd.GREEN if self._dialog["success"] else self._lcd.RED

        self._lcd.rect(
            (box_x1, box_y1),
            (
                box_x2 - box_x1 + 1,
                box_y2 - box_y1 + 1,
            ),
            accent,
        )

        title = str(self._dialog["title"])[:20]

        title_x = max(
            box_x1 + 4,
            (width - len(title) * 6) // 2,
        )

        self._lcd.text(
            (title_x, box_y1 + 8),
            title,
            accent,
        )

        body = str(self._dialog.get("body", ""))[:22]

        body_x = max(
            box_x1 + 4,
            (width - len(body) * 6) // 2,
        )

        self._lcd.text(
            (body_x, box_y1 + 25),
            body,
            self._lcd.GRAY,
        )

        if remaining is None:
            remaining = 5

        countdown = t(
            "lcd.auto_close",
            seconds=remaining,
        )

        countdown_x = max(
            box_x1 + 4,
            (width - len(countdown) * 6) // 2,
        )

        self._lcd.text(
            (countdown_x, box_y2 - 13),
            countdown,
            self._lcd.WHITE,
        )

    def _draw_schedule_dialog(
        self,
        remaining: int | None = None,
    ) -> None:
        if self._dialog is None:
            return

        width, height = self._lcd.size()

        schedule = self._dialog.get("schedule", {})

        schedule_id = str(schedule.get("id", ""))
        date = str(schedule.get("date", ""))
        schedule_time = str(schedule.get("time", ""))[:5]
        items = schedule.get("items") or []

        box_x1, box_y1 = 3, 3
        box_x2, box_y2 = (
            width - 4,
            height - 4,
        )

        self._lcd.rect(
            (box_x1, box_y1),
            (
                box_x2 - box_x1 + 1,
                box_y2 - box_y1 + 1,
            ),
            self._lcd.BLUE,
        )

        title = t("lcd.schedule")

        title_x = max(
            box_x1 + 4,
            (width - len(title) * 6) // 2,
        )

        self._lcd.text(
            (title_x, 7),
            title,
            self._lcd.BLUE,
        )

        self._lcd.text(
            (7, 20),
            f"{t('lcd.schedule_id')}: {schedule_id}"[:25],
            self._lcd.WHITE,
        )

        self._lcd.text(
            (7, 31),
            (f"{t('lcd.schedule_datetime')}: {date} {schedule_time}")[:25],
            self._lcd.GRAY,
        )

        self._lcd.text(
            (7, 43),
            t("lcd.schedule_items"),
            self._lcd.BLUE,
        )

        y = 54

        for item in items[:5]:
            slot = str(item.get("slot", "-"))
            medicine = str(item.get("medicine", "-"))

            quantity = item.get(
                "quantity",
                0,
            )

            label = f"{slot} {medicine} x{quantity}"

            self._lcd.text(
                (7, y),
                label[:24],
                self._lcd.WHITE,
            )

            y += 11

        if remaining is None:
            remaining = 5

        countdown = t(
            "lcd.auto_close",
            seconds=remaining,
        )

        countdown_x = max(
            box_x1 + 4,
            (width - len(countdown) * 6) // 2,
        )

        self._lcd.text(
            (countdown_x, box_y2 - 10),
            countdown,
            self._lcd.GRAY,
        )

    def _update_dialog(
        self,
        remaining: int,
    ) -> None:
        if self._dialog is None:
            return

        width, height = self._lcd.size()

        if self._dialog.get("type", "result") == "schedule":
            box_x1 = 3
            box_x2 = width - 4
            box_y2 = height - 4

            self._lcd.fill_rect(
                (box_x1 + 1, box_y2 - 17),
                (
                    box_x2 - box_x1 - 1,
                    17,
                ),
                self._lcd.BLACK,
            )

            countdown = t(
                "lcd.auto_close",
                seconds=remaining,
            )

            countdown_x = max(
                box_x1 + 4,
                (width - len(countdown) * 6) // 2,
            )

            self._lcd.text(
                (countdown_x, box_y2 - 10),
                countdown,
                self._lcd.WHITE,
            )

            return

        box_x1 = 20
        box_x2 = width - 20
        box_y2 = height - 34

        self._lcd.fill_rect(
            (box_x1 + 1, box_y2 - 17),
            (
                box_x2 - box_x1 - 1,
                17,
            ),
            self._lcd.BLACK,
        )

        countdown = t(
            "lcd.auto_close",
            seconds=remaining,
        )

        countdown_x = max(
            box_x1 + 4,
            (width - len(countdown) * 6) // 2,
        )

        self._lcd.text(
            (countdown_x, box_y2 - 13),
            countdown,
            self._lcd.WHITE,
        )

    def show_config_mode(self) -> None:
        """Render the persistent Config Mode screen."""
        self._dialog = None
        self._link_qr_until = 0

        width, height = self._lcd.size()

        self._lcd.fill(self._lcd.BLACK)

        logo = "Rozumari"
        size = 2

        char_width = 6 * size + 1
        text_width = len(logo) * char_width - 1

        logo_x = max(
            0,
            (width - text_width) // 2,
        )

        logo_y = max(
            0,
            (height - 38) // 2 - 8,
        )

        self._lcd.text(
            (logo_x, logo_y),
            logo,
            self._lcd.WHITE,
            size=size,
        )

        separator_y = logo_y + 19

        self._lcd.hline(
            (logo_x, separator_y),
            text_width,
            self._lcd.BLUE,
        )

        status = t("lcd.configuring")

        status_width = len(status) * 6

        status_x = max(
            0,
            (width - status_width) // 2,
        )

        self._lcd.text(
            (status_x, separator_y + 9),
            status,
            self._lcd.GRAY,
        )

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

                # Boot screen / QR screen.
                if (
                    time.ticks_diff(
                        self._boot_until,
                        now_ms,
                    )
                    > 0
                    or time.ticks_diff(
                        self._link_qr_until,
                        now_ms,
                    )
                    > 0
                ):
                    pass

                # QR expired -> return normal UI.
                elif self._link_qr_until:
                    self._link_qr_until = 0
                    self._dialog = None
                    self._main_drawn = False

                    self._update_main()

                # Dialog active.
                elif (
                    self._dialog is not None
                    and time.ticks_diff(
                        self._dialog_until,
                        now_ms,
                    )
                    > 0
                ):
                    remaining_ms = time.ticks_diff(
                        self._dialog_until,
                        now_ms,
                    )

                    remaining = max(
                        1,
                        (remaining_ms + 999) // 1000,
                    )

                    if self._last_render != "dialog":
                        self._draw_dialog(remaining)

                        self._last_dialog_remaining = remaining
                        self._last_render = "dialog"

                    elif remaining != self._last_dialog_remaining:
                        self._update_dialog(remaining)

                        self._last_dialog_remaining = remaining

                # Normal UI.
                else:
                    if self._dialog is not None:
                        self._dialog = None
                        self._main_drawn = False

                    self._update_main()

            except Exception as error:
                print(
                    t(
                        "display.error",
                        error=error,
                    )
                )

            await asyncio.sleep(0.100)

    @classmethod
    def create(cls) -> Display:
        if cls.__instance is None:
            cls.__instance = cls()

        return cls.__instance
