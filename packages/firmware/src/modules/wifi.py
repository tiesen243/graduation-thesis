import asyncio
import time

import network
import ntptime

from lib.config import WifiConfig, load_config


class WiFi:
    wifi: WifiConfig | None = None
    utc: int | None = None

    def __init__(self):
        config = load_config()
        self.wifi = config.get("wifi")
        self.utc = config.get("utc")

    async def connect(self):
        if self.wifi is None:
            return

        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)

        if not wlan.isconnected():
            print(f"Connecting to {self.wifi.get('ssid')}", end="")
            wlan.connect(self.wifi.get("ssid"), self.wifi.get("password"))

            while not wlan.isconnected():
                print(".", end="")
                await asyncio.sleep(0.5)

        print(f"\nConnected! Network config: {wlan.ifconfig()}")

        while True:
            try:
                print("Syncing time with NTP server...")
                ntptime.settime()
                break
            except OSError as e:
                print(f"Failed to sync time: {e}. Retrying in 2 seconds...")
                await asyncio.sleep(2)

    @classmethod
    def get_time(cls) -> time.struct_time:
        return time.localtime(
            time.time() + ((cls.utc * 3600) if cls.utc is not None else 1)
        )
