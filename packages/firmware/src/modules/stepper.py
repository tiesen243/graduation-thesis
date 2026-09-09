import uasyncio
from machine import Pin

from lib.pins import Pins

FULL_STEP = [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 0, 0, 1],
]


class StepperMotor:
    def __init__(self, pins: list[Pin]) -> None:
        self.pins = pins
        self.step_index = 0
        self.off()

    def off(self) -> None:
        for p in self.pins:
            p.value(0)

    async def move(self, steps: int, delay_ms: int = 3) -> None:
        direction = 1 if steps > 0 else -1

        for _ in range(abs(steps)):
            self.step_index = (self.step_index + direction) % 4

            for i in range(4):
                self.pins[i].value(FULL_STEP[self.step_index][i])

            await uasyncio.sleep_ms(delay_ms)

        self.off()


class Stepper:
    __instance: Stepper | None = None

    def __init__(self) -> None:
        pins = Pins.create()
        self.discard = StepperMotor(pins.stepper_discard)
        self.drawer = StepperMotor(pins.stepper_drawer)

    def off_all(self) -> None:
        self.discard.off()
        self.drawer.off()

    @classmethod
    def create(cls) -> Stepper:
        if cls.__instance is None:
            cls.__instance = Stepper()
        return cls.__instance
