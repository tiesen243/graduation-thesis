from machine import Pin

from lib.pins import Pins


class Buzzer:
    __instance: Buzzer | None = None

    pin: Pin

    def __init__(self) -> None:
        pins = Pins.create()
        self.pin = pins.buzzer
        self.off()

    def on(self) -> None:
        self.pin.value(0)

    def off(self) -> None:
        self.pin.value(1)

    @classmethod
    def create(cls) -> Buzzer:
        if cls.__instance is None:
            cls.__instance = Buzzer()
        return cls.__instance
