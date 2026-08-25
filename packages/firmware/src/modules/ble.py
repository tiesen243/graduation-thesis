import asyncio

import ubluetooth
import ujson

from lib.config import load_config

_CONFIG_SERVICE_UUID = ubluetooth.UUID("ffaa5bd2-45cd-4512-bf35-c5d4276a0c7a")
_CHAR_RX_UUID = ubluetooth.UUID("3d8cffcb-69d3-41d3-8f9e-fafed0bcce6b")
_CHAR_TX_UUID = ubluetooth.UUID("09cbb497-1c8a-4ad6-b196-3459c1820a1a")

_FLAG_WRITE = 0x0008
_FLAG_READ = 0x0002
_FLAG_NOTIFY = 0x0010


class BLE:
    ble: ubluetooth.BLE | None = None
    device: dict | None = None

    handle_rx: memoryview[int] | None = None
    handle_tx: memoryview[int] | None = None
    conn_handle: memoryview[int] | None = None

    def __init__(self) -> None:
        config = load_config()
        self.device = config.get("device")

        self.ble = ubluetooth.BLE()
        self.ble.active(True)
        _ = self.ble.irq(self._irq)
        self.conn_handle = None

        CONFIG_SERVICE = (
            _CONFIG_SERVICE_UUID,
            (
                (_CHAR_RX_UUID, _FLAG_WRITE),
                (_CHAR_TX_UUID, _FLAG_READ | _FLAG_NOTIFY),
            ),
        )
        ((self.handle_rx, self.handle_tx),) = self.ble.gatts_register_services(
            (CONFIG_SERVICE,)
        )

        self._start_advertising()

    def _start_advertising(self) -> None:
        if not self.ble or not self.device:
            return

        device_name = str(self.device.get("name")).encode("utf-8")
        payload = (
            bytearray([0x02, 0x01, 0x06, len(device_name) + 1, 0x09]) + device_name
        )
        self.ble.gap_advertise(1000, adv_data=payload)  # pyright: ignore[reportCallIssue]
        print(f"Advertising as {self.device.get('name')}...")

    def _irq(self, event: int, data: tuple[memoryview[int], ...]) -> None:
        if not self.ble:
            return

        if event == 1:
            print("Device connected")
            self.conn_handle, _, _ = data
        elif event == 2:
            print("Device disconnected")
            self.conn_handle = None
            self._start_advertising()
        elif event == 3:
            _, value_handle = data
            if self.handle_rx is not None and value_handle == self.handle_rx:
                raw_data: bytes = self.ble.gatts_read(self.handle_rx)
                _ = asyncio.create_task(self._handle(raw_data))

    def send(self, data: dict[str, str]) -> None:
        if self.ble is None or self.conn_handle is None or self.handle_tx is None:
            return

        _bytes = ujson.dumps(data).encode("utf-8")
        self.ble.gatts_write(self.handle_tx, _bytes)
        self.ble.gatts_notify(self.conn_handle, _bytes)

    async def _handle(self, raw_data: bytes) -> None:
        try:
            json: dict[str, str] = ujson.loads(raw_data.decode("utf-8"))  # pyright: ignore[reportAny]
            print(f"Received message: {json.get('message')}")

            if json.get("message") == "ping":
                self.send({"message": "pong"})
        except Exception as e:  # noqa: BLE001
            print(f"Error handling message: {e}")

    def stop(self) -> None:
        if self.ble is None:
            return

        self.ble.active(False)
