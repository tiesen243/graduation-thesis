import uasyncio

from lib.api import Api
from lib.config import Config
from lib.schedule import Schedule
from lib.utils import get_current_time


class SyncSchedule:
    __instance: SyncSchedule | None = None

    api: Api
    schedule: Schedule
    sync_time: str

    def __init__(self) -> None:
        config = Config.create()
        self.sync_time = config.get("sync_time", "04:00:00")

        self.api = Api.create()
        self.schedule = Schedule.create()

    async def sync(self):
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

        resp = await self.api.get("/api/schedules/today", params={"date": today})
        is_saved = self.schedule.save_schedules(resp.get("data", []))

        if is_saved:
            print(f"[SYNC] Schedules for {today} synced successfully.")
        else:
            print(f"[SYNC] Failed to save schedules for {today}.")

    async def start(self) -> None:
        """
        Continuously monitor time and trigger sync once per day from 4:00 AM onwards.

        :return: None
        """
        print(
            "[STARTUP] SyncSchedule task initiated...\n", {"sync_time": self.sync_time}
        )
        last_synced_date = None

        sync_hour, sync_minute = map(int, self.sync_time.split(":"))

        while True:
            try:
                now = get_current_time()
                today_str = f"{now[0]:04d}-{now[1]:02d}-{now[2]:02d}"
                current_hour = now[3]

                if current_hour >= sync_hour and last_synced_date != today_str:
                    print(
                        f"[SYNC] It's past {sync_hour}:{sync_minute}. Starting daily schedule sync..."
                    )
                    await self.sync()
                    last_synced_date = today_str

            except Exception as e:  # noqa: BLE001
                print(f"[SYNC] Error: {e}")

            await uasyncio.sleep(1800)

    @classmethod
    def create(cls):
        if cls.__instance is None:
            cls.__instance = SyncSchedule()
        return cls.__instance
