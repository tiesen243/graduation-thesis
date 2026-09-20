import asyncio
import time

from lib.api import Api
from lib.schedule import Schedule
from lib.utils import get_current_time, print_table
from modules.servo import Servo


class Schedules:
    __instance = None

    _servo: Servo
    _schedule: Schedule
    _api: Api

    def __init__(self) -> None:
        self._servo = Servo.create()
        self._schedule = Schedule.create()
        self._api = Api.create()

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

                        required_failures = []
                        optional_failures = []

                        for item in items:
                            slot = item.get("slot")
                            quantity = item.get("quantity", 1)
                            is_required = item.get("isRequired", True)

                            print(
                                f"[Schedule] Dispensing slot '{slot}' with quantity {quantity}..."
                            )
                            success = await self._servo.drop(
                                slot=slot,
                                quantity=quantity,
                            )

                            if not success:
                                failure = {
                                    "slot": slot,
                                    "quantity": quantity,
                                    "medicine": item.get("medicine"),
                                    "dosage": item.get("dosage"),
                                    "isRequired": is_required,
                                }
                                if is_required:
                                    required_failures.append(failure)
                                else:
                                    optional_failures.append(failure)

                            await asyncio.sleep(1.0)

                        notification_payload = {
                            "requiredFailures": required_failures,
                            "optionalFailures": optional_failures,
                        }

                        if required_failures:
                            print(
                                f"[Schedule] Schedule {schedule_id} failed: {len(required_failures)} required item(s) and {len(optional_failures)} optional item(s) failed."
                            )
                            _ = await self._schedule.update_status(
                                str(schedule_id), "failed"
                            )
                            _ = await self._api.post(
                                "/api/notifications/send",
                                data={
                                    "scheduleId": str(schedule_id),
                                    "level": "error",
                                    "title": "Schedule failed",
                                    "body": (
                                        f"Schedule {schedule_id} failed because "
                                        "one or more required items were not dispensed."
                                    ),
                                    "payload": notification_payload,
                                },
                            )

                        elif optional_failures:
                            print(
                                f"[Schedule] Schedule {schedule_id} completed with {len(optional_failures)} optional item(s) not dispensed."
                            )
                            _ = await self._schedule.update_status(
                                str(schedule_id), "completed"
                            )
                            _ = await self._api.post(
                                "/api/notifications/send",
                                data={
                                    "scheduleId": str(schedule_id),
                                    "level": "warning",
                                    "title": "Schedule completed with warnings",
                                    "body": (
                                        f"Schedule {schedule_id} completed, "
                                        "but some optional items were not dispensed."
                                    ),
                                    "payload": {"optionalFailures": optional_failures},
                                },
                            )

                        else:
                            print(
                                f"[Schedule] Schedule {schedule_id} dispensed successfully."
                            )
                            _ = await self._schedule.update_status(
                                str(schedule_id), "completed"
                            )
                            _ = await self._api.post(
                                "/api/notifications/send",
                                data={
                                    "scheduleId": str(schedule_id),
                                    "level": "info",
                                    "title": "Schedule completed",
                                    "body": (
                                        f"Schedule {schedule_id} was completed "
                                        "successfully."
                                    ),
                                    "payload": {},
                                },
                            )

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
