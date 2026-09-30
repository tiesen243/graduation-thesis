import asyncio

from lib.config import Config
from modules.wifi import WiFi

# Enum 4 bit Action (0..15)
ACTION_PONG = 0
ACTION_CHECK_WIFI_RES = 1
ACTION_SET_WIFI_RES = 2
ACTION_SET_UTC_RES = 3
ACTION_SET_LANGUAGE_RES = 4
ACTION_SET_SYNC_TIME_RES = 5
ACTION_SET_DROP_TIMEOUT_RES = 6
ACTION_SET_OPEN_TIMEOUT_RES = 7
ACTION_SET_CLOSE_TIMEOUT_RES = 8
ACTION_SEND_DEVICE_INFO = 9

# Enum 4 bit Status (0..15)
STATUS_FAIL = 0
STATUS_SUCCESS = 1


class BLEHandler:
    def __init__(self, ble_instance) -> None:
        self._ble = ble_instance

    def _update_timeout_config(self, config: Config, key: str, timeout) -> bool:
        timeouts = config.get("timeouts", {})
        if not isinstance(timeouts, dict):
            timeouts = {}

        timeouts[key] = int(timeout) if isinstance(timeout, (int, float)) else 5000
        return config.set("timeouts", timeouts)

    async def handle_command(self, action: str, payload: dict) -> None:
        config = Config.create()

        if action == "ping":
            await self._ble.send_code(ACTION_PONG, STATUS_SUCCESS)

        elif action == "check_wifi":
            ssid = payload.get("ssid")
            password = payload.get("password")
            if not ssid or not password:
                return await self._ble.send_code(ACTION_CHECK_WIFI_RES, STATUS_FAIL)

            _ = asyncio.create_task(self._handle_check_wifi(ssid, password))

        elif action == "set_wifi":
            ssid = payload.get("ssid")
            password = payload.get("password")
            if not ssid or not password:
                return await self._ble.send_code(ACTION_SET_WIFI_RES, STATUS_FAIL)

            is_saved = config.set("wifi", {"ssid": ssid, "password": password})
            status = STATUS_SUCCESS if is_saved else STATUS_FAIL
            await self._ble.send_code(ACTION_SET_WIFI_RES, status)

        elif action == "set_utc":
            utc = payload.get("utc")
            if utc is None or not isinstance(utc, (int, float)):
                return await self._ble.send_code(ACTION_SET_UTC_RES, STATUS_FAIL)

            is_saved = config.set("utc", int(utc))
            status = STATUS_SUCCESS if is_saved else STATUS_FAIL
            await self._ble.send_code(ACTION_SET_UTC_RES, status)

        elif action == "set_language":
            language = payload.get("language")
            if not language or not isinstance(language, str):
                return await self._ble.send_code(ACTION_SET_LANGUAGE_RES, STATUS_FAIL)

            is_saved = config.set("language", language)
            status = STATUS_SUCCESS if is_saved else STATUS_FAIL
            await self._ble.send_code(ACTION_SET_LANGUAGE_RES, status)

        elif action == "set_sync_time":
            hours = payload.get("hours")
            minutes = payload.get("minutes")
            if (
                hours is None
                or minutes is None
                or not isinstance(hours, int)
                or not isinstance(minutes, int)
            ):
                return await self._ble.send_code(ACTION_SET_SYNC_TIME_RES, STATUS_FAIL)

            is_saved = config.set("sync_time", f"{hours:02}:{minutes:02}")
            status = STATUS_SUCCESS if is_saved else STATUS_FAIL
            await self._ble.send_code(ACTION_SET_SYNC_TIME_RES, status)

        elif action == "set_drop_timeout":
            timeout = payload.get("timeout")
            is_saved = self._update_timeout_config(config, "drop", timeout)
            status = STATUS_SUCCESS if is_saved else STATUS_FAIL
            await self._ble.send_code(ACTION_SET_DROP_TIMEOUT_RES, status)

        elif action == "set_open_timeout":
            timeout = payload.get("timeout")
            is_saved = self._update_timeout_config(config, "open", timeout)
            status = STATUS_SUCCESS if is_saved else STATUS_FAIL
            await self._ble.send_code(ACTION_SET_OPEN_TIMEOUT_RES, status)

        elif action == "set_close_timeout":
            timeout = payload.get("timeout")
            is_saved = self._update_timeout_config(config, "close", timeout)
            status = STATUS_SUCCESS if is_saved else STATUS_FAIL
            await self._ble.send_code(ACTION_SET_CLOSE_TIMEOUT_RES, status)

    async def on_connect(self) -> None:
        """Callback triggered when a BLE client connects to transmit device status payload."""
        await asyncio.sleep(1)
        status_code = self._build_device_info_payload()
        await self._ble.send_code(ACTION_SEND_DEVICE_INFO, status_code)

    async def _handle_check_wifi(self, ssid: str, password: str) -> None:
        is_connected = await WiFi.check_connection(ssid, password)
        status = STATUS_SUCCESS if is_connected else STATUS_FAIL
        await self._ble.send_code(ACTION_CHECK_WIFI_RES, status)

    def _build_device_info_payload(self) -> int:
        """Encode current device configuration into a single 34-bit integer payload.

        Bit Layout (Total 34 bits):
        - Bits 0..3   (4b): UTC Offset
        - Bit 4       (1b): Language (0: en, 1: vi)
        - Bits 5..15 (11b): Sync Time (Hours 5b, Minutes 6b)
        - Bits 16..21 (6b): Drop Timeout (seconds, 0..63)
        - Bits 22..27 (6b): Open Timeout (seconds, 0..63)
        - Bits 28..33 (6b): Close Timeout (seconds, 0..63)
        """
        config = Config.create()

        # 1. UTC Offset (4 bits)
        raw_utc = config.get("utc", 7)
        utc_val = int(raw_utc) if isinstance(raw_utc, (int, float)) else 7
        utc_val = max(-12, min(14, utc_val))
        sign_bit = 1 if utc_val >= 0 else 0
        abs_val = abs(utc_val) & 0x07
        utc_bits = (sign_bit << 3) | abs_val

        # 2. Language (1 bit)
        lang_str = config.get("language", "en")
        lang_bits = 1 if lang_str == "vi" else 0

        # 3. Sync Time (11 bits)
        sync_time_str = config.get("sync_time", "00:00")
        try:
            parts = sync_time_str.split(":")
            sync_hours = int(parts[0]) if len(parts) > 0 else 0
            sync_minutes = int(parts[1]) if len(parts) > 1 else 0
        except Exception:
            sync_hours, sync_minutes = 0, 0

        sync_hours = max(0, min(23, sync_hours))
        sync_minutes = max(0, min(59, sync_minutes))
        sync_time_bits = (sync_hours & 0x1F) | ((sync_minutes & 0x3F) << 5)

        # 4. Timeouts (6 bits each)
        timeouts = config.get("timeouts", {})
        drop_sec = max(
            0,
            min(
                63,
                int(
                    timeouts.get("drop", 5000) // 1000
                    if timeouts.get("drop", 5) > 63
                    else timeouts.get("drop", 5)
                ),
            ),
        )
        open_sec = max(
            0,
            min(
                63,
                int(
                    timeouts.get("open", 10000) // 1000
                    if timeouts.get("open", 10) > 63
                    else timeouts.get("open", 10)
                ),
            ),
        )
        close_sec = max(
            0,
            min(
                63,
                int(
                    timeouts.get("close", 5000) // 1000
                    if timeouts.get("close", 5) > 63
                    else timeouts.get("close", 5)
                ),
            ),
        )

        return (
            (utc_bits & 0x0F)
            | ((lang_bits & 0x01) << 4)
            | ((sync_time_bits & 0x07FF) << 5)
            | ((drop_sec & 0x3F) << 16)
            | ((open_sec & 0x3F) << 22)
            | ((close_sec & 0x3F) << 28)
        )
