import asyncio
import time

from lib.schedule import Schedule
from lib.utils import get_current_time, print_table
from tasks.drop import Drop


class Schedules:
    __instance: Schedules | None = None

    _schedule: Schedule
    _drop: Drop

    def __init__(self) -> None:
        self._schedule = Schedule.create()
        self._drop = Drop.create()

    async def start(self, schedules_data: list | None = None) -> None:
        """Run the schedule polling loop and execute due schedules."""
        print("[Startup] Schedules task active...")
        last_time = ""

        while True:
            try:
                now = get_current_time()
                cur_date = f"{now[0]:04d}-{now[1]:02d}-{now[2]:02d}"
                cur_time = f"{now[3]:02d}:{now[4]:02d}"

                if cur_time != last_time:
                    last_time = cur_time
                    schedules = (
                        schedules_data
                        if schedules_data is not None
                        else self._schedule.get_schedules()
                    )

                    sec = now[5] if len(now) > 5 else 0
                    print(
                        f"[Schedule] [{cur_date} {cur_time}:{sec:02d}] Checking schedules..."
                    )
                    print_table(schedules, keys=["id", "date", "time", "status"])

                    for schedule_item in schedules:
                        if schedule_item.get("status", "pending") != "pending":
                            continue

                        schedule_time = (schedule_item.get("time") or "")[:5]
                        schedule_date = schedule_item.get("date")

                        if schedule_time != cur_time or (
                            schedule_date and schedule_date != cur_date
                        ):
                            continue

                        schedule_id = schedule_item.get("id")
                        items = schedule_item.get("items", [])
                        print(f"[Schedule] Executing schedule {schedule_id}")
                        await self._drop.execute(items=items, schedule_id=schedule_id)

            except Exception as error:
                print(f"[Schedule] Error: {error}")

            now = time.time()
            sleep_time = 60.0 - (now % 60)
            await asyncio.sleep(sleep_time)

    @classmethod
    def create(cls) -> Schedules:
        if cls.__instance is None:
            cls.__instance = Schedules()
        return cls.__instance
