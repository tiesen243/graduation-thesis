import asyncio

from machine import Pin

from lib.api import Api
from lib.config import Config
from lib.i18n import t
from lib.pins import Pins
from lib.schedule import Schedule
from modules.servo import Servo
from modules.stepper import Stepper
from tasks.display import Display


class Drop:
    __instance: Drop | None = None

    _api: Api
    _servo: Servo
    _stepper: Stepper
    _schedule: Schedule
    _display: Display

    _buzzer: Pin
    _sensor_pin: Pin
    _sensor_check_detected: bool

    _open_timeout: int
    _close_timeout: int

    def __init__(self) -> None:
        self._api = Api.create()
        self._servo = Servo.create()
        self._stepper = Stepper.create()
        self._schedule = Schedule.create()
        self._display = Display.create()

        pins = Pins.create()
        self._buzzer = pins.buzzer
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
            print(t("drop.deducting", slots=slots_payload))
            await self._api.post(
                "/api/devices/update-capacity",
                data={
                    "mode": "subtraction",
                    "slots": slots_payload,
                },
            )

    async def _handle_post_dispense_sequence(self) -> bool:
        """Executes drawer opening/closing sequence and monitors the discard bin for uncollected items."""
        print(t("drop.opening_drawer"))
        await self._stepper.move_drawer(deg=90)
        self._buzzer.value(1)  # Turn on buzzer to alert user to retrieve items

        print(t("drop.waiting_retrieve", seconds=self._open_timeout))
        await asyncio.sleep(self._open_timeout)

        print(t("drop.closing_drawer"))
        await self._stepper.move_drawer(deg=-90)
        self._buzzer.value(0)  # Turn off buzzer after discard flap closes

        # Attach interrupt to monitor discard bin before opening flap
        self._sensor_check_detected = False
        _ = self._sensor_pin.irq(
            trigger=Pin.IRQ_FALLING, handler=self._sensor_check_irq_handler
        )

        print(t("drop.opening_discard"))
        await self._stepper.move_discard(deg=90)

        print(t("drop.waiting_discard", seconds=self._close_timeout))
        await asyncio.sleep(self._close_timeout)

        print(t("drop.closing_discard"))
        await self._stepper.move_discard(deg=-90)

        # Disable sensor interrupt after check window completes
        _ = self._sensor_pin.irq(handler=None)

        if self._sensor_check_detected:
            print(t("drop.not_taken_error"))
            return False

        print(t("drop.discard_check_clear"))
        return True

    async def execute(self, items: list[dict], schedule_id: str | None = None) -> bool:
        """Executes full dispensing flow: Servo drops -> Deduct actual capacity -> Drawer & Discard sequence -> API Notifications."""
        required_failures = []
        optional_failures = []
        dispensed_successfully = []

        for item in items:
            slot = item.get("slot")
            quantity = item.get("quantity", 1)
            is_required = item.get("isRequired", True)
            if not slot:
                print(t("drop.invalid_item", item=item))
                continue

            print(t("drop.dispensing", slot=slot, quantity=quantity))

            success, actual_qty = await self._servo.drop(slot=slot, quantity=quantity)
            if actual_qty > 0:
                dispensed_successfully.append({"slot": slot, "quantity": actual_qty})

            if not success:
                failure = {
                    "slot": slot,
                    "medicine": item.get("medicine"),
                    "quantity": max(0, quantity - actual_qty),
                }
                if is_required:
                    required_failures.append(failure)
                else:
                    optional_failures.append(failure)
            await asyncio.sleep(1)

        # Deduct actual capacity immediately for items physically dropped out of storage slots
        if dispensed_successfully:
            await self._deduct_medicine_capacity(dispensed_successfully)

        payload = {}
        if required_failures:
            payload["required_failures"] = required_failures
        if optional_failures:
            payload["optional_failures"] = optional_failures

        data = {
            "level": "error",
            "title": t("notification.drop_failure"),
            "payload": payload,
        }

        if schedule_id:
            data["scheduleId"] = schedule_id
            data["body"] = t("notification.schedule_required_failed")
        else:
            data["scheduleId"] = None
            data["body"] = t("notification.required_failed")

        # Handle required dispensing failures immediately. A schedule_id means
        # this was triggered automatically by the device schedule; without it,
        # the request came manually from the app.
        if required_failures:
            print(
                t(
                    "drop.required_failed",
                    count=len(required_failures),
                )
            )
            await self._api.post("/api/notifications/send", data=data)
            if schedule_id:
                _ = await self._schedule.update_status(schedule_id, "failed")
            self._display.show_drop_result(
                False,
                t("lcd.auto_failed") if schedule_id else t("lcd.manual_failed"),
                t("lcd.drop_item_failed"),
            )
            return False

        # Open drawer and handle discard sequence
        discard_clean = await self._handle_post_dispense_sequence()
        if not discard_clean:
            data["level"] = "error"
            data["title"] = t("notification.medication_not_taken")
            data["body"] = t("notification.patient_not_taken")

            if schedule_id:
                await self._schedule.update_status(schedule_id, "failed")

            await self._api.post("/api/notifications/send", data=data)
            self._display.show_drop_result(
                False,
                t("lcd.auto_failed") if schedule_id else t("lcd.manual_failed"),
                t("lcd.drop_not_taken"),
            )
            return False

        # Process optional failures or clean success
        if optional_failures:
            print(t("drop.success_warning", count=len(optional_failures)))
            data["level"] = "warning"
            data["title"] = t("notification.schedule_warning")
            if schedule_id:
                await self._schedule.update_status(schedule_id, "completed")
                data["body"] = t("notification.schedule_optional_warning")
            else:
                data["body"] = t("notification.optional_warning")
            await self._api.post("/api/notifications/send", data=data)
            self._display.show_drop_result(
                True,
                t("lcd.auto_done") if schedule_id else t("lcd.manual_done"),
                t("lcd.drop_warning"),
            )
            return True

        print(t("drop.success"))
        data["level"] = "info"
        data["title"] = t("notification.drop_completed")
        data["payload"] = {}

        if schedule_id:
            await self._schedule.update_status(schedule_id, "completed")
            data["body"] = t("notification.schedule_completed")
        else:
            data["body"] = t("notification.drop_success")

        await self._api.post("/api/notifications/send", data=data)
        self._display.show_drop_result(
            True,
            t("lcd.auto_done") if schedule_id else t("lcd.manual_done"),
            t("lcd.drop_completed"),
        )
        return True

    @classmethod
    def create(cls) -> Drop:
        if cls.__instance is None:
            cls.__instance = Drop()
        return cls.__instance
