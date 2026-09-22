import asyncio

from modules.servo import Servo

servo = Servo.create()


async def main():
    slot = "0-0"
    print(f"[Test] Starting continuous loop test for slot '{slot}'...")

    while True:
        print("[Test] Moving to 1300us...")
        await servo.control(slot, pulse_us=1300, speed=1)
        await asyncio.sleep(1)

        print("[Test] Returning to idle 1500us...")
        await servo.control(slot, pulse_us=1500, speed=1)
        await asyncio.sleep(1)

        await servo.control(slot, pulse_us=1300, speed=2)
        await asyncio.sleep(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("[Test] Stopped by user.")
