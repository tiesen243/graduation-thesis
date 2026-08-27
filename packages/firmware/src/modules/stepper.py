import asyncio

from machine import Pin

from lib.pins import Pins

HALF_STEP = [
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 1],
]


class StepperMotor:
    __instance: StepperMotor | None = None

    pins: list[Pin]

    def __init__(self, pins: list[Pin]) -> None:
        self.pins = pins
        self.off()

    def off(self) -> None:
        for p in self.pins:
            p.value(0)

    async def move(self, steps: int, delay_ms: int = 2) -> None:
        direction = 1 if steps > 0 else -1
        step_index = 0

        for _ in range(abs(steps)):
            for i in range(4):
                self.pins[i].value(HALF_STEP[step_index][i])

            step_index = (step_index + direction) % 8

            await asyncio.sleep_ms(delay_ms)  # pyright: ignore[reportAttributeAccessIssue]

        self.off()

    @classmethod
    def create(cls, pins: list[Pin]) -> StepperMotor:
        if cls.__instance is None:
            cls.__instance = StepperMotor(pins)
        return cls.__instance


class Stepper:
    __instance: Stepper | None = None

    def __init__(
        self,
    ) -> None:
        pins = Pins.create()

        self.discard = StepperMotor.create(pins.stepper_discard)
        self.drawer = StepperMotor.create(pins.stepper_drawer)

    @classmethod
    def create(cls) -> Stepper:
        if cls.__instance is None:
            cls.__instance = Stepper()
        return cls.__instance
