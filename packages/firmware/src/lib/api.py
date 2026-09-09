import gc

import uasyncio
import urequests

from lib.config import Config


class Api:
    __instance: Api | None = None

    base_url: str
    base_headers: dict

    def __init__(self) -> None:
        config = Config.create()
        api_config: dict = config.get("api", {})

        self.base_url = api_config.get("url", "")
        self.base_headers = {
            "Authorization": f"Bearer {api_config.get('token')}",
            "x-vercel-protection-bypass": api_config.get("bypass_token"),
            "Content-Type": "application/json",
        }

    def _parse_url(self, url: str) -> tuple[str, str, int, str]:
        proto, _, host_path = url.partition("://")
        if not host_path:
            host_path = proto
            proto = "http"

        host, _, path = host_path.partition("/")
        path = "/" + path

        if ":" in host:
            host, port_str = host.split(":")
            port = int(port_str)
        else:
            port = 443 if proto == "https" else 80

        return proto, host, port, path

    async def get(self, endpoint: str, params: dict | None = None) -> dict:
        url = f"{self.base_url}{endpoint}"
        if params:
            query_string = "&".join(f"{key}={value}" for key, value in params.items())
            url = f"{url}?{query_string}"

        try:
            await uasyncio.sleep(0)  # Nhường CPU trước khi gọi HTTP synchronous
            res = urequests.get(url, headers=self.base_headers)
            if res.status_code != 200:
                return {"error": f"Status code: {res.status_code}"}
            return res.json()
        except Exception as e:  # noqa: BLE001
            return {"error": str(e)}

    async def post(self, endpoint: str, data: dict | None = None) -> dict:
        url = f"{self.base_url}{endpoint}"
        try:
            await uasyncio.sleep(0)
            res = urequests.post(url, headers=self.base_headers, json=data)
            if res.status_code not in (200, 201):
                return {"error": f"Status code: {res.status_code}"}
            return res.json()
        except Exception as e:  # noqa: BLE001
            return {"error": str(e)}

    async def stream(self, endpoint: str, callback, timeout: int = 30) -> None:  # pyright: ignore[reportMissingParameterType]
        url = f"{self.base_url}{endpoint}"
        proto, host, port, path = self._parse_url(url)
        use_ssl = proto == "https"

        reader = None
        writer = None

        try:
            _ = gc.collect()  # Giải phóng RAM trước khi mở SSL socket

            if use_ssl:
                reader, writer = await uasyncio.open_connection(host, port, ssl=True)
            else:
                reader, writer = await uasyncio.open_connection(host, port)

            req_lines = [
                f"GET {path} HTTP/1.1",
                f"Host: {host}",
                "Accept: text/event-stream",
                "Cache-Control: no-cache",
                "Connection: keep-alive",
            ]
            for key, val in self.base_headers.items():
                req_lines.append(f"{key}: {val}")

            req_data = "\r\n".join(req_lines) + "\r\n\r\n"
            writer.write(req_data.encode("utf-8"))
            await writer.drain()

            # Đọc line đầu tiên của Status Header
            first_line = await uasyncio.wait_for(reader.readline(), timeout=timeout)
            if not first_line or b"200" not in first_line:
                status = first_line.decode().strip() if first_line else "No response"
                print(f"[STREAM] Kết nối thất bại, status: {status}")
                return

            # Đọc bỏ header đến khi gặp dòng trống
            while True:
                h_line = await reader.readline()
                if h_line in (b"\r\n", b"\n", b""):
                    break

            # Đọc stream
            while True:
                try:
                    line_bytes = await uasyncio.wait_for(
                        reader.readline(), timeout=timeout
                    )
                except uasyncio.TimeoutError:
                    # Nếu timeout chỉ là do server yên ắng, ngắt loop để reconnect lại từ đầu
                    print("[STREAM] Reconnecting due to idle timeout...")
                    break

                if not line_bytes:
                    break

                line = line_bytes.decode("utf-8").strip()
                if line:
                    res_cb = callback(line)
                    if hasattr(res_cb, "send"):
                        await res_cb

                await uasyncio.sleep(0)

        except Exception as e:  # noqa: BLE001
            print(f"Error in streaming request to {url}: {e}")

        finally:
            if writer:
                try:
                    writer.close()
                    await writer.wait_closed()
                except Exception:  # noqa: BLE001, S110
                    pass
            _ = gc.collect()  # Dọn RAM sau khi đóng socket

    @classmethod
    def create(cls) -> Api:
        if cls.__instance is None:
            cls.__instance = Api()
        return cls.__instance
