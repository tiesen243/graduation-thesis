import asyncio

import ujson
import urequests
from machine import Pin

from lib.config import load_config

led = Pin("LED", Pin.OUT)


class Streaming:
    __instance: Streaming | None = None

    def __init__(self):
        pass

    async def _handle_payload(self, data: dict) -> None:
        print("Received payload:", data)
        action = data.get("action")
        payload = data.get("payload")

        if action == "led":
            print(f"Setting LED state to: {payload}")
            led.value(int(payload))  # pyright: ignore[reportArgumentType]

    async def _connect(self) -> None:
        """Thực hiện một phiên kết nối SSE."""
        config = load_config()
        api_config: dict = config.get("api", {})

        headers = {
            "Authorization": f"Bearer {api_config.get('token')}",
            "x-vercel-protection-bypass": api_config.get("bypass_token"),
            "Accept": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }

        res = None
        url = f"https://{api_config.get('host')}/api/devices/subscribe"
        print(f"Connecting to streaming endpoint: {url}")

        try:
            res = urequests.get(url, headers=headers, stream=True, timeout=30)

            if res.status_code != 200:
                print("Failed to connect, status:", res.status_code)
                print("Response content:", res.text)
                return

            print("Connected to stream successfully.")

            while True:
                line = res.raw.readline()
                if not line:
                    print("Server closed connection.")
                    break

                line = line.decode("utf-8").strip()

                if not line or line.startswith(":keep-alive"):
                    continue

                if line.startswith("data:"):
                    line = line[5:].strip()

                try:
                    payload = ujson.loads(line)
                    await self._handle_payload(payload)
                except Exception as e:  # noqa: BLE001
                    print("Error parsing payload:", e)

        finally:
            if res:
                res.close()

    async def start(self) -> None:
        retry_delay = 2
        max_delay = 60

        while True:
            try:
                await self._connect()
                retry_delay = 2
            except Exception as e:  # noqa: BLE001
                print(f"Streaming error: {e}")

            print(f"Reconnecting in {retry_delay} seconds...")
            await asyncio.sleep(retry_delay)

            retry_delay = min(retry_delay * 2, max_delay)

    @classmethod
    def create(cls) -> Streaming:
        if cls.__instance is None:
            cls.__instance = Streaming()
        return cls.__instance
