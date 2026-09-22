import asyncio
import time

from machine import Pin

from lib.pins import Pins


class Servo:
    """Singleton controller for managing PWM servo motors with speed control and item dispensing."""

    _instance = None

    _SPEED_PRESETS = {  # noqa: RUF012
        1: (2, 20),  # Very Slow
        2: (5, 15),  # Slow
        3: (10, 10),  # Medium
        4: (20, 5),  # Fast
    }

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

    def _irq_handler(self, _pin: Pin) -> None:
        """Interrupt service routine triggered when an item drop is detected by the sensor."""
        self._drop_detected = True

    async def control(self, slot: str, pulse_us: int, speed: int = 3) -> None:
        """Control servo position with preset rotation speed (1: Very Slow, 2: Slow, 3: Medium, 4: Fast)."""
        servo = self._servo_map.get(slot)
        if not servo:
            print(f"[Servo] Servo not found for slot '{slot}'")
            return

        if pulse_us == 0:
            servo.duty_u16(0)
            return

        step_us, delay_ms = self._SPEED_PRESETS.get(speed, self._SPEED_PRESETS[3])
        current = self._current_pulses.get(slot, 1500)

        if current != pulse_us:
            step = step_us if pulse_us > current else -step_us
            for p in range(current, pulse_us, step):
                duty = int((p / 20000) * 65535)
                servo.duty_u16(duty)
                await asyncio.sleep(delay_ms / 1000)

        duty = int((pulse_us / 20000) * 65535)
        servo.duty_u16(duty)
        self._current_pulses[slot] = pulse_us

    async def drop(self, slot: str, quantity: int = 1, timeout_sec: int = 3) -> bool:
        """Dispense a specified quantity of items using controlled servo movement and sensor feedback."""
        print(f"[Servo] Slot {slot} | Starting dispensing: {quantity} items...")

        for i in range(quantity):
            self._drop_detected = False
            _ = self._sensor_pin.irq(trigger=Pin.IRQ_FALLING, handler=self._irq_handler)

            await self.control(slot, pulse_us=1300, speed=1)

            pill_dropped = False
            start_time = time.time()

            while not pill_dropped:
                if self._drop_detected:
                    pill_dropped = True
                    print(f"[Servo] Slot {slot} | Item {i + 1} dispensed successfully!")
                    break

                if (time.time() - start_time) > timeout_sec:
                    print(f"[Servo] Slot {slot} Timeout while dispensing item {i + 1}!")
                    break

                await asyncio.sleep(0.01)

            _ = self._sensor_pin.irq(handler=None)

            # Return servo to idle position (1500us) instead of turning off PWM completely
            await self.control(slot, pulse_us=1500, speed=1)
            await asyncio.sleep(0.3)

            if not pill_dropped:
                return False

        print(f"[Servo] Slot {slot} successfully dispensed {quantity} items!")
        return True

    @classmethod
    def create(cls) -> Servo:
        """Factory method to get or create the Servo singleton instance."""
        if cls._instance is None:
            cls._instance = Servo()
        return cls._instance
