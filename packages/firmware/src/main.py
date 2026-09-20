import asyncio

import ntptime
from machine import Pin

from lib.config import Config
from lib.pins import Pins
from lib.schedule import Schedule
from modules.ble import BLE
from modules.wifi import WiFi
from tasks.schedules import Schedules
from tasks.streaming import Streaming
from tasks.sync_info import SyncInfo
from tasks.sync_schedule import SyncSchedule


class Bootstrap:
    _ble: BLE | None = None
    _wifi: WiFi | None = None
    _schedule: Schedule | None = None

    _streaming: Streaming | None = None
    _schedules: Schedules | None = None
    _sync_schedule: SyncSchedule | None = None
    _sync_info: SyncInfo | None = None

    _switch: Pin

    def __init__(self) -> None:
        pins = Pins.create()
        self._switch = pins.switch

    async def _config_mode(self) -> None:
        self._ble = BLE.create()

        if not self._ble.is_ready():
            self._ble.activate()

        if self._ble.is_connected():
            self._ble.disconnect()

        self._ble.start_advertising()

        try:
            print("[Config] Started. Waiting for switch to be released...")
            while self._switch.value() == 1:
                await asyncio.sleep(0.1)
        finally:
            self._ble.stop()
            print("[Config] Stopped.")

    async def _normal_mode(self) -> None:
        _ = Config.create(force=True)

        self._wifi = WiFi.create()
        self._schedule = Schedule.create()
        self._streaming = Streaming.create()
        self._schedules = Schedules.create()
        self._sync_schedule = SyncSchedule.create()
        self._sync_info = SyncInfo.create()

        is_connected = await self._wifi.connect()

        print("[Setup] Syncing time...")
        retry_count, max_retries = 0, 3
        while is_connected and retry_count < max_retries:
            try:
                ntptime.settime()
                print("[Setup] Time synced successfully.")
                break
            except Exception as e:
                retry_count += 1
                print(
                    f"[Setup] Failed to sync time (Attempt {retry_count}/{max_retries}): {e}"
                )
                await asyncio.sleep(2)

        print("[Setup] Syncing device info...")
        _ = await self._sync_info.execute()

        print("[Setup] Syncing schedules...")
        _ = await self._sync_schedule.execute()

        gathered_tasks = asyncio.gather(
            self._sync_schedule.start(),
            self._streaming.start(),
            self._schedules.start(),
        )
        await gathered_tasks

    async def start(self) -> None:
        switch_state = self._switch.value()

        if switch_state == 1:
            await self._config_mode()
        else:
            await self._normal_mode()

    async def stop(self) -> None:
        if self._ble and self._ble.is_connected():
            self._ble.stop()
        if self._wifi:
            self._wifi.disconnect()


if __name__ == "__main__":
    bootstrap = Bootstrap()

    try:
        asyncio.run(bootstrap.start())
    except KeyboardInterrupt:
        print("[Cleanup] Program interrupted by user.")
    except Exception as error:
        print(f"[Error] Unexpected error: {error}")
    finally:
        asyncio.run(bootstrap.stop())
        print("[Cleanup] Program stopped.")
