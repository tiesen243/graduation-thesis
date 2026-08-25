from machine import Pin

from lib.api_client import ApiClient

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
            led.value(int(payload))

    async def start(self) -> None:
        if not self.api_client:
            raise ValueError("API client is not initialized.")

        await self.api_client.stream("/api/devices/subscribe", self._handle_payload)
