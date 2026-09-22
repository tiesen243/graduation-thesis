import asyncio

from lib.api import Api
from lib.config import Config
from lib.schedule import Schedule
from lib.utils import get_current_time


class SyncSchedule:
    __instance: SyncSchedule | None = None

    _api: Api
    _schedule: Schedule
    _sync_time: str

    def __init__(self) -> None:
        config = Config.create()
        self._sync_time = config.get("sync_time", "04:00:00")

        self._api = Api.create()
        self._schedule = Schedule.create()

    async def execute(self):
        """
        Fetch today's schedule from the server using the current system date and persist it locally.

        Sync Workflow:
            - Retrieves current date formatted as YYYY-MM-DD from the utility provider.
            - Requests schedule data via the API client.
            - Saves the payload through the local schedule manager.

        :return: None
        """
        today = get_current_time()
        today = f"{today[0]:04d}-{today[1]:02d}-{today[2]:02d}"

        resp = await self._api.get("/api/schedules/today", params={"date": today})
        if resp.get("error") is not None:
            print(
                f"[SyncSchedule] Error fetching today's schedule: {resp.get('error')}"
            )
            return

        if self._schedule.save_schedules(resp.get("data", [])):
            print(f"[SyncSchedule] Schedules for {today} synced successfully.")
        else:
            print(f"[SyncSchedule] Failed to save schedules for {today}.")

    async def start(self) -> None:
        """
        Continuously monitor time and trigger sync once per day from 4:00 AM onwards.

        :return: None
        """
        print(
            "[Startup] SyncSchedule task initiated...", {"sync_time": self._sync_time}
        )
        last_synced_date = None

        sync_hour, sync_minute = map(int, self._sync_time.split(":"))

        while True:
            try:
                now = get_current_time()
                today_str = f"{now[0]:04d}-{now[1]:02d}-{now[2]:02d}"
                current_hour = now[3]

                if current_hour >= sync_hour and last_synced_date != today_str:
                    print(
                        f"[SyncSchedule] It's past {sync_hour}:{sync_minute}. Starting daily schedule sync..."
                    )
                    await self.execute()
                    last_synced_date = today_str

            except Exception as e:
                print(f"[SyncSchedule] Error: {e}")

            await asyncio.sleep(1800)

    @classmethod
    def create(cls):
        if cls.__instance is None:
            cls.__instance = SyncSchedule()
        return cls.__instance
