import asyncio
import json as ujson
from collections.abc import AsyncGenerator
from typing import Any

from lib.config import ApiConfig, load_config


class ApiClient:
    config: ApiConfig | None = None

    def __init__(self):
        config = load_config()
        self.config = config.get("api")

    def _headers(self, method: str, path: str, is_stream: bool = False) -> str:
        if not self.config:
            return ""

        headers = [
            f"{method.upper()} {path} HTTP/1.1",
            f"Host: {self.config.get('host')}:{self.config.get('port')}",
            f"Authorization: Bearer {self.config.get('token')}",
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

    async def get(self, path: str) -> dict[str, Any]:  # pyright: ignore[reportExplicitAny]
        if not self.config:
            raise ValueError("API configuration is not set.")

        reader, writer = await asyncio.open_connection(
            self.config.get("host"),
            self.config.get("port"),
            ssl=self.config.get("port") == 443,
        )

        request = self._headers("GET", path)

        writer.write(request.encode("utf-8"))
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

    async def post(self, path: str, data: dict[str, Any]) -> dict[str, Any]:  # pyright: ignore[reportExplicitAny]
        if not self.config:
            raise ValueError("API configuration is not set.")

        body = ujson.dumps(data).encode("utf-8")
        reader, writer = await asyncio.open_connection(
            self.config.get("host"),
            self.config.get("port"),
            ssl=self.config.get("port") == 443,
        )

        request = self._headers("POST", path)
        request += f"Content-Length: {len(body)}\r\n\r\n"

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

    async def stream(self, path: str) -> AsyncGenerator[dict[str, str]]:
        if not self.config:
            raise ValueError("API configuration is not set.")

        while True:
            try:
                reader, writer = await asyncio.open_connection(
                    self.config.get("host"),
                    self.config.get("port"),
                    ssl=self.config.get("port") == 443,
                )

                request = self._headers("GET", path, is_stream=True)

                writer.write(request.encode("utf-8"))
                await writer.drain()

                while True:
                    line = await reader.readline()
                    if not line:
                        break

                    line = line.decode("utf-8").strip()
                    if line.startswith("data:"):
                        data = line[5:].strip()
                        yield ujson.loads(data) if data else {}
            except Exception as e:  # noqa: BLE001
                print(f"Error in stream: {e}")
                await asyncio.sleep(5)

    def _parse_response(self, response: bytearray) -> dict[str, Any]:  # pyright: ignore[reportExplicitAny]
        parts = response.split(b"\r\n\r\n", 1)
        if len(parts) < 2:
            return {}

        headers_raw = parts[0].decode("utf-8", errors="ignore")
        body_raw = parts[1]

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
