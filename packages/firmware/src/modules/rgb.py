from machine import Pin

from lib.pins import Pins


class RGB:
    __instance: RGB | None = None
    led_r: Pin
    led_g: Pin
    led_b: Pin

    def __init__(self) -> None:
        pins = Pins.create()
        self.led_r = pins.led_r
        self.led_g = pins.led_g
        self.led_b = pins.led_b

        self.set_color(0, 0, 0)

    def set_color(self, r: int, g: int, b: int) -> None:
        self.led_r.value(1 if r > 0 else 0)
        self.led_g.value(1 if g > 0 else 0)
        self.led_b.value(1 if b > 0 else 0)

    @classmethod
    def create(cls) -> RGB:
        if cls.__instance is None:
            cls.__instance = RGB()
        return cls.__instance
