import ujson
import urequests
from machine import Pin

from lib.api_client import ApiClient
from lib.config import load_config

led = Pin("LED", Pin.OUT)


class Streaming:
    api_client: ApiClient | None = None

    def __init__(self):
        self.api_client = ApiClient()

    async def _handle_payload(self, data: dict) -> None:
        print("Received payload:", data)

        action = data.get("action")
        payload = data.get("payload")

        if action == "led":
            print(f"Setting LED state to: {payload}")
            led.value(int(payload))  # pyright: ignore[reportArgumentType]

    async def start(self) -> None:
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
                print("Failed to connect to the streaming endpoint:", res.status_code)
                return

            while True:
                line = res.raw.readline()
                if not line:
                    break

                line = line.decode("utf-8").strip()

                if not line:
                    continue

                if line.startswith(":keep-alive"):
                    continue

                if line.startswith("data:"):
                    line = line[5:].strip()

                try:
                    payload = ujson.loads(line)  # pyright: ignore[reportAny]
                    await self._handle_payload(payload)  # pyright: ignore[reportAny]
                except Exception as e:  # noqa: BLE001
                    print("Error processing line:", e)

        except Exception as e:  # noqa: BLE001
            print("Error in streaming:", e)

        finally:
            if res:
                res.close()
