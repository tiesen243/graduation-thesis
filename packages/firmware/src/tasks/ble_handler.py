import asyncio

from lib.config import Config
from modules.wifi import WiFi

# Enum 3 bit Action (0..7)
ACTION_PONG = 0
ACTION_CHECK_WIFI_RES = 1

ACTION_SET_WIFI_RES = 2
ACTION_SET_UTC_RES = 3
ACTION_SET_LANGUAGE_RES = 4
ACTION_SET_SYNC_TIME_RES = 5

ACTION_SEND_DEVICE_INFO = 6

# Enum 5 bit Status (0..31)
STATUS_FAIL = 0
STATUS_SUCCESS = 1


class BLEHandler:
    def __init__(self, ble_instance) -> None:  # pyright: ignore[reportMissingParameterType]
        """
        Initialize the BLEHandler instance.

        :param ble_instance: The peripheral BLE instance used for communication.
        """
        self._ble = ble_instance

    async def handle_command(self, action: str, payload: dict) -> None:
        """
        Process incoming commands received via BLE and perform corresponding actions.

        :param action: The command action type to execute.
        :param payload: Dictionary containing parameters for the action.
        :return: None
        """
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
            is_saved = config.set("sync_time", f"{hours:02}:{minutes:02}")
            status = STATUS_SUCCESS if is_saved else STATUS_FAIL
            await self._ble.send_code(ACTION_SET_SYNC_TIME_RES, status)

    async def on_connect(self) -> None:
        """
        Callback triggered when a BLE client connects to transmit device status payload.

        :return: None
        """

        await asyncio.sleep(1)
        status_code = self._build_device_info_status()
        await self._ble.send_code(ACTION_SEND_DEVICE_INFO, status_code)

    async def _handle_check_wifi(self, ssid: str, password: str) -> None:
        """
        Asynchronously test WiFi credentials and transmit the connection status.

        :param ssid: The Wi-Fi SSID network name.
        :param password: The Wi-Fi password.
        :return: None
        """

        is_connected = await WiFi.check_connection(ssid, password)
        status = STATUS_SUCCESS if is_connected else STATUS_FAIL
        await self._ble.send_code(ACTION_CHECK_WIFI_RES, status)

    def _build_device_info_status(self) -> int:
        """
        Encode current device configuration (UTC offset and language) into a 5-bit status payload integer.

        Encoding standard:
            - **Bits 0..3 (4 bits)**: UTC Offset
                - **Bit 3**: Sign indicator (`1` = positive/non-negative, `0` = negative).
                - **Bits 0..2**: Absolute UTC value modulo 8 (`abs(utc) & 0x07`).
            - **Bit 4 (1 bit)**: Language preference
                - `0` = English ('en')
                - `1` = Vietnamese ('vi')
            - **Bit 5..15 (11 bits)**: Sync time preference
                - **Bit 5..9**: Absolute hour value of sync time (0..23).
                - **Bit 10..15**: Absolute minute value of sync time (0..59).

        Parsing / Decoding instructions for receiver (Mobile App / Client):
            1. Extract Status Code: `status_code = raw_byte & 0x1F`
            2. Parse UTC:
               - Read 4 LSB bits: `utc_bits = status_code & 0x0F`
               - Read sign bit: `sign_bit = (utc_bits >> 3) & 0x01`
               - Read absolute magnitude: `abs_val = utc_bits & 0x07`
               - Calculate UTC: `utc = abs_val if sign_bit == 1 else -abs_val`
            3. Parse Language:
               - Read Bit 4: `lang_bit = (status_code >> 4) & 0x01`
               - Determine language: `language = "vi" if lang_bit == 1 else "en"`
            4. Parse Sync Time:
               - Read Bits 5..9: `hours = (status_code >> 5) & 0x1F`
               - Read Bits 10..15: `minutes = (status_code >> 10) & 0x3F`
               - Construct sync time string: `sync_time = f"{hour:02}:{minute:02}"`

        :return: A 16-bit packed integer (range 0..65535) containing device metadata.
        """

        config = Config.create()

        raw_utc = config.get("utc", 7)
        utc_val = int(raw_utc) if isinstance(raw_utc, (int, float)) else 7
        utc_val = max(-12, min(14, utc_val))

        sign_bit = 1 if utc_val >= 0 else 0
        abs_val = abs(utc_val) & 0x07

        utc_bits = (sign_bit << 3) | abs_val

        lang_str = config.get("language", "en")
        lang_bits = 1 if lang_str == "vi" else 0

        sync_time_str = config.get("sync_time", "00:00")
        try:
            parts = sync_time_str.split(":")
            sync_hours = int(parts[0]) if len(parts) > 0 else 4
            sync_minutes = int(parts[1]) if len(parts) > 1 else 0
        except Exception:
            sync_hours, sync_minutes = 0, 0

        sync_hours = max(0, min(23, sync_hours))
        sync_minutes = max(0, min(59, sync_minutes))
        sync_time_bits = (sync_hours & 0x1F) | ((sync_minutes & 0x3F) << 5)

        return (utc_bits & 0x0F) | ((lang_bits & 0x01) << 4) | (sync_time_bits << 5)
