import asyncio

import network

from lib.config import Config


class WiFi:
    __instance: WiFi | None = None

    _wifi: dict | None = None
    _wlan: network.WLAN | None = None
    _hostname: str | None = None

    def __init__(self):
        config = Config.create()
        self._wifi = config.get("wifi")
        self._hostname = config.get("device", {}).get("name", "Rozumari")

    async def connect(self) -> bool:
        """
        Establish an asynchronous Wi-Fi connection using loaded configurations.

        Connection Workflow:
            - Validates presence of Wi-Fi and device configuration dictionaries.
            - Activates station interface (`STA_IF`) and checks existing link status.
            - Attempts connection with a 20-second timeout loop while printing status indicators.

        :param force: Force a reconnection sequence even if already connected. Defaults to False.
        :return: True if connection is successful, False otherwise.
        """
        if self._wifi is None:
            return False

        self._wlan = network.WLAN(network.STA_IF)

        self._wlan.active(False)
        await asyncio.sleep(0.5)

        self._wlan.active(True)
        await asyncio.sleep(0.5)

        if self._hostname:
            network.hostname(self._hostname)

        ssid = self._wifi.get("ssid")
        password = self._wifi.get("password")
        print(f"[WiFi] Connecting to WiFi SSID: {ssid}...", end="")

        timeout = 30
        self._wlan.connect(ssid, password)
        while not self._wlan.isconnected() and timeout > 0:
            await asyncio.sleep(1)
            print(".", end="")
            timeout -= 1

        if self._wlan.isconnected():
            print(f"\n[WiFi] Connected to WiFi! IP: {self._wlan.ifconfig()[0]}")
            return True
        else:
            print("\n[WiFi] Failed to connect to WiFi.")
            return False

    def disconnect(self) -> None:
        """
        Disconnect from the current Wi-Fi network and deactivate the station interface.

        :return: None
        """
        if self._wlan is None:
            self._wlan = network.WLAN(network.STA_IF)

        if self._wlan.isconnected():
            self._wlan.disconnect()
        self._wlan.active(False)

    def reset(self) -> None:
        """
        Reset the Wi-Fi configuration to default values and disconnect from any active network.

        :return: None
        """
        if self._wlan is None:
            self._wlan = network.WLAN(network.STA_IF)

        self._wlan.deinit()

    @classmethod
    def create(cls) -> WiFi:
        if cls.__instance is None:
            cls.__instance = WiFi()
        return cls.__instance

    @classmethod
    async def check_connection(cls, ssid: str, password: str) -> bool:
        """
        Test specific wireless credentials asynchronously without altering primary network states.

        Verification Workflow:
            - Temporarily disconnects active interface and attempts binding to the target SSID.
            - Polls connection status codes within a monitored timeout window.
            - Cleans up interface states upon completion.

        :param ssid: Target wireless network SSID string.
        :param password: Wireless network password string.
        :return: True if credentials authenticate successfully, False otherwise.
        """
        if not ssid or not password:
            return False

        wlan = network.WLAN(network.STA_IF)

        wlan.active(False)
        await asyncio.sleep(0.5)

        wlan.active(True)
        await asyncio.sleep(0.5)

        networks = wlan.scan()
        print(f"[WiFi] Found networks: {[net[0].decode() for net in networks]}")

        try:
            print(f"[WiFi] Attempting to connect to SSID: {ssid}...")
            wlan.connect(ssid, password)
        except Exception as e:
            print(f"[WiFi] WiFi connect error: {e}")
            wlan.active(False)
            return False

        for _ in range(30):
            if wlan.isconnected():
                print(
                    f"[WiFi] Valid credentials! Successfully reached IP: {wlan.ifconfig()[0]}"
                )
                wlan.disconnect()
                wlan.active(False)
                return True

            status = wlan.status()
            if status in (201, 202, 203) or status < 0:
                print(f"[WiFi] Connection failed with status code: {status}")
                break

            await asyncio.sleep(0.5)

        wlan.disconnect()
        wlan.active(False)
        return False
