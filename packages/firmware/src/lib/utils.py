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


def print_table(data: list[dict], keys: list[str] | None = None) -> None:
    if not data:
        print("Empty table")
        return

    if keys is None:
        keys = list(data[0].keys())

    # Tính độ rộng cột (đảm bảo tóm gọn chuỗi items phức tạp)
    col_widths = {}
    for k in keys:
        max_w = len(str(k))
        for row in data:
            val_str = str(row.get(k, ""))
            max_w = max(max_w, len(val_str))
        col_widths[k] = max_w

    # Đường kẻ ngang
    sep = "+" + "+".join("-" * (col_widths[k] + 2) for k in keys) + "+"

    # In Header (Dùng f-string formatting căn lề trái)
    header_cols = [f" {k!s:<{col_widths[k]}} " for k in keys]
    header = "|" + "|".join(header_cols) + "|"

    print(sep)
    print(header)
    print(sep)

    # In từng dòng Dữ liệu
    for row in data:
        row_cols = [f" {row.get(k, '')!s:<{col_widths[k]}} " for k in keys]
        line = "|" + "|".join(row_cols) + "|"
        print(line)

    print(sep)
