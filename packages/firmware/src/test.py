import asyncio

from modules.servo import Servo
from modules.stepper import Stepper

servo = Servo.create()
stepper = Stepper.create()


async def main():
    while True:
        await stepper.move_discard(deg=90)
        await stepper.move_drawer(deg=90)
        await asyncio.sleep(1)
        await stepper.move_discard(deg=-90)
        await stepper.move_drawer(deg=-90)
        await asyncio.sleep(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("[Test] Stopped by user.")
