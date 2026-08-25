import asyncio

from machine import Pin

from lib.config import load_config
from modules.ble import BLE
from modules.schedules import Schedules
from modules.streaming import Streaming
from modules.wifi import WiFi


class Bootstrap:
    ble: BLE | None = None
    wifi: WiFi | None = None

    switch: Pin | None = None
    streaming: Streaming | None = None
    schedules: Schedules | None = None

    def __init__(self) -> None:
        config = load_config(force=True)
        pins = config.get("pins", {})

        self.ble = None

        self.switch = Pin(int(pins.get("switch")), Pin.IN, Pin.PULL_UP)

    def _is_config_mode(self) -> bool:
        if self.switch is None:
            return False
        return self.switch.value() == 0

    async def config_mode(self) -> None:
        self.ble = BLE()

        while self._is_config_mode():
            await asyncio.sleep(1)

        self.ble.stop()

    async def normal_mode(self) -> None:
        _ = load_config(force=True)

        self.wifi = WiFi()
        self.streaming = Streaming()
        self.schedules = Schedules()

        await self.wifi.connect()

        async def watch_switch():
            while not self._is_config_mode():
                await asyncio.sleep(1)

        gather = asyncio.gather(
            self.streaming.start(), self.schedules.start(), watch_switch()
        )
        await gather

    async def start(self) -> None:
        if self._is_config_mode():
            await self.config_mode()
        else:
            await self.normal_mode()


if __name__ == "__main__":
    bootstrap = Bootstrap()

    try:
        asyncio.run(bootstrap.start())
    except KeyboardInterrupt:
        print("Program interrupted by user.")
