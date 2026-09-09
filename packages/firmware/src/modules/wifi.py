import network
import uasyncio

from lib.config import Config


class WiFi:
    __instance: WiFi | None = None

    wifi: dict | None = None
    device: dict | None = None

    def __init__(self):
        config = Config.create()
        self.wifi = config.get("wifi")
        self.device = config.get("device")

    async def connect(self, force: bool = False) -> bool:
        """
        Establish an asynchronous Wi-Fi connection using loaded configurations.

        Connection Workflow:
            - Validates presence of Wi-Fi and device configuration dictionaries.
            - Activates station interface (`STA_IF`) and checks existing link status.
            - Attempts connection with a 20-second timeout loop while printing status indicators.

        :param force: Force a reconnection sequence even if already connected. Defaults to False.
        :return: True if connection is successful, False otherwise.
        """
        if self.wifi is None or self.device is None:
            return False

        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)

        if wlan.isconnected() and not force:
            print(f"[Setup] Already connected to WiFi! IP: {wlan.ifconfig()[0]}")
            return True

        ssid = self.wifi.get("ssid")
        password = self.wifi.get("password")
        print(f"[Setup] Connecting to WiFi SSID: {ssid}...", end="")

        timeout = 30
        wlan.connect(ssid, password)
        while not wlan.isconnected() and timeout > 0:
            await uasyncio.sleep(1)
            print(".", end="")
            timeout -= 1

        if wlan.isconnected():
            print(f"\n[Setup] Connected to WiFi! IP: {wlan.ifconfig()[0]}")
            return True
        else:
            print("\n[Setup] Failed to connect to WiFi.")
            return False

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
        wlan.active(True)

        if wlan.isconnected():
            wlan.disconnect()
            uasyncio.sleep_ms(200)

        try:
            wlan.connect(ssid, password)
        except Exception as e:  # noqa: BLE001
            print(f"[Setup] WiFi connect error: {e}")
            wlan.active(False)
            return False

        for _ in range(20):
            if wlan.isconnected() or wlan.status() == 3:
                wlan.disconnect()
                wlan.active(False)
                return True

            status = wlan.status()
            if status in (1000, 1001, 1010, 201, 202):
                break

            await uasyncio.sleep_ms(500)

        wlan.disconnect()
        wlan.active(False)
        return False
