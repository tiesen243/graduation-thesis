import asyncio

from machine import Pin

from lib.pins import Pins

STEPS_PER_REV = 2048

FULL_STEP = [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 0, 0, 1],
]


class StepperMotor:
    def __init__(self, pins: list[Pin]) -> None:
        self._pins = pins
        self._step_index = 0
        self.off()

    def off(self) -> None:
        for p in self._pins:
            p.value(0)

    async def move(self, deg: float, delay_ms: int = 3) -> None:
        if deg == 0:
            return

        direction = 1 if deg > 0 else -1
        steps = round((abs(deg) / 360.0) * STEPS_PER_REV)

        for _ in range(steps):
            self._step_index = (self._step_index + direction) % 4

            for i in range(4):
                self._pins[i].value(FULL_STEP[self._step_index][i])

            await asyncio.sleep(delay_ms / 1000)

        self.off()


class Stepper:
    __instance: Stepper | None = None

    def __init__(self) -> None:
        pins = Pins.create()
        self._discard = StepperMotor(pins.stepper_discard)
        self._drawer = StepperMotor(pins.stepper_drawer)

    def off_all(self) -> None:
        self._discard.off()
        self._drawer.off()

    async def move_discard(self, deg: float, delay_ms: int = 3) -> None:
        await self._discard.move(deg, delay_ms)

    async def move_drawer(self, deg: float, delay_ms: int = 3) -> None:
        await self._drawer.move(deg, delay_ms)

    @classmethod
    def create(cls) -> Stepper:
        if cls.__instance is None:
            cls.__instance = Stepper()
        return cls.__instance
