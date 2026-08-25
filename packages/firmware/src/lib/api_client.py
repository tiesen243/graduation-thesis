import asyncio
import gc
import json as ujson

from lib.config import load_config


class ApiClient:
    config: dict | None = None

    def __init__(self):
        config = load_config()
        self.config = config.get("api")

    def _get_host_and_port(self) -> tuple[str, int]:
        if not self.config:
            raise ValueError("API configuration is not set.")

        host = (
            str(self.config.get("host", ""))
            .replace("http://", "")
            .replace("https://", "")
            .split("/")[0]
        )
        port = int(self.config.get("port", 80))
        return host, port

    def _headers(self, method: str, path: str, is_stream: bool = False) -> str:
        if not self.config:
            return ""

        host, port = self._get_host_and_port()
        host_header = host if port in (80, 443) else f"{host}:{port}"

        print(f"[{method}] {path} (Host: {host_header})")

        headers = [
            f"{method.upper()} {path} HTTP/1.1",
            f"Host: {host_header}",
            f"Authorization: Bearer {self.config.get('token')}",
            f"x-vercel-protection-bypass: {self.config.get('bypass_token')}",
            "Content-Type: application/json",
            "User-Agent: MicroPython/1.0",
        ]
        if is_stream:
            headers.append("Accept: text/event-stream")
            headers.append("Cache-Control: no-cache")
            headers.append("Connection: keep-alive")
        else:
            headers.append("Accept: application/json")
            headers.append("Connection: close")

        return "\r\n".join(headers) + "\r\n\r\n"

    async def _connect(self) -> tuple[asyncio.StreamReader, asyncio.StreamWriter]:
        host, port = self._get_host_and_port()
        is_ssl = port == 443

        if is_ssl:
            return await asyncio.open_connection(
                host, port, ssl=True, server_hostname=host
            )

        return await asyncio.open_connection(host, port)

    async def get(self, path: str) -> dict:
        if not self.config:
            raise ValueError("API configuration is not set.")

        reader, writer = await self._connect()

        request = self._headers("GET", path)
        writer.write(request.encode("utf-8"))
        await writer.drain()

        status_line = await reader.readline()
        if status_line:
            print(f"[STREAM STATUS] {status_line.decode('utf-8').strip()}")

        response = bytearray()
        while True:
            chunk = await reader.read(512)
            if not chunk:
                break
            response.extend(chunk)

        writer.close()
        await writer.wait_closed()

        return self._parse_response(response)

    async def post(self, path: str, data: dict) -> dict:
        if not self.config:
            raise ValueError("API configuration is not set.")

        body = ujson.dumps(data).encode("utf-8")
        reader, writer = await self._connect()

        request = self._headers("POST", path).rstrip("\r\n")
        request = f"{request}\r\nContent-Length: {len(body)}\r\n\r\n"

        writer.write(request.encode("utf-8"))
        writer.write(body)
        await writer.drain()

        response = bytearray()
        while True:
            chunk = await reader.read(512)
            if not chunk:
                break
            response.extend(chunk)

        writer.close()
        await writer.wait_closed()

        return self._parse_response(response)

    async def stream(self, path: str, callback):  # pyright: ignore[reportMissingParameterType]
        if not self.config:
            raise ValueError("API configuration is not set.")

        while True:
            reader = None
            writer = None

            try:
                reader, writer = await self._connect()

                request = self._headers("GET", path, is_stream=True)
                writer.write(request.encode("utf-8"))
                await writer.drain()

                while True:
                    header_line = await reader.readline()
                    if not header_line or header_line in (b"\r\n", b"\n"):
                        break

                while True:
                    line = await reader.readline()
                    if not line:
                        break

                    if line.startswith(b"data:"):
                        raw_data = line[5:].strip()
                        if raw_data:
                            payload = ujson.loads(raw_data)  # pyright: ignore[reportAny]
                            await callback(payload)

                    line = None
                    _ = gc.collect()

            except Exception as e:  # noqa: BLE001
                print(f"Error in stream: {e}")
            finally:
                if writer:
                    try:
                        writer.close()
                        await writer.wait_closed()
                    except Exception:  # noqa: BLE001, S110
                        pass
                _ = gc.collect()
                await asyncio.sleep(5)

    def _parse_response(self, response: bytearray) -> dict:
        parts = response.split(b"\r\n\r\n", 1)
        if len(parts) < 2:
            return {}

        headers_raw = parts[0].decode("utf-8", errors="ignore")
        body_raw = parts[1]

        status_line = headers_raw.split("\r\n", 1)[0]
        print(f"[RESP STATUS] {status_line}")

        if "transfer-encoding: chunked" in headers_raw.lower():
            decoded_body = bytearray()
            while body_raw:
                idx = body_raw.find(b"\r\n")
                if idx == -1:
                    break

                hex_str = body_raw[:idx].split(b";")[0].strip()
                if not hex_str:
                    break

                try:
                    chunk_len = int(hex_str, 16)
                except ValueError:
                    break

                if chunk_len == 0:
                    break

                chunk_data = body_raw[idx + 2 : idx + 2 + chunk_len]
                decoded_body.extend(chunk_data)
                body_raw = body_raw[idx + 2 + chunk_len + 2 :]

            body_str = decoded_body.decode("utf-8").strip()
        else:
            body_str = body_raw.decode("utf-8").strip()

        return ujson.loads(body_str) if body_str else {}
