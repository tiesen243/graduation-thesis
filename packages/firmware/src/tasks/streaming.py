import uasyncio
import ujson
from machine import Pin

from lib.api import Api
from tasks.sync_schedule import SyncSchedule

led = Pin("LED", Pin.OUT)


class Streaming:
    __instance: Streaming | None = None

    api: Api
    sync_schedule: SyncSchedule

    def __init__(self) -> None:
        self.api = Api.create()
        self.sync_schedule = SyncSchedule.create()

    def _is_digit(self, val: str) -> bool:
        """Kiểm tra chuỗi chỉ chứa ký tự số (Chống lỗi tương thích MicroPython)."""
        try:
            int(val, 16)  # Kiểm tra cả chuỗi Hex (Chunk size) lẫn Decimal
            return True
        except ValueError:
            return False

    async def _handle_payload(self, line: str) -> None:
        """Parse raw SSE payload lines and trigger hardware or software actions."""
        await uasyncio.sleep_ms(10)

        clean_line = line.strip()

        # Lọc bỏ các dòng trống, comment, keep-alive hoặc dòng chunk size (vd: '24')
        if not clean_line or clean_line.startswith(":") or self._is_digit(clean_line):
            return

        if clean_line.startswith("data:"):
            clean_line = clean_line[5:].strip()

        try:
            data = ujson.loads(clean_line)
        except Exception:  # noqa: BLE001
            return

        # Chỉ xử lý khi data trả về đúng dạng Dictionary
        if not isinstance(data, dict):
            return

        print(f"[STREAM] Received streaming payload: {data}")

        action = data.get("action")
        payload = data.get("payload")

        if action == "led":
            print(f"[STREAM] Setting LED state to: {payload}")
            led.value(int(payload))  # pyright: ignore[reportArgumentType]

        elif action == "sync_schedule":
            print("[STREAM] Syncing schedule...")
            await self.sync_schedule.sync()

    async def start(self) -> None:
        """Start continuous SSE streaming listener loop with backoff logic."""
        print("\n[STARTUP] Streaming task initiated...\n")

        retry_delay = 2
        max_delay = 60

        while True:
            try:
                await uasyncio.sleep_ms(20)

                await self.api.stream(
                    endpoint="/api/devices/subscribe",
                    callback=self._handle_payload,
                    timeout=30,
                )
                retry_delay = 2
            except Exception as e:  # noqa: BLE001
                print(f"[STREAM] Error: {e}")

            await uasyncio.sleep(retry_delay)
            retry_delay = min(retry_delay * 2, max_delay)

    @classmethod
    def create(cls) -> Streaming:
        if cls.__instance is None:
            cls.__instance = Streaming()
        return cls.__instance


if __name__ == "__main__":
    streaming = Streaming.create()
    uasyncio.run(streaming.start())
