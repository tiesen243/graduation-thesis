import time

import uasyncio

from lib.api import Api
from lib.schedule import Schedule
from lib.utils import get_current_time, print_table
from modules.servo import Servo


class Schedules:
    _instance = None

    def __init__(self) -> None:
        self.servo = Servo.create()
        self.schedule = Schedule.create()
        self.api = Api.create()

    async def start(self, schedules_data: list | None = None) -> None:
        print("[STARTUP] Schedules task active...\n")
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
                        else self.schedule.get_schedules()
                    )

                    sec = now[5] if len(now) > 5 else 0
                    print(
                        f"\n[SCHEDULE] [{cur_date} {cur_time}:{sec:02d}] Check schedules..."
                    )
                    print_table(schedules, keys=["id", "date", "time", "status"])

                    for item_sch in schedules:
                        if item_sch.get("status", "pending") != "pending":
                            continue

                        sch_time = (item_sch.get("time") or "")[:5]
                        sch_date = item_sch.get("date")

                        if sch_time == cur_time and (
                            not sch_date or sch_date == cur_date
                        ):
                            sch_id = item_sch.get("id")
                            items = item_sch.get("items", [])
                            print(f"\n---> EXECUTE SCHEDULE {sch_id}")

                            slot_errors = []

                            for item in items:
                                slot = item.get("slot")
                                qty = item.get("quantity", 1)

                                print(
                                    f"[SCHEDULE] Gọi Servo nhả Slot '{slot}' x {qty} viên..."
                                )
                                success = await self.servo.drop(slot=slot, quantity=qty)

                                if not success:
                                    slot_errors.append({"slot": slot, "quantity": qty})
                                await uasyncio.sleep(1.0)

                            if len(slot_errors) == 0:
                                print(f"[SCHEDULE] Lịch {sch_id} đã nhả đủ thuốc!")
                                _ = await self.schedule.update_status(
                                    str(sch_id), "completed"
                                )
                                _ = await self.api.post(
                                    "/api/notifications/send",
                                    data={
                                        "scheduleId": str(sch_id),
                                        "level": "info",
                                        "title": "Schedule completed",
                                        "body": f"Schedule {sch_id} has been completed successfully.",
                                        "payload": {},
                                    },
                                )

                            else:
                                print(f"[SCHEDULE] Lịch {sch_id} thất bại!")
                                _ = await self.schedule.update_status(
                                    str(sch_id), "failed"
                                )
                                _ = await self.api.post(
                                    "/api/notifications/send",
                                    data={
                                        "scheduleId": str(sch_id),
                                        "level": "error",
                                        "title": "Schedule failed",
                                        "body": f"Schedule {sch_id} has failed to complete.",
                                        "payload": {"failed_slots": slot_errors},
                                    },
                                )

            except Exception as e:  # noqa: BLE001
                print(f"[SCHEDULE] Error: {e}")

            # Tính toán chính xác ms còn lại đến giây tiếp theo để chống trôi thời gian
            ms_to_next_second = 1000 - (time.ticks_ms() % 1000)
            await uasyncio.sleep_ms(ms_to_next_second)

    @classmethod
    def create(cls) -> Schedules:
        if cls._instance is None:
            cls._instance = Schedules()
        return cls._instance
