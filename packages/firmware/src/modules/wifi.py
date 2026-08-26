import asyncio

import network

from lib.config import load_config


class WiFi:
    __instance: WiFi | None = None

    wifi: dict | None = None
    device: dict | None = None

    def __init__(self):
        config = load_config()
        self.wifi = config.get("wifi")
        self.device = config.get("device")

    async def connect(self, force: bool = False) -> bool:
        if self.wifi is None or self.device is None:
            return False

        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)

        if wlan.isconnected() and not force:
            print(f"Already connected to WiFi! IP: {wlan.ifconfig()[0]}")
            return True

        ssid = self.wifi.get("ssid")
        password = self.wifi.get("password")
        print(f"Connecting to WiFi SSID: {ssid}...", end="")

        timeout = 10  # seconds
        wlan.connect(ssid, password)
        while not wlan.isconnected() and timeout > 0:
            await asyncio.sleep(1)
            print(".", end="")
            timeout -= 1

        if wlan.isconnected():
            print(f"\nConnected to WiFi! IP: {wlan.ifconfig()[0]}")
            return True
        else:
            print("\nFailed to connect to WiFi.")
            return False

    @classmethod
    def create(cls) -> WiFi:
        if cls.__instance is None:
            cls.__instance = WiFi()
        return cls.__instance
