import time

from machine import Pin

from lib.pins import Pins
from lib.states import States


class Sensor:
    __instance: Sensor | None = None

    def __init__(self) -> None:
        self._states = States()

        pins = Pins.create()
        _ = pins.sensor.irq(trigger=Pin.IRQ_FALLING, handler=self._irq)

    def _irq(self, _pin: Pin) -> None:
        current_time: int = time.ticks_ms()  # pyright: ignore[reportAttributeAccessIssue]

        if time.ticks_diff(current_time, self._states.last_trigger_time) > 80:  # pyright: ignore[reportAttributeAccessIssue]
            self._states.pill_count += 1
            self._states.last_trigger_time = current_time
            print(
                f"\n[SENSOR IRQ] Pill detected! Total count: {self._states.pill_count}"
            )

    @classmethod
    def create(cls) -> Sensor:
        if cls.__instance is None:
            cls.__instance = Sensor()
        return cls.__instance
