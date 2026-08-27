import subprocess
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"

files = [
    p
    for p in SRC_DIR.rglob("*")
    if p.is_file() and "__pycache__" not in p.parts and not p.name.startswith(".")
]


def main():
    print("Resetting Pico...")
    _ = subprocess.run(["mpremote", "soft-reset"], check=False)

    directories = set()
    for f in files:
        rel_parent = f.relative_to(SRC_DIR).parent
        if str(rel_parent) != ".":
            directories.add(rel_parent.as_posix())

    sorted_dirs = sorted(directories, key=len)
    if sorted_dirs:
        print("Creating directories on Pico...")
        for d in sorted_dirs:
            print(f"  - Creating folder: {d}")
            _ = subprocess.run(
                ["mpremote", "mkdir", f":{d}"], stderr=subprocess.DEVNULL, check=False
            )

    print("Uploading files to Pico...")
    for f in files:
        rel_path = f.relative_to(SRC_DIR).as_posix()
        print(f"  -> Uploading: {rel_path}")
        _ = subprocess.run(["mpremote", "cp", str(f), f":{rel_path}"], check=False)

    print("Upload completed successfully!")


if __name__ == "__main__":
    main()
