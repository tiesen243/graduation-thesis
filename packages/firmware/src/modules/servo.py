import time

import uasyncio

from lib.pins import Pins
from lib.states import States


class Servo:
    _instance = None

    def __init__(self) -> None:
        self._states = States.create()

        pins = Pins.create()
        self._servos = pins.servos

    def control(self, index: int, pulse_us: int) -> None:
        if 0 <= index < len(self._servos):
            duty = 0 if pulse_us == 0 else int((pulse_us / 20000) * 65535)
            self._servos[index].duty_u16(duty)

    async def drop(self, slot: str, quantity: int, timeout_per_pill: int = 8) -> bool:
        slot_map = {"0-0": 0, "0-1": 1, "1-0": 2, "1-1": 3}
        servo_index = slot_map.get(slot)

        if servo_index is None:
            print(f"[ERROR] Invalid slot: {slot}")
            return False

        for i in range(quantity):
            # Reset đếm thuốc ngay trước mỗi viên
            self._states.drop_count = 0
            start_time = time.ticks_ms()  # pyright: ignore[reportAttributeAccessIssue]
            timeout_ms = timeout_per_pill * 1000

            self.control(servo_index, 1300)

            pill_dropped = False
            while time.ticks_diff(time.ticks_ms(), start_time) < timeout_ms:  # pyright: ignore[reportAttributeAccessIssue]
                if self._states.drop_count >= 1:
                    pill_dropped = True
                    break
                await uasyncio.sleep(0.01)

            self.control(servo_index, 0)

            if not pill_dropped:
                print(
                    f"[ERROR] Slot {slot} timeout! Target: 1, Current count: {self._states.drop_count}"
                )
                return False

            print(f"[INFO] Slot {slot} dropped pill {i + 1}/{quantity}.")
            await uasyncio.sleep(1.0)

        print(f"[SUCCESS] Slot {slot} successfully dropped {quantity} pills.")
        return True

    @classmethod
    def create(cls) -> Servo:
        if cls._instance is None:
            cls._instance = Servo()
        return cls._instance
