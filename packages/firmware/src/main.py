import ntptime
import uasyncio
from machine import Pin

from lib.config import Config
from lib.pins import Pins
from lib.schedule import Schedule
from modules.ble import BLE
from modules.wifi import WiFi
from tasks.schedules import Schedules
from tasks.streaming import Streaming
from tasks.sync_schedule import SyncSchedule


class Bootstrap:
    ble: BLE | None = None
    wifi: WiFi | None = None
    schedule: Schedule | None = None

    streaming: Streaming | None = None
    schedules: Schedules | None = None
    sync_schedule: SyncSchedule | None = None

    switch: Pin

    def __init__(self) -> None:
        pins = Pins.create()
        self.switch = pins.switch

    async def _config_mode(self) -> None:
        self.ble = BLE.create()

        if self.ble.ble and not self.ble.ble.active():
            self.ble.ble.active(True)

        self.ble.start_advertising()

        try:
            print("[CONFIG] Started. Waiting for switch to be released...")
            while self.switch.value() == 0:
                await uasyncio.sleep_ms(100)
        finally:
            self.ble.stop()
            print("[CONFIG] Stopped.")

    async def _normal_mode(self) -> None:
        _ = Config.create(force=True)

        self.wifi = WiFi.create()
        self.schedule = Schedule.create()
        self.streaming = Streaming.create()
        self.schedules = Schedules.create()
        self.sync_schedule = SyncSchedule.create()

        is_connected = await self.wifi.connect(force=True)

        print("[SETUP] Syncing time...")
        retry_count, max_retries = 0, 3
        while is_connected and retry_count < max_retries:
            try:
                ntptime.settime()
                print("[SETUP] Time synced successfully.")
                break
            except Exception as e:  # noqa: BLE001
                retry_count += 1
                print(
                    f"[SETUP] Failed to sync time (Attempt {retry_count}/{max_retries}): {e}"
                )
                await uasyncio.sleep(2)

        print("[SETUP] Syncing schedules...")
        _ = await self.sync_schedule.sync()

        gathered_tasks = uasyncio.gather(
            self.sync_schedule.start(),
            self.streaming.start(),
            self.schedules.start(),
        )
        await gathered_tasks

    async def start(self) -> None:
        switch_state = self.switch.value()

        if switch_state == 0:
            await self._config_mode()
        else:
            await self._normal_mode()


if __name__ == "__main__":
    bootstrap = Bootstrap()

    try:
        uasyncio.run(bootstrap.start())
    except KeyboardInterrupt:
        print("Program interrupted by user.")
