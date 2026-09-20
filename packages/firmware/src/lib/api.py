import asyncio
import gc
import json

from lib.config import Config


class Api:
    __instance: Api | None = None

    _base_url: str
    _base_headers: dict

    def __init__(self) -> None:
        config = Config.create()
        api_config: dict = config.get("api", {})

        self._base_url = api_config.get("url", "")
        self._base_headers = {
            "Authorization": f"Bearer {api_config.get('token')}",
            "x-vercel-protection-bypass": api_config.get("bypass_token"),
            "Content-Type": "application/json",
        }

    async def _request(
        self, method: str, endpoint: str, body_data: dict | None = None
    ) -> dict:
        url = f"{self._base_url}{endpoint}"
        proto, host, port, path = self._parse_url(url)
        ssl = {"ssl": True} if proto == "https" else {}
        reader, writer = None, None

        try:
            _ = gc.collect()
            reader, writer = await asyncio.open_connection(host, port, **ssl)

            payload = json.dumps(body_data) if body_data else None
            req_lines = [
                f"{method.upper()} {path} HTTP/1.1",
                f"Host: {host}",
                "Connection: close",
            ]

            if payload:
                req_lines.append(f"Content-Length: {len(payload)}")

            for key, val in self._base_headers.items():
                req_lines.append(f"{key}: {val}")

            req_data = "\r\n".join(req_lines) + "\r\n\r\n"
            if payload:
                req_data += payload

            writer.write(req_data.encode("utf-8"))
            await writer.drain()

            status_line = await reader.readline()
            if not status_line:
                return {"error": "No response"}

            parts = status_line.decode("utf-8").split(" ")
            status_code = int(parts[1]) if len(parts) > 1 else 500

            while True:
                line = await reader.readline()
                if line in (b"\r\n", b"\n", b""):
                    break

            body_bytes = await reader.read()
            if status_code not in (200, 201):
                return {"error": f"Status code: {status_code}"}

            return json.loads(body_bytes.decode("utf-8"))

        except Exception as e:
            return {"error": str(e)}
        finally:
            if writer:
                try:
                    writer.close()
                    await writer.wait_closed()
                except Exception:
                    pass

            _ = gc.collect()

    async def get(self, endpoint: str, params: dict | None = None) -> dict:
        if params:
            query_string = "&".join(f"{key}={value}" for key, value in params.items())
            endpoint = f"{endpoint}?{query_string}"

        return await self._request("GET", endpoint)

    async def post(self, endpoint: str, data: dict | None = None) -> dict:
        return await self._request("POST", endpoint, body_data=data)

    async def stream(self, endpoint: str, callback, timeout: int = 30) -> None:  # pyright: ignore[reportMissingParameterType]
        url = f"{self._base_url}{endpoint}"
        proto, host, port, path = self._parse_url(url)
        ssl = {"ssl": True} if proto == "https" else {}
        reader, writer = None, None

        try:
            _ = gc.collect()
            reader, writer = await asyncio.open_connection(host, port, **ssl)

            req_lines = [
                f"GET {path} HTTP/1.1",
                f"Host: {host}",
                "Accept: text/event-stream",
                "Cache-Control: no-cache",
                "Connection: keep-alive",
            ]
            for key, val in self._base_headers.items():
                req_lines.append(f"{key}: {val}")

            req_data = "\r\n".join(req_lines) + "\r\n\r\n"
            writer.write(req_data.encode("utf-8"))
            await writer.drain()

            first_line = await asyncio.wait_for(reader.readline(), timeout=timeout)
            if not first_line or b"200" not in first_line:
                return

            while True:
                h_line = await reader.readline()
                if h_line in (b"\r\n", b"\n", b""):
                    break

            while True:
                try:
                    line_bytes = await asyncio.wait_for(
                        reader.readline(), timeout=timeout
                    )
                except TimeoutError:
                    print("[Stream] Reconnecting due to idle timeout...")
                    break

                if not line_bytes:
                    break

                line = line_bytes.decode("utf-8").strip()
                if line:
                    res_cb = callback(line)
                    if hasattr(res_cb, "send"):
                        await res_cb

                await asyncio.sleep(0)

        except Exception as e:
            print(f"Error in streaming request to {url}: {e}")

        finally:
            if writer:
                try:
                    writer.close()
                    await writer.wait_closed()
                except Exception:
                    pass

            _ = gc.collect()

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

    @classmethod
    def create(cls) -> Api:
        if cls.__instance is None:
            cls.__instance = Api()
        return cls.__instance
