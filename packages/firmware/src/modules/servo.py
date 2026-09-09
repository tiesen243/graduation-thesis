import time

import uasyncio
from machine import PWM, Pin

from lib.pins import Pins


class Servo:
    _instance = None

    def __init__(self) -> None:
        pins = Pins.create()
        self.servo_map = {
            "0-0": pins.servos[0],
            "0-1": pins.servos[1],
            "1-0": pins.servos[2],
            "1-1": pins.servos[3],
        }
        self.sensor_pin = pins.sensor_drop
        self._drop_detected = False

    def _irq_handler(self, _pin: Pin) -> None:
        self._drop_detected = True

    def control(self, servo: PWM, pulse_us: int) -> None:
        duty = 0 if pulse_us == 0 else int((pulse_us / 20000) * 65535)
        servo.duty_u16(duty)

    async def drop(self, slot: str, quantity: int = 1, timeout_ms: int = 3000) -> bool:
        servo_obj = self.servo_map.get(slot)
        if not servo_obj:
            print(f"[SERVO] Không tìm thấy Servo cho slot '{slot}'")
            return False

        print(f"[SERVO] Slot {slot} | Bắt đầu nhả: {quantity} viên...")

        for i in range(quantity):
            self._drop_detected = False
            # Gán ngắt cảm biến
            _ = self.sensor_pin.irq(trigger=Pin.IRQ_FALLING, handler=self._irq_handler)

            self.control(servo_obj, 1300)

            pill_dropped = False
            start_time = time.ticks_ms()

            while not pill_dropped:
                if self._drop_detected:
                    pill_dropped = True
                    print(f"[SERVO] Slot {slot} | Viên thứ {i + 1} đã nhả thành công!")
                    break

                # Kiểm tra quá thời gian timeout (ví dụ: 3 giây)
                if time.ticks_diff(time.ticks_ms(), start_time) > timeout_ms:
                    print(f"[SERVO] Slot {slot} Timeout ở viên thứ {i + 1}!")
                    break

                await uasyncio.sleep_ms(10)

            # Tắt ngắt lập tức sau khi xong hoặc timeout
            self.sensor_pin.irq(handler=None)
            self.control(servo_obj, 0)
            await uasyncio.sleep_ms(300)

            # Nếu không rớt viên nào thì báo thất bại luôn
            if not pill_dropped:
                return False

        print(f"[SERVO] Slot {slot} đã nhả đủ {quantity} viên!")
        return True

    @classmethod
    def create(cls) -> Servo:
        if cls._instance is None:
            cls._instance = Servo()
        return cls._instance
