import time

from lib.config import Config


def get_current_time() -> time.struct_time:
    """
    Get the current time adjusted for UTC offset.

    Returns:
        time.struct_time: The current local time adjusted for UTC offset.
    """
    config = Config.create()
    utc_offset = config.get("utc", 0)

    current_time = time.time() + (utc_offset * 3600)
    return time.localtime(current_time)


def rgb(r: int, g: int, b: int, invert: bool = False) -> int:
    """Convert 8-bit RGB channels to a packed RGB565 integer."""
    if invert:
        val = ((b & 0xF8) << 8) | ((g & 0xFC) << 3) | (r >> 3)
    else:
        val = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)

    return val


def swap_color(color: int) -> int:
    """Swap the byte order of a packed 16-bit color value."""
    # Swap the two bytes so framebuf receives RGB565 in the expected order.
    return ((color & 0xFF) << 8) | ((color >> 8) & 0xFF)


def clamp(value: int, _min: int, _max: int) -> int:
    """Clamp a numeric value to the inclusive range [_min, _max]."""
    return max(_min, min(_max, value))


def print_table(data: list[dict], keys: list[str] | None = None) -> None:
    """Print records as a compact ASCII table for diagnostics."""
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
