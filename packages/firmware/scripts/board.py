from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
SOURCE_DIR = PROJECT_ROOT / "../src"
PROTECTED_REMOTE_PATHS = {"data"}
EXCLUDED_DIRS = {"__pycache__", ".git", ".mypy_cache", ".pytest_cache"}
EXCLUDED_SUFFIXES = {".pyc", ".pyo"}


def run_mpremote(
    arguments: list[str],
    *,
    dry_run: bool = False,
    ignore_missing: bool = False,
) -> None:
    """Run an mpremote command, optionally ignoring missing remote paths."""
    command = ["mpremote", *arguments]
    if dry_run:
        print("$", " ".join(command))

    if dry_run:
        return

    result = subprocess.run(
        command,
        check=False,
        capture_output=True,
        text=True,
    )

    if result.returncode == 0:
        return

    output = "\n".join(part for part in (result.stdout, result.stderr) if part).strip()

    if ignore_missing and "No such file or directory" in output:
        print(f"[INFO] Remote path does not exist; skipping: {arguments[-1]}")
        return

    raise subprocess.CalledProcessError(
        result.returncode,
        command,
        output=output,
    )


def validate_source_directory() -> None:
    """Validate that the source directory exists and contains no local data directory."""
    if not SOURCE_DIR.is_dir():
        raise FileNotFoundError(f"Source directory not found: {SOURCE_DIR}")

    if (SOURCE_DIR / "data").exists():
        raise RuntimeError("The local src/data path is not allowed.")


def iter_source_files() -> list[Path]:
    """Return deployable source files while excluding caches and compiled files."""
    files: list[Path] = []

    for path in SOURCE_DIR.rglob("*"):
        if not path.is_file():
            continue

        relative_parts = path.relative_to(SOURCE_DIR).parts
        if any(part in EXCLUDED_DIRS for part in relative_parts):
            continue
        if path.suffix in EXCLUDED_SUFFIXES:
            continue

        files.append(path)

    return sorted(files)


def get_remote_entries(files: list[Path]) -> list[str]:
    """Return top-level remote entries managed by the local source directory."""
    entries = sorted({file.relative_to(SOURCE_DIR).parts[0] for file in files})

    for entry in entries:
        if entry in PROTECTED_REMOTE_PATHS:
            raise RuntimeError(f"Refusing to modify protected path: /{entry}")

    return entries


def remove_remote_entries(entries: list[str], *, dry_run: bool) -> None:
    """Remove managed remote entries without touching protected directories."""
    for entry in entries:
        run_mpremote(
            ["fs", "rm", "-r", f":/{entry}"],
            dry_run=dry_run,
            ignore_missing=True,
        )


def ensure_remote_directories(files: list[Path], *, dry_run: bool) -> None:
    """Create required remote parent directories before uploading files."""
    directories: set[str] = set()

    for file in files:
        relative_path = file.relative_to(SOURCE_DIR)
        parent = relative_path.parent

        if str(parent) == ".":
            continue

        parts = parent.parts
        for index in range(1, len(parts) + 1):
            directories.add("/" + "/".join(parts[:index]))

    for directory in sorted(directories, key=lambda value: (value.count("/"), value)):
        run_mpremote(
            ["fs", "mkdir", f":{directory}"],
            dry_run=dry_run,
            ignore_missing=False,
        )


def _print_progress(current: int, total: int, label: str) -> None:
    """Render a compact terminal progress bar for an upload operation."""
    width = 28
    ratio = current / total if total else 1
    completed = int(width * ratio)
    bar = "#" * completed + "-" * (width - completed)
    percentage = ratio * 100
    terminal_width = shutil.get_terminal_size((100, 20)).columns
    message = f"[{bar}] {current}/{total} ({percentage:5.1f}%) {label}"
    print(
        "\r" + message[: terminal_width - 1].ljust(terminal_width - 1),
        end="",
        flush=True,
    )
    if current >= total:
        print()


def upload_files(files: list[Path], *, dry_run: bool) -> None:
    """Upload source files to matching paths under the board filesystem root."""
    ensure_remote_directories(files, dry_run=dry_run)

    total = len(files)
    print(f"[INFO] Uploading {total} files...")

    for index, file in enumerate(files, start=1):
        relative_path = file.relative_to(SOURCE_DIR).as_posix()
        run_mpremote(
            ["fs", "cp", str(file), f":/{relative_path}"],
            dry_run=dry_run,
        )
        _print_progress(index, total, relative_path)


def deploy(*, dry_run: bool) -> int:
    """Clean managed files and deploy the local source tree."""
    validate_source_directory()
    files = iter_source_files()

    if not files:
        raise RuntimeError("No deployable source files found.")

    entries = get_remote_entries(files)
    print(f"[INFO] Found {len(files)} source files.")
    print(f"[INFO] Managed remote entries: {', '.join(entries)}")
    print("[INFO] Protected remote path: /data")

    remove_remote_entries(entries, dry_run=dry_run)
    upload_files(files, dry_run=dry_run)
    print("[SUCCESS] Deployment completed.")
    return 0


def destroy(*, dry_run: bool) -> int:
    """Delete all remote entries represented by local src/, excluding /data."""
    validate_source_directory()
    files = iter_source_files()

    if not files:
        raise RuntimeError("No managed source entries found.")

    entries = get_remote_entries(files)
    print(f"[INFO] Managed remote entries to remove: {', '.join(entries)}")
    print("[INFO] Protected remote path: /data")

    remove_remote_entries(entries, dry_run=dry_run)
    print("[SUCCESS] Destroy completed.")
    return 0


def parse_args() -> argparse.Namespace:
    """Parse board command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Deploy or destroy firmware files on a MicroPython board."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    deploy_parser = subparsers.add_parser(
        "deploy", help="Clean and upload src/ to the board root."
    )
    _ = deploy_parser.add_argument(
        "--dry-run", action="store_true", help="Print commands without executing them."
    )

    destroy_parser = subparsers.add_parser(
        "destroy", help="Remove uploaded source entries from the board."
    )
    _ = destroy_parser.add_argument(
        "--dry-run", action="store_true", help="Print commands without executing them."
    )

    return parser.parse_args()


def main() -> int:
    """Execute the selected board operation and report failures."""
    args = parse_args()

    try:
        if args.command == "deploy":
            return deploy(dry_run=args.dry_run)
        if args.command == "destroy":
            return destroy(dry_run=args.dry_run)

        raise RuntimeError(f"Unsupported command: {args.command}")
    except (FileNotFoundError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"[ERROR] Board operation failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
