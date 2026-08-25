import time

from lib.config import load_config


def get_current_time() -> time.struct_time:
    """
    Get the current time adjusted for UTC offset.

    Returns:
        time.struct_time: The current local time adjusted for UTC offset.
    """
    config = load_config()

    utc_offset = config.get("utc", 0)

    current_time = time.time() + (utc_offset * 3600)
    return time.localtime(current_time)
