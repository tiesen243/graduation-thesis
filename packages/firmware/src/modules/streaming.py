from lib.api_client import ApiClient


class Streaming:
    api_client: ApiClient | None = None

    def __init__(self):
        self.api_client = ApiClient()

    async def _handle_payload(self, payload: dict) -> None:
        print("Received payload:", payload)

    async def start(self) -> None:
        if not self.api_client:
            raise ValueError("API client is not initialized.")

        await self.api_client.stream("/api/devices/subcribe", self._handle_payload)
