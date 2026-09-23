import asyncio
import time

from machine import Pin

from lib.config import Config
from lib.pins import Pins


class Servo:
    __instance: Servo | None = None

    _SPEED_PRESETS = {  # noqa: RUF012
        1: (2, 20),  # Very Slow
        2: (5, 15),  # Slow
        3: (10, 10),  # Medium
        4: (20, 5),  # Fast
    }
    _timeout: int

    def __init__(self) -> None:
        pins = Pins.create()
        self._servo_map = {
            "0-0": pins.servos[0],
            "0-1": pins.servos[1],
            "1-0": pins.servos[2],
            "1-1": pins.servos[3],
        }
        self._current_pulses: dict[str, int] = {slot: 1500 for slot in self._servo_map}
        self._sensor_pin = pins.sensor_drop
        self._drop_detected = False

        config = Config.create()
        self._timeout = config.get("timeouts", {}).get("drop", 5)

    def _irq_handler(self, _pin: Pin) -> None:
        """Interrupt service routine triggered when an item drop is detected by the sensor."""
        self._drop_detected = True

    async def control(self, slot: str, pulse_us: int, speed: int = 3) -> bool:
        """Control servo position with real-time drop detection check inside the step loop."""
        servo = self._servo_map.get(slot)
        if not servo:
            print(f"[Servo] Servo not found for slot '{slot}'")
            return False

        if pulse_us == 0:
            servo.duty_u16(0)
            return False

        step_us, delay_ms = self._SPEED_PRESETS.get(speed, self._SPEED_PRESETS[3])
        current = self._current_pulses.get(slot, 1500)

        if current != pulse_us:
            step = step_us if pulse_us > current else -step_us
            for p in range(current, pulse_us, step):
                # Break immediately whenever a drop is detected
                if self._drop_detected:
                    self._current_pulses[slot] = p
                    return True

                duty = int((p / 20000) * 65535)
                servo.duty_u16(duty)
                await asyncio.sleep(delay_ms / 1000)

        duty = int((pulse_us / 20000) * 65535)
        servo.duty_u16(duty)
        self._current_pulses[slot] = pulse_us
        return self._drop_detected

    def stop(self, slot: str | None = None) -> None:
        """Disable PWM output so the servo no longer receives holding pulses."""
        if slot is None:
            servos = self._servo_map.values()
        else:
            servo = self._servo_map.get(slot)
            servos = (servo,) if servo is not None else ()

        for servo in servos:
            servo.duty_u16(0)

    async def drop(self, slot: str, quantity: int = 1) -> tuple[bool, int]:
        """Dispense items and always disable the servo PWM when finished."""
        print(f"[Servo] Slot {slot} | Starting dispensing: {quantity} items...")
        dispensed_count = 0

        try:
            for i in range(quantity):
                self._drop_detected = False
                _ = self._sensor_pin.irq(
                    trigger=Pin.IRQ_FALLING,
                    handler=self._irq_handler,
                )

                start_time = time.time()
                pill_dropped = False
                control_task = asyncio.create_task(
                    self.control(slot, pulse_us=1300, speed=1)
                )

                try:
                    while not pill_dropped:
                        if self._drop_detected:
                            pill_dropped = True
                            dispensed_count += 1
                            control_task.cancel()
                            print(
                                f"[Servo] Slot {slot} | "
                                f"Item {i + 1} dispensed successfully!"
                            )
                            break

                        if (time.time() - start_time) > self._timeout:
                            control_task.cancel()
                            print(
                                f"[Servo] Slot {slot} Timeout while "
                                f"dispensing item {i + 1}!"
                            )
                            break

                        await asyncio.sleep(0.005)
                finally:
                    control_task.cancel()
                    try:
                        await control_task
                    except asyncio.CancelledError:
                        pass
                    self._sensor_pin.irq(handler=None)

                # Reset drop flag before moving back to idle.
                self._drop_detected = False

                # Return to idle, then immediately disable PWM so the servo
                # does not keep receiving holding pulses.
                await self.control(slot, pulse_us=1500, speed=3)
                self.stop(slot)
                await asyncio.sleep(0.2)

                if not pill_dropped:
                    return False, dispensed_count

            print(
                f"[Servo] Slot {slot} successfully dispensed "
                f"{dispensed_count}/{quantity} items!"
            )
            return True, dispensed_count
        finally:
            # Safety net for timeout, cancellation, or unexpected exceptions.
            self._sensor_pin.irq(handler=None)
            self._drop_detected = False
            self.stop(slot)

    @classmethod
    def create(cls) -> Servo:
        if cls.__instance is None:
            cls.__instance = Servo()
        return cls.__instance
