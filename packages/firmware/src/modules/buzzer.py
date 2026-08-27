import time

from machine import PWM

from lib.pins import Pins


class Buzzer:
    __instance: Buzzer | None = None

    pin: PWM

    def __init__(self) -> None:
        pins = Pins.create()
        self.pin = pins.buzzer

    def ring(self, count: int = 3, freq: int = 2000, delay_ms: int = 100) -> None:
        self.pin.freq(freq)

        for _ in range(count):
            self.pin.duty_u16(32768)
            time.sleep_ms(delay_ms)  # pyright: ignore[reportAttributeAccessIssue]
            self.pin.duty_u16(0)
            time.sleep_ms(delay_ms)  # pyright: ignore[reportAttributeAccessIssue]

    @classmethod
    def create(cls) -> Buzzer:
        if cls.__instance is None:
            cls.__instance = Buzzer()
        return cls.__instance
