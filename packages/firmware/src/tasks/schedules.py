import asyncio

import ujson

from lib.config import load_config
from lib.utils import get_current_time


class Schedules:
    path: str
    pins: dict[str, str | int] | None = None

    def __init__(self, path: str = "data/schedules.json"):
        config = load_config()

        self.path = path
        self.pins = config.get("pins")

    async def start(self) -> None:
        last_executed_time = ""
        schedules: list = []

        while True:
            try:
                now = get_current_time()
                current_time: str = f"{now[3]:02d}:{now[4]:02d}"

                if current_time != last_executed_time:
                    last_executed_time = current_time

                    try:
                        schedules = await asyncio.to_thread(self._read_schedule)
                    except Exception:  # noqa: BLE001
                        schedules = []

                    for schedule in schedules:
                        item_time = schedule.get("time")
                        if item_time == current_time:
                            print(f"Executing schedule at {current_time}: {schedule}")

            except Exception as e:  # noqa: BLE001
                print(f"Error in schedule execution: {e}")

            await asyncio.sleep(60)

    def _read_schedule(self) -> list:
        try:
            with open(self.path, "r") as f:
                return ujson.load(f)
        except Exception:  # noqa: BLE001
            return []
