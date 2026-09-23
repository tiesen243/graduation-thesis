import asyncio
import json

import bluetooth

from lib.config import Config
from tasks.ble_handler import BLEHandler

_CONFIG_SERVICE_UUID = bluetooth.UUID("ffaa5bd2-45cd-4512-bf35-c5d4276a0c7a")
_CHAR_RX_UUID = bluetooth.UUID("3d8cffcb-69d3-41d3-8f9e-fafed0bcce6b")
_CHAR_TX_UUID = bluetooth.UUID("09cbb497-1c8a-4ad6-b196-3459c1820a1a")


class BLE:
    __instance: BLE | None = None

    _handle_rx: memoryview[int] | None = None
    _handle_tx: memoryview[int] | None = None
    _conn_handle: memoryview[int] | None = None
    _config: dict | None = None

    def __init__(self) -> None:
        config = Config.create()
        self._config = config.get("device", {})

        self._rx_buffer = bytearray()
        self._send_lock = asyncio.Lock()
        self._handler = BLEHandler(self)

        self._ble = bluetooth.BLE()
        self._ble.active(True)
        _ = self._ble.irq(self._irq)

        service = (
            _CONFIG_SERVICE_UUID,
            (
                (_CHAR_RX_UUID, 0x0008),  # WRITE
                (_CHAR_TX_UUID, 0x0002 | 0x0010),  # READ | NOTIFY
            ),
        )
        handles = self._ble.gatts_register_services((service,))
        self._handle_rx, self._handle_tx = handles[0]
        self._ble.gatts_set_buffer(self._handle_rx, 512, True)

    def is_ready(self) -> bool:
        return self._ble.active()

    def activate(self) -> None:
        if not self._ble.active():
            self._ble.active(True)

    def start_advertising(self) -> None:
        if not self._ble or self._config is None:
            return

        name = self._config.get("name", "Rozumari")
        name = name.strip()[:8]

        payload = bytearray([0x02, 0x01, 0x06])
        name_bytes = name.encode("utf-8")
        payload.extend(bytearray([len(name_bytes) + 1, 0x09]) + name_bytes)
        uuid_bytes = bytes(_CONFIG_SERVICE_UUID)  # pyright: ignore[reportArgumentType]
        payload.extend(bytearray([len(uuid_bytes) + 1, 0x07]) + uuid_bytes)

        self._ble.gap_advertise(625000, adv_data=payload)  # pyright: ignore[reportCallIssue]
        _, _mac = self._ble.config("mac")
        mac = ":".join(f"{byte:02X}" for byte in _mac)

        print(f"Advertising as {name} ({mac})...")

    def _irq(self, event: int, data: tuple) -> None:
        if event == 1:  # Connect
            print("Device connected")
            self._conn_handle = data[0]
            self._rx_buffer = bytearray()
            _ = asyncio.create_task(self._handler.on_connect())

        elif event == 2:  # Disconnect
            print("Device disconnected")
            self._conn_handle = None
            self._rx_buffer = bytearray()
            _ = asyncio.create_task(self._async_start_advertising())

        elif event == 3:  # Write
            if self._handle_rx is None:
                return

            _, val_handle = data
            if val_handle == self._handle_rx:
                chunk = self._ble.gatts_read(self._handle_rx)
                if chunk:
                    self._rx_buffer.extend(chunk)
                    if b"\n" in chunk:
                        _ = asyncio.create_task(self._process_buffer())

    async def send_code(self, action: int, status: int = 0) -> None:
        """Pack 4-bit Action and 4-bit Status (or 34-bit Integer payload) into notification frame."""
        if not self._ble or self._conn_handle is None or self._handle_tx is None:
            print("Cannot send: Not connected")
            return

        # ACTION_SEND_DEVICE_INFO = 9 (hoặc khi payload truyền vào vượt mức 4-bit status)
        if action == 9 or status > 0x0F:
            action_byte = (action & 0x0F) << 4
            b0 = status & 0xFF
            b1 = (status >> 8) & 0xFF
            b2 = (status >> 16) & 0xFF
            b3 = (status >> 24) & 0xFF
            b4 = (status >> 32) & 0xFF
            packet_bytes = bytes([action_byte, b0, b1, b2, b3, b4])
            packet_type = "6 Bytes"
        else:
            packet_bytes = bytes([((action & 0x0F) << 4) | (status & 0x0F)])
            packet_type = "1 Byte"

        async with self._send_lock:
            self._ble.gatts_write(self._handle_tx, packet_bytes)
            await asyncio.sleep(0.01)

            try:
                self._ble.gatts_notify(self._conn_handle, self._handle_tx, packet_bytes)  # pyright: ignore[reportCallIssue]
            except TypeError:
                self._ble.gatts_notify(self._conn_handle, self._handle_tx)  # pyright: ignore[reportArgumentType]

            await asyncio.sleep(0.03)
            print(
                f"Sent {packet_type}: 0x{packet_bytes.hex().upper()} (Action: {action}, Status/Value: {status})"
            )

    def is_connected(self) -> bool:
        return self._conn_handle is not None

    def disconnect(self) -> None:
        if not self._ble or self._conn_handle is None:
            return

        try:
            _ = self._ble.gap_disconnect(self._conn_handle)
        except Exception:
            pass

        self._conn_handle = None
        self._rx_buffer = bytearray()

    def stop(self) -> None:
        if not self._ble:
            return
        self._ble.gap_advertise(0)
        if self._conn_handle is not None:
            try:
                _ = self._ble.gap_disconnect(self._conn_handle)
            except Exception:
                pass
            self._conn_handle = None
        self._ble.active(False)

    async def _async_start_advertising(self) -> None:
        await asyncio.sleep(0.1)
        self.start_advertising()

    async def _process_buffer(self) -> None:
        if not self._rx_buffer:
            return

        raw_str = self._rx_buffer.decode("utf-8", "ignore").strip()

        try:
            data = json.loads(raw_str)
            self._rx_buffer = bytearray()

            action = data.get("action")
            payload = data.get("payload", {})

            if action:
                await self._handler.handle_command(action, payload)

        except Exception:
            pass

    @classmethod
    def create(cls) -> BLE:
        if cls.__instance is None:
            cls.__instance = BLE()
        return cls.__instance
