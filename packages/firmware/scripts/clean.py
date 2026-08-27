import subprocess


def get_pico_items(path: str = ""):
    """Get list of files and directories from a path on Pico."""
    prefix = f":{path}" if path else ":"
    res = subprocess.run(
        ["mpremote", "ls", prefix], capture_output=True, text=True, check=False
    )

    items = []
    for line in res.stdout.splitlines():
        line = line.strip()
        if not line or line.startswith("ls "):
            continue

        parts = line.split()
        if len(parts) >= 2:
            raw_name = parts[-1]
            clean_name = raw_name.rstrip("/")

            if clean_name in (".", "..", "data", ".trash"):
                continue

            is_dir = parts[0].startswith("d") or raw_name.endswith("/")
            full_path = f"{path}/{clean_name}" if path else clean_name
            items.append((full_path, is_dir))

    return items


def clean_pico(path: str = ""):
    """Recursively delete files/folders on Pico except 'data'."""
    items = get_pico_items(path)

    for item_path, is_dir in items:
        if is_dir:
            clean_pico(item_path)
            print(f"  - Removing folder: {item_path}")
            _ = subprocess.run(["mpremote", "rmdir", f":{item_path}"], check=False)
        else:
            print(f"  - Removing file:   {item_path}")
            _ = subprocess.run(["mpremote", "rm", f":{item_path}"], check=False)


def main():
    print("Cleaning Pico filesystem (keeping 'data' directory)...")
    clean_pico()
    print("Cleanup completed successfully!")


if __name__ == "__main__":
    main()
