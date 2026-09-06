import uasyncio
import urequests

from lib.config import load_config


class Api:
    __instance: Api | None = None

    base_url: str
    base_headers: dict

    def __init__(self) -> None:
        config = load_config()
        api_config: dict = config.get("api", {})

        self.base_url = api_config.get("url", "")
        self.base_headers = {
            "Authorization": f"Bearer {api_config.get('token')}",
            "x-vercel-protection-bypass": api_config.get("bypass_token"),
            "Content-Type": "application/json",
        }

    async def get(self, endpoint: str, params: dict | None = None) -> dict:
        url = f"{self.base_url}{endpoint}"
        try:
            res = urequests.get(url, headers=self.base_headers, params=params)
            if res.status_code != 200:
                return {"error": f"Status code: {res.status_code}"}
            return res.json()
        except Exception as e:  # noqa: BLE001
            return {"error": str(e)}

    async def post(self, endpoint: str, data: dict | None = None) -> dict:
        url = f"{self.base_url}{endpoint}"
        try:
            res = urequests.post(url, headers=self.base_headers, json=data)
            if res.status_code not in (200, 201):
                return {"error": f"Status code: {res.status_code}"}
            return res.json()
        except Exception as e:  # noqa: BLE001
            return {"error": str(e)}

    async def stream(self, endpoint: str, callback, timeout: int = 10) -> None:  # pyright: ignore[reportMissingParameterType]
        url = f"{self.base_url}{endpoint}"
        headers = self.base_headers.copy()
        headers.update(
            {
                "Accept": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )

        res = None
        try:
            res = urequests.get(url, headers=headers, stream=True, timeout=timeout)
            if res.status_code != 200:
                print(f"Failed to connect to stream, status: {res.status_code}")
                return

            while True:
                line = res.raw.readline()
                if not line:
                    print("Server closed connection.")
                    break

                line = line.decode("utf-8").strip()

                res_cb = callback(line)
                if hasattr(res_cb, "send"):
                    await res_cb

                await uasyncio.sleep(0)

        except Exception as e:  # noqa: BLE001
            print(f"Error in streaming request to {url}: {e}")

        finally:
            if res:
                res.close()

    @classmethod
    def create(cls) -> Api:
        if cls.__instance is None:
            cls.__instance = Api()
        return cls.__instance
