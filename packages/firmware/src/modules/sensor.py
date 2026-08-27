import time

from machine import Pin

from lib.pins import Pins
from lib.states import States


class Sensor:
    __instance: Sensor | None = None

    def __init__(self) -> None:
        self._states = States.create()

        pins = Pins.create()
        _ = pins.sensor_drop.irq(trigger=Pin.IRQ_FALLING, handler=self._drop_irq)
        _ = pins.sensor_check.irq(trigger=Pin.IRQ_FALLING, handler=self._check_irq)

    def _drop_irq(self, _pin: Pin) -> None:
        current_time: int = time.ticks_ms()  # pyright: ignore[reportAttributeAccessIssue]

        if time.ticks_diff(current_time, self._states.drop_last_trigger_time) > 80:  # pyright: ignore[reportAttributeAccessIssue]
            self._states.drop_count += 1
            self._states.drop_last_trigger_time = current_time
            print(
                f"\n[DROP SENSOR] Pill detected! Total count: {self._states.drop_count}"
            )

    def _check_irq(self, _pin: Pin) -> None:
        current_time: int = time.ticks_ms()  # pyright: ignore[reportAttributeAccessIssue]

        if time.ticks_diff(current_time, self._states.check_last_trigger_time) > 80:  # pyright: ignore[reportAttributeAccessIssue]
            self._states.check_count += 1
            self._states.check_last_trigger_time = current_time
            print(
                f"\n[CHECK SENSOR] Pill detected! Total count: {self._states.check_count}"
            )

    @classmethod
    def create(cls) -> Sensor:
        if cls.__instance is None:
            cls.__instance = Sensor()
        return cls.__instance
