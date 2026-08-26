import asyncio

import ujson

from lib.utils import get_current_time, print_table
from modules.rgb import RGB
from modules.servo import Servo


class Schedules:
    __instance: Schedules | None = None

    path: str
    servo: Servo
    rgb: RGB
    _led_timer_task: asyncio.Task | None = None

    def __init__(self, path: str = "data/schedules.json"):
        self.path = path
        self.servo = Servo.create()
        self.rgb = RGB.create()

    async def _set_color_with_timeout(
        self, r: int, g: int, b: int, timeout: int = 10
    ) -> None:
        if self._led_timer_task and not self._led_timer_task.done():
            _ = self._led_timer_task.cancel()

        self.rgb.set_color(r, g, b)

        async def _turn_off_after_delay():
            try:
                await asyncio.sleep(timeout)
                self.rgb.set_color(0, 0, 0)
            except asyncio.CancelledError:
                pass

        self._led_timer_task = asyncio.create_task(_turn_off_after_delay())

    async def start(self) -> None:
        last_executed_time = ""
        schedules: list = []

        while True:
            try:
                now = get_current_time()
                current_date: str = f"{now[2]:02d}/{now[1]:02d}/{now[0]}"
                current_time: str = f"{now[3]:02d}:{now[4]:02d}"

                if current_time != last_executed_time:
                    last_executed_time = current_time
                    schedules = self._read_schedule()

                    print(f"\n[{current_time}] Loaded schedules:")
                    print_table(schedules, keys=["id", "time", "date", "status"])

                    for schedule in schedules:
                        item_date = schedule.get("date")
                        item_time = schedule.get("time")

                        if item_time == current_time and (
                            not item_date or item_date == current_date
                        ):
                            schedule_id = schedule.get("id")
                            print(f"\nExecuting schedule ID {schedule_id}: {schedule}")

                            if self._led_timer_task and not self._led_timer_task.done():
                                _ = self._led_timer_task.cancel()
                            self.rgb.set_color(1, 1, 0)

                            items = schedule.get("items", [])
                            schedule_success = True

                            for item in items:
                                slot = item.get("slot")
                                quantity = item.get("quantity", 1)

                                print(
                                    f"-> Dropping {quantity} pill(s) from slot {slot}"
                                )
                                success = await self.servo.drop(
                                    slot=slot, quantity=quantity
                                )

                                if not success:
                                    print(
                                        f"[ERROR] Slot {slot} failed! Aborting schedule {schedule_id}."
                                    )
                                    schedule_success = False
                                    break
                                else:
                                    print(f"[INFO] Successfully dispensed slot {slot}")

                            if schedule_success:
                                print(
                                    f"[SUCCESS] Schedule {schedule_id} completed successfully."
                                )
                                await self._set_color_with_timeout(0, 1, 0, timeout=10)
                            else:
                                print(f"[FAILED] Schedule {schedule_id} failed.")
                                await self._set_color_with_timeout(1, 0, 0, timeout=10)

            except Exception as e:  # noqa: BLE001
                print(f"Error in schedule loop: {e}")
                await self._set_color_with_timeout(1, 0, 0, timeout=10)

            now_after_task = get_current_time()
            seconds_to_next_minute = 60 - now_after_task[5]
            if seconds_to_next_minute <= 0:
                seconds_to_next_minute = 60

            await asyncio.sleep(seconds_to_next_minute)

    def _read_schedule(self) -> list:
        try:
            with open(self.path, "r") as f:
                data = ujson.load(f)
                return data if isinstance(data, list) else []
        except Exception as e:  # noqa: BLE001
            print(f"Error reading file {self.path}: {e}")
            return []

    @classmethod
    def create(cls) -> Schedules:
        if cls.__instance is None:
            cls.__instance = Schedules()
        return cls.__instance
