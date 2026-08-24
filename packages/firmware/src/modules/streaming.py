from lib.api_client import ApiClient


class Streaming:
    api_client: ApiClient | None = None

    def __init__(self):
        self.api_client = ApiClient()

    async def start(self) -> None:
        if not self.api_client:
            raise ValueError("API client is not initialized.")

        async for payload in self.api_client.stream("/stream"):
            print("Received payload:", payload)
