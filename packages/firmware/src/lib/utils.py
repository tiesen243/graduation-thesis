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


def rgb(r: int, g: int, b: int) -> int:
    return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)


def clamp(value: int, _min: int, _max: int) -> int:
    return max(_min, min(_max, value))


def print_table(data: list[dict], keys: list[str] | None = None) -> None:
    if not data:
        print("Empty table")
        return

    if keys is None:
        keys = list(data[0].keys())

    col_widths = {}
    for k in keys:
        max_w = len(str(k))
        for row in data:
            val_str = str(row.get(k, ""))
            max_w = max(max_w, len(val_str))
        col_widths[k] = max_w

    sep = "+" + "+".join("-" * (col_widths[k] + 2) for k in keys) + "+"

    header_cols = [f" {k!s:<{col_widths[k]}} " for k in keys]
    header = "|" + "|".join(header_cols) + "|"

    print(sep)
    print(header)
    print(sep)

    for row in data:
        row_cols = [f" {row.get(k, '')!s:<{col_widths[k]}} " for k in keys]
        line = "|" + "|".join(row_cols) + "|"
        print(line)

    print(sep)
