import asyncio
from typing import TypedDict

import ujson

from lib.config import load_config
from modules.wifi import WiFi


class Slot(TypedDict):
    position: str
    quantity: int


class Schedule(TypedDict):
    time: str
    slots: list[Slot]


class Schedules:
    path: str
    pins: dict[str, str | int] | None = None

    def __init__(self, path: str = "data/schedules.json"):
        config = load_config()

        self.path = path
        self.pins = config.get("pins")

    async def start(self) -> None:
        last_executed_time = ""
        schedules: list[Schedule] = []

        while True:
            try:
                now = WiFi.get_time()
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

            await asyncio.sleep(60)  # Check every minute

    def _read_schedule(self) -> list[Schedule]:
        try:
            with open(self.path, "r") as f:
                return ujson.load(f)  # pyright: ignore[reportAny]
        except OSError, ValueError:
            return []
