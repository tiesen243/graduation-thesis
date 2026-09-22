import asyncio

from lib.api import Api
from lib.schedule import Schedule
from modules.servo import Servo
from modules.stepper import Stepper


class Drop:
    __instance: Drop | None = None

    _api: Api
    _servo: Servo
    _stepper: Stepper
    _schedule: Schedule

    def __init__(self) -> None:
        self._api = Api.create()
        self._servo = Servo.create()
        self._stepper = Stepper.create()
        self._schedule = Schedule.create()

    async def execute(self, items: list[dict], schedule_id: str | None = None) -> bool:
        required_failures = []
        optional_failures = []

        for item in items:
            slot = item.get("slot")
            quantity = item.get("quantity", 1)
            is_required = item.get("required", True)
            if not slot:
                print(f"[Drop] Invalid item: {item}")
                continue

            print(f"[Drop] Dispensing slot '{slot}' with quantity {quantity}...")
            success = await self._servo.drop(slot=slot, quantity=quantity)
            if not success:
                failure = {
                    "slot": slot,
                    "medicine": item.get("medicine"),
                    "quantity": quantity,
                }
                if is_required:
                    required_failures.append(failure)
                else:
                    optional_failures.append(failure)
            await asyncio.sleep(1)

        payload = {
            "required_failures": required_failures,
            "optional_failures": optional_failures,
        }
        data = {"level": "error", "title": "Drop Failure", "payload": payload}
        if schedule_id:
            data["scheduleId"] = schedule_id
            data["body"] = (
                f"Schedule {schedule_id} failed because one or more required items were not dispensed."
            )
        else:
            data["scheduleId"] = None
            data["body"] = "One or more required items were not dispensed."

        if required_failures:
            print(f"[Drop] Failed with required failures: {len(required_failures)}")
            await self._api.post("/api/notifications/send", data=data)
            if schedule_id:
                _ = await self._schedule.update_status(schedule_id, "failed")
            return False

        elif optional_failures:
            print(f"[Drop] Successfully wtih warnings: {len(optional_failures)}")
            data["level"] = "warning"
            data["title"] = "Schedule completed with warnings"
            if schedule_id:
                await self._schedule.update_status(schedule_id, "completed")
                data["body"] = (
                    f"Schedule {schedule_id} completed, but one or more optional items were not dispensed."
                )
            else:
                data["body"] = "One or more optional items were not dispensed."
            await self._api.post("/api/notifications/send", data=data)
            return True

        print("[Drop] Successfully completed.")
        data["level"] = "info"
        data["title"] = "Drop completed"
        data["payload"] = {}

        if schedule_id:
            await self._schedule.update_status(schedule_id, "completed")
            data["body"] = f"Schedule {schedule_id} completed successfully."
        else:
            data["body"] = "Drop completed successfully."
        await self._api.post("/api/notifications/send", data=data)

        return True

    @classmethod
    def create(cls) -> Drop:
        if cls.__instance is None:
            cls.__instance = Drop()
        return cls.__instance
