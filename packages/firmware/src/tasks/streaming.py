import uasyncio
import ujson
from machine import Pin

from lib.api import Api

led = Pin("LED", Pin.OUT)


class Streaming:
    __instance: Streaming | None = None

    api: Api

    def __init__(self):
        self.api = Api.create()

    async def _handle_payload(self, line: str) -> None:
        if not line or line.startswith(":keep-alive"):
            return

        if line.startswith("data:"):
            line = line[5:].strip()

        try:
            data = ujson.loads(line)
        except ValueError as e:
            print(f"Failed to parse JSON: {e}")
            return

        action = data.get("action")
        payload = data.get("payload")

        if action == "led":
            print(f"Setting LED state to: {payload}")
            led.value(int(payload))

    async def start(self) -> None:
        retry_delay = 2
        max_delay = 60

        while True:
            try:
                await self.api.stream(
                    endpoint="/api/devices/subscribe",
                    callback=self._handle_payload,
                    timeout=30,
                )
                retry_delay = 2
            except Exception as e:  # noqa: BLE001
                print(f"Streaming error: {e}")

            print(f"Reconnecting in {retry_delay} seconds...")
            await uasyncio.sleep(retry_delay)

            retry_delay = min(retry_delay * 2, max_delay)

    @classmethod
    def create(cls) -> Streaming:
        if cls.__instance is None:
            cls.__instance = Streaming()
        return cls.__instance
