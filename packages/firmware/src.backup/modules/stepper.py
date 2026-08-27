import asyncio
from machine import Pin
from lib.pins import Pins

class StepperMotor:
    # Ma trận Half-step chuẩn cho động cơ 28BYJ-48 + mạch ULN2003
    HALF_STEP = [
        [1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0],
        [0, 0, 1, 0], [0, 0, 1, 1], [0, 0, 0, 1], [1, 0, 0, 1]
    ]

    def __init__(self, pin_objects: list[Pin]):
        self.pins = pin_objects
        self.off()

    def off(self):
        """Cắt điện để motor không bị nóng khi đứng im"""
        for p in self.pins:
            p.value(0)

    async def move(self, steps: int, delay_ms: int = 2) -> None:
        direction = 1 if steps > 0 else -1
        step_index = 0
        
        for _ in range(abs(steps)):
            for i in range(4):
                self.pins[i].value(self.HALF_STEP[step_index][i])
            
            if direction == 1:
                step_index = (step_index + 1) % 8
            else:
                step_index = (step_index - 1) % 8
                
            await asyncio.sleep_ms(delay_ms) # Không làm đứng luồng chính
            
        self.off() 

class Steppers:
    __instance = None

    def __init__(self):
        pins = Pins.create()
        # Lưu ý: Cần khai báo 2 mảng chân (ví dụ: [16,17,18,19]) trong pins.py
        self.drawer = StepperMotor(pins.stepper_drawer_pins)
        self.discard = StepperMotor(pins.stepper_discard_pins)

    @classmethod
    def create(cls) -> "Steppers":
        if cls.__instance is None:
            cls.__instance = Steppers()
        return cls.__instance
