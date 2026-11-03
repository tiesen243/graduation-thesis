import asyncio
import json

from machine import Pin

from lib.api import Api
from lib.i18n import t
from lib.pins import Pins
from lib.utils import get_current_time
from services.display import Display
from services.drop import Drop
from tasks.sync_schedule import SyncSchedule


class Streaming:
    __instance: Streaming | None = None

    _api: Api
    _led: Pin
    _drop: Drop
    _display: Display
    _sync_schedule: SyncSchedule

    _current_task: asyncio.Task | None
    _connected: bool

    def __init__(self) -> None:
        self._api = Api.create()
        self._drop = Drop.create()
        self._display = Display.create()
        self._sync_schedule = SyncSchedule.create()

        self._current_task = None
        self._connected = False

        pins = Pins.create()
        self._led = pins.led

    def _is_digit(self, val: str) -> bool:
        try:
            _ = int(val, 16)
            return True
        except ValueError:
            return False

    async def _handle_payload(self, line: str) -> None:
        await asyncio.sleep(0.1)

        clean_line = line.strip()

        if not clean_line or clean_line.startswith(":") or self._is_digit(clean_line):
            return

        if clean_line.startswith("data:"):
            clean_line = clean_line[5:].strip()

        try:
            data = json.loads(clean_line)
        except Exception:
            return

        if not isinstance(data, dict):
            return

        print(t("stream.received", data=data))

        action = data.get("action")
        payload = data.get("payload")

        if action == "led":
            print(t("stream.led", payload=payload))
            self._led.value(int(payload))  # pyright: ignore[reportArgumentType]

        elif action == "sync_schedule":
            print(t("stream.sync_schedule"))
            await self._api.post(
                "/api/devices/emit",
                data={
                    "action": "message",
                    "payload": t("stream.sync_schedule_received"),
                },
            )

            await asyncio.sleep(0.5)
            await self._sync_schedule.execute()

        elif action == "drop":
            print(t("stream.drop"))
            await self._api.post(
                "/api/devices/emit",
                data={
                    "action": "message",
                    "payload": t("stream.drop_received"),
                },
            )

            await asyncio.sleep(0.5)
            if isinstance(payload, dict):
                items = payload.get("items") or []
                schedule = {
                    "id": payload.get("id") or payload.get("scheduleId") or "",
                    "date": payload.get("date") or "",
                    "time": payload.get("time") or "",
                    "items": items,
                }
            else:
                items = payload if isinstance(payload, list) else []
                now = get_current_time()
                schedule = {
                    "id": "",
                    "date": f"{now[0]:04d}-{now[1]:02d}-{now[2]:02d}",
                    "time": f"{now[3]:02d}:{now[4]:02d}",
                    "items": items,
                }

            self._display.show_schedule_info(schedule)
            await self._drop.execute(items=items)

    async def _on_stream_connected(self) -> None:
        """Handle a successful SSE connection."""
        self._connected = True
        self._display.clear_stream_status()
        print(t("stream.connected"))

    async def start(self) -> None:
        """Start continuous SSE streaming listener loop with backoff logic."""
        if self._current_task is not None:
            return

        self._current_task = asyncio.current_task()

        print(t("stream.started"))

        retry_delay = 2
        max_delay = 30
        attempt = 0

        try:
            while True:
                self._connected = False

                try:
                    await asyncio.sleep(0.020)

                    await self._api.stream(
                        endpoint="/api/devices/subscribe",
                        callback=self._handle_payload,
                        timeout=35,
                        on_connect=self._on_stream_connected,
                    )

                except asyncio.CancelledError:
                    raise

                except Exception as error:
                    print(
                        t(
                            "stream.error_retry",
                            error=error,
                            seconds=retry_delay,
                        )
                    )

                # If the connection was established and then dropped,
                # restart with the shortest retry delay.
                if self._connected:
                    attempt = 1
                    retry_delay = 2
                    self._display.show_stream_status(
                        status="disconnected",
                        attempt=attempt,
                    )
                else:
                    attempt += 1
                    self._display.show_stream_status(
                        status="reconnecting",
                        attempt=attempt,
                    )

                await asyncio.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, max_delay)

        finally:
            self._connected = False
            self._display.clear_stream_status()
            self._current_task = None

    async def stop(self) -> None:
        """Stop the continuous SSE streaming listener loop."""
        task = self._current_task
        if task is None:
            return

        self._current_task = None
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    @classmethod
    def create(cls) -> Streaming:
        if cls.__instance is None:
            cls.__instance = Streaming()
        return cls.__instance
