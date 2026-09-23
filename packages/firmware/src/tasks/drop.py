import asyncio

from machine import Pin

from lib.api import Api
from lib.config import Config
from lib.pins import Pins
from lib.schedule import Schedule
from modules.servo import Servo
from modules.stepper import Stepper


class Drop:
    __instance: Drop | None = None

    _api: Api
    _servo: Servo
    _stepper: Stepper
    _schedule: Schedule

    _sensor_pin: Pin
    _sensor_check_detected: bool

    _open_timeout: int
    _close_timeout: int

    def __init__(self) -> None:
        self._api = Api.create()
        self._servo = Servo.create()
        self._stepper = Stepper.create()
        self._schedule = Schedule.create()

        pins = Pins.create()
        self._sensor_pin = pins.sensor_check
        self._sensor_check_detected = False

        config = Config.create()
        timeouts = config.get("timeouts", {})
        self._open_timeout = timeouts.get("open", 5)
        self._close_timeout = timeouts.get("close", 5)

    def _sensor_check_irq_handler(self, _pin: Pin) -> None:
        """Interrupt service routine triggered when an item is detected falling into the discard bin."""
        self._sensor_check_detected = True

    async def _deduct_medicine_capacity(self, dispensed_items: list[dict]) -> None:
        """Deducts medicine capacity for slots where items were physically dispensed."""
        slots_payload = [
            {"position": item["slot"], "capacity": item["quantity"]}
            for item in dispensed_items
            if item.get("quantity", 0) > 0
        ]

        if slots_payload:
            print(f"[Drop] Deducting medicine capacity for slots: {slots_payload}")
            await self._api.post(
                "/api/devices/update-capacity",
                data={
                    "mode": "subtraction",
                    "slots": slots_payload,
                },
            )

    async def _handle_post_dispense_sequence(self) -> bool:
        """Executes drawer opening/closing sequence and monitors the discard bin for uncollected items."""
        print("[Drop] Opening drawer...")
        await self._stepper.move_drawer(deg=90)

        print(
            f"[Drop] Waiting {self._open_timeout} seconds for user to retrieve items..."
        )
        await asyncio.sleep(self._open_timeout)

        print("[Drop] Closing drawer...")
        await self._stepper.move_drawer(deg=-90)

        # Attach interrupt to monitor discard bin before opening flap
        self._sensor_check_detected = False
        _ = self._sensor_pin.irq(
            trigger=Pin.IRQ_FALLING, handler=self._sensor_check_irq_handler
        )

        print("[Drop] Opening discard flap...")
        await self._stepper.move_discard(deg=90)

        print(
            f"[Drop] Waiting {self._close_timeout} seconds for remaining items to drop into discard bin..."
        )
        await asyncio.sleep(self._close_timeout)

        print("[Drop] Closing discard flap...")
        await self._stepper.move_discard(deg=-90)

        # Disable sensor interrupt after check window completes
        _ = self._sensor_pin.irq(handler=None)

        if self._sensor_check_detected:
            print(
                "[Drop] Error: Patient did not take medication (items detected in discard bin)."
            )
            return False

        print("[Drop] Discard check clear: No leftover items detected.")
        return True

    async def execute(self, items: list[dict], schedule_id: str | None = None) -> bool:
        """Executes full dispensing flow: Servo drops -> Deduct actual capacity -> Drawer & Discard sequence -> API Notifications."""
        required_failures = []
        optional_failures = []
        dispensed_successfully = []

        for item in items:
            slot = item.get("slot")
            quantity = item.get("quantity", 1)
            is_required = item.get("required", True)
            if not slot:
                print(f"[Drop] Invalid item: {item}")
                continue

            print(
                f"[Drop] Dispensing slot '{slot}' with requested quantity {quantity}..."
            )

            success, actual_qty = await self._servo.drop(slot=slot, quantity=quantity)
            if actual_qty > 0:
                dispensed_successfully.append({"slot": slot, "quantity": actual_qty})

            if not success:
                failure = {
                    "slot": slot,
                    "medicine": item.get("medicine"),
                    "requested_quantity": quantity,
                    "dispensed_quantity": actual_qty,
                }
                if is_required:
                    required_failures.append(failure)
                else:
                    optional_failures.append(failure)
            await asyncio.sleep(1)

        # Deduct actual capacity immediately for items physically dropped out of storage slots
        if dispensed_successfully:
            await self._deduct_medicine_capacity(dispensed_successfully)

        payload = {
            "required_failures": required_failures,
            "optional_failures": optional_failures,
        }
        data = {"level": "error", "title": "Drop Failure", "payload": payload}

        if schedule_id:
            data["scheduleId"] = schedule_id
            data["body"] = (
                f"Schedule {schedule_id} failed because one or more required items were not fully dispensed."
            )
        else:
            data["scheduleId"] = None
            data["body"] = "One or more required items were not fully dispensed."

        # Handle required dispensing failures immediately
        if required_failures:
            print(f"[Drop] Failed with required failures: {len(required_failures)}")
            await self._api.post("/api/notifications/send", data=data)
            if schedule_id:
                _ = await self._schedule.update_status(schedule_id, "failed")
            return False

        # Open drawer and handle discard sequence
        discard_clean = await self._handle_post_dispense_sequence()
        if not discard_clean:
            data["level"] = "error"
            data["title"] = "Medication Not Taken"
            data["body"] = "Patient did not take the medication."

            if schedule_id:
                await self._schedule.update_status(schedule_id, "failed")

            await self._api.post("/api/notifications/send", data=data)
            return False

        # Process optional failures or clean success
        if optional_failures:
            print(
                f"[Drop] Successfully completed with warnings: {len(optional_failures)}"
            )
            data["level"] = "warning"
            data["title"] = "Schedule completed with warnings"
            if schedule_id:
                await self._schedule.update_status(schedule_id, "completed")
                data["body"] = (
                    f"Schedule {schedule_id} completed, but one or more optional items were not fully dispensed."
                )
            else:
                data["body"] = "One or more optional items were not fully dispensed."
            await self._api.post("/api/notifications/send", data=data)
            return True

        print("[Drop] Successfully completed whole workflow.")
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
