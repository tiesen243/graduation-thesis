import asyncio

from lib.config import load_config
from lib.pins import switch
from modules.ble import BLE
from modules.wifi import WiFi
from tasks.schedules import Schedules
from tasks.streaming import Streaming


class Bootstrap:
    ble: BLE | None = None
    wifi: WiFi | None = None

    streaming: Streaming | None = None
    schedules: Schedules | None = None

    async def _config_mode(self) -> None:
        self.ble = BLE()

        self.ble.start_advertising()

        while switch.value() == 0:
            await asyncio.sleep(1)

        self.ble.stop()

    async def _normal_mode(self) -> None:
        _ = load_config(force=True)

        self.wifi = WiFi()
        self.streaming = Streaming()
        self.schedules = Schedules()

        await self.wifi.connect()

        gather = asyncio.gather(self.streaming.start(), self.schedules.start())
        await gather

    async def start(self) -> None:
        if switch.value() == 0:
            await self._config_mode()
        else:
            await self._normal_mode()


if __name__ == "__main__":
    bootstrap = Bootstrap()

    try:
        asyncio.run(bootstrap.start())
    except KeyboardInterrupt:
        print("Program interrupted by user.")
