import ntptime
import uasyncio
from machine import Pin

from lib.config import load_config
from lib.pins import Pins
from modules.ble import BLE
from modules.rgb import RGB
from modules.sensor import Sensor
from modules.wifi import WiFi
from tasks.schedules import Schedules
from tasks.streaming import Streaming


class Bootstrap:
    ble: BLE | None = None
    wifi: WiFi | None = None

    streaming: Streaming | None = None
    schedules: Schedules | None = None

    switch: Pin

    def __init__(self) -> None:
        pins = Pins.create()
        self.switch = pins.switch

        _ = Sensor.create()

    async def _config_mode(self) -> None:
        self.ble = BLE.create()

        self.ble.start_advertising()

        while self.switch.value() == 0:
            await uasyncio.sleep(1)

        self.ble.stop()

    async def _normal_mode(self) -> None:
        _ = load_config(force=True)

        self.wifi = WiFi.create()
        self.streaming = Streaming.create()
        self.schedules = Schedules.create()

        is_connected = await self.wifi.connect(force=True)

        print("Syncing time...")
        while is_connected:
            try:
                ntptime.settime()
                print("Time synced successfully.")
                break
            except Exception as e:  # noqa: BLE001
                print(f"Failed to sync time: {e}")
                await uasyncio.sleep(5)

        _ = RGB.create()

        gather = uasyncio.gather(self.streaming.start(), self.schedules.start())
        await gather

    async def start(self) -> None:
        if self.switch.value() == 0:
            await self._config_mode()
        else:
            await self._normal_mode()


if __name__ == "__main__":
    bootstrap = Bootstrap()

    try:
        uasyncio.run(bootstrap.start())
    except KeyboardInterrupt:
        print("Program interrupted by user.")
