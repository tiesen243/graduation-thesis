import asyncio

import ntptime
from machine import Pin

from lib.config import Config
from lib.i18n import t
from lib.pins import Pins
from lib.schedule import Schedule
from modules.ble import BLE
from modules.wifi import WiFi
from tasks.display import Display
from tasks.schedules import Schedules
from tasks.streaming import Streaming
from tasks.sync_info import SyncInfo
from tasks.sync_schedule import SyncSchedule

CONFIG_MODE_VALUE = 0


class Bootstrap:
    _ble: BLE | None = None
    _wifi: WiFi | None = None
    _schedule: Schedule | None = None

    _streaming: Streaming | None = None
    _schedules: Schedules | None = None
    _sync_schedule: SyncSchedule | None = None
    _sync_info: SyncInfo | None = None
    _display: Display | None = None

    _switch: Pin

    def __init__(self) -> None:
        pins = Pins.create()
        self._switch = pins.switch

    async def _config_mode(self, stop_event: asyncio.Event) -> None:
        """Run Config Mode (BLE) until the mode switch is released."""
        self._ble = BLE.create()
        self._display = Display.create()
        self._display.show_config_mode()

        if not self._ble.is_ready():
            self._ble.activate()

        if self._ble.is_connected():
            self._ble.disconnect()

        self._ble.start_advertising()
        print(t("config.started"))

        try:
            while self._switch.value() == CONFIG_MODE_VALUE and not stop_event.is_set():
                await asyncio.sleep(0.2)
        except Exception as e:
            print(t("config.error", error=e))
        finally:
            if self._ble:
                self._ble.stop()
            print(t("config.stopped"))

    async def _watch_switch_in_normal(self, stop_event: asyncio.Event) -> None:
        """Monitor the switch during Normal Mode and signal stop_event when toggled to Config Mode."""
        while not stop_event.is_set():
            if self._switch.value() == CONFIG_MODE_VALUE:
                print(t("normal.switch_triggered"))
                stop_event.set()
                break
            await asyncio.sleep(0.3)

    async def _normal_mode(self, stop_event: asyncio.Event) -> None:
        """Run Normal Mode (WiFi, Sync, Tasks) and terminate cleanly when stop_event is set."""
        _ = Config.create(force=True)

        self._wifi = WiFi.create()
        self._schedule = Schedule.create()
        self._streaming = Streaming.create()
        self._schedules = Schedules.create()
        self._sync_schedule = SyncSchedule.create()
        self._sync_info = SyncInfo.create()
        self._display = Display.create()

        # Leave Config Mode visually immediately. Do not keep the
        # "Configuring..." screen while WiFi/device/schedule setup runs.
        self._display.show_boot_logo()

        retry_count, max_retries, is_connected = 0, 3, False
        while retry_count < max_retries and not stop_event.is_set():
            is_connected = await self._wifi.connect()
            if is_connected:
                break
            retry_count += 1
            print(
                t(
                    "setup.wifi_failed_attempt",
                    attempt=retry_count,
                    max_retries=max_retries,
                )
            )
            self._wifi.reset()
            await asyncio.sleep(2)

        if stop_event.is_set():
            return

        if not is_connected:
            print(t("setup.wifi_failed_max"))
            return

        print(t("setup.syncing_time"))
        retry_count, max_retries = 0, 3
        while is_connected and retry_count < max_retries and not stop_event.is_set():
            try:
                ntptime.settime()
                print(t("setup.time_synced"))
                break
            except Exception as e:
                retry_count += 1
                print(
                    t(
                        "setup.time_sync_failed",
                        attempt=retry_count,
                        max_retries=max_retries,
                        error=e,
                    )
                )
                await asyncio.sleep(2)

        if stop_event.is_set():
            return

        print(t("setup.syncing_device"))
        _ = await self._sync_info.execute()

        print(t("setup.syncing_schedules"))
        _ = await self._sync_schedule.execute()

        print(t("normal.setup_complete"))

        tasks = [
            asyncio.create_task(self._display.start()),
            asyncio.create_task(self._sync_schedule.start()),
            asyncio.create_task(self._streaming.start()),
            asyncio.create_task(self._schedules.start()),
            asyncio.create_task(self._watch_switch_in_normal(stop_event)),
        ]

        try:
            while not stop_event.is_set():
                await asyncio.sleep(0.5)
        finally:
            print(t("normal.cleaning"))
            for task in tasks:
                task.cancel()
            await asyncio.gather(*tasks, return_exceptions=True)
            print(t("normal.stopped"))

    async def start(self) -> None:
        """Main loop managing seamless soft transitions between Config Mode and Normal Mode."""
        while True:
            mode_stop_event = asyncio.Event()

            if self._switch.value() == CONFIG_MODE_VALUE:
                print("\n" + t("mode.enter_config"))
                await self._config_mode(mode_stop_event)
            else:
                print("\n" + t("mode.enter_normal"))
                await self._normal_mode(mode_stop_event)

            await self.stop()
            await asyncio.sleep(0.5)

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
        print(t("cleanup.interrupted"))
    except Exception as error:
        print(t("error.unexpected", error=error))
    finally:
        asyncio.run(bootstrap.stop())
        print(t("cleanup.stopped"))
