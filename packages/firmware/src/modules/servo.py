import asyncio
import time

from machine import PWM, Pin

from lib.pins import Pins


class Servo:
    _instance = None

    def __init__(self) -> None:
        pins = Pins.create()
        self._servo_map = {
            "0-0": pins.servos[0],
            "0-1": pins.servos[1],
            "1-0": pins.servos[2],
            "1-1": pins.servos[3],
        }
        self._sensor_pin = pins.sensor_drop
        self._drop_detected = False

    def _irq_handler(self, _pin: Pin) -> None:
        self._drop_detected = True

    def control(self, servo: PWM, pulse_us: int) -> None:
        duty = 0 if pulse_us == 0 else int((pulse_us / 20000) * 65535)
        servo.duty_u16(duty)

    async def drop(self, slot: str, quantity: int = 1, timeout_sec: int = 3) -> bool:
        servo_obj = self._servo_map.get(slot)
        if not servo_obj:
            print(f"[Servo] Servo not found for slot '{slot}'")
            return False

        print(f"[Servo] Slot {slot} | Starting dispensing: {quantity} items...")

        for i in range(quantity):
            self._drop_detected = False
            # Attach the sensor interrupt
            _ = self._sensor_pin.irq(trigger=Pin.IRQ_FALLING, handler=self._irq_handler)

            self.control(servo_obj, 1300)

            pill_dropped = False
            start_time = time.time()

            while not pill_dropped:
                if self._drop_detected:
                    pill_dropped = True
                    print(f"[Servo] Slot {slot} | Item {i + 1} dispensed successfully!")
                    break

                # Check for timeout (for example, 3 seconds)
                if (time.time() - start_time) > timeout_sec:
                    print(f"[Servo] Slot {slot} Timeout while dispensing item {i + 1}!")
                    break

                await asyncio.sleep(0.01)

            # Disable the interrupt immediately after completion or timeout
            _ = self._sensor_pin.irq(handler=None)
            self.control(servo_obj, 0)
            await asyncio.sleep(0.3)

            # Report failure if no item was dispensed
            if not pill_dropped:
                return False

        print(f"[Servo] Slot {slot} successfully dispensed {quantity} items!")
        return True

    @classmethod
    def create(cls) -> Servo:
        if cls._instance is None:
            cls._instance = Servo()
        return cls._instance
