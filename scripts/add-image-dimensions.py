#!/usr/bin/env python3
"""Add missing image_width / image_height to post front matter.

Reads each post's ``image:`` path, measures the file, and inserts dimensions
only when they are absent. Intended for local use and the git pre-commit hook.

Usage:
  scripts/add-image-dimensions.py                 # all _posts/*.md
  scripts/add-image-dimensions.py _posts/foo.md   # specific files
  scripts/add-image-dimensions.py --staged        # staged _posts/*.md only
"""

from __future__ import annotations

import argparse
import re
import struct
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = REPO_ROOT / "_posts"

IMAGE_RE = re.compile(r"^image:\s*(.+)$", re.M)
WIDTH_RE = re.compile(r"^image_width:\s*(.*)$", re.M)
HEIGHT_RE = re.compile(r"^image_height:\s*(.*)$", re.M)
ALT_RE = re.compile(r"^image-alt:.*$", re.M)


def has_valid_dimensions(text: str) -> bool:
    width_match = WIDTH_RE.search(text)
    height_match = HEIGHT_RE.search(text)
    if not width_match or not height_match:
        return False
    return width_match.group(1).strip().isdigit() and height_match.group(
        1
    ).strip().isdigit()


def png_size(data: bytes) -> tuple[int, int] | None:
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", data[16:24])


def jpeg_size(data: bytes) -> tuple[int, int] | None:
    if data[:2] != b"\xff\xd8":
        return None
    i = 2
    while i < len(data) - 8:
        if data[i] != 0xFF:
            return None
        marker = data[i + 1]
        if marker in (0xC0, 0xC1, 0xC2):
            h, w = struct.unpack(">HH", data[i + 5 : i + 9])
            return w, h
        length = struct.unpack(">H", data[i + 2 : i + 4])[0]
        i += 2 + length
    return None


def webp_size(data: bytes) -> tuple[int, int] | None:
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return None
    if data[12:16] == b"VP8X":
        w = 1 + int.from_bytes(data[24:27], "little")
        h = 1 + int.from_bytes(data[27:30], "little")
        return w, h
    if data[12:16] == b"VP8 ":
        w, h = struct.unpack("<HH", data[26:30])
        return w & 0x3FFF, h & 0x3FFF
    if data[12:16] == b"VP8L":
        b = int.from_bytes(data[21:25], "little")
        return (b & 0x3FFF) + 1, ((b >> 14) & 0x3FFF) + 1
    return None


def svg_size(text: str) -> tuple[int, int] | None:
    wm = re.search(r'\bwidth=["\']?([\d.]+)', text)
    hm = re.search(r'\bheight=["\']?([\d.]+)', text)
    if wm and hm:
        return round(float(wm.group(1))), round(float(hm.group(1)))
    vb = re.search(
        r'viewBox=["\']?\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)', text
    )
    if vb:
        return round(float(vb.group(1))), round(float(vb.group(2)))
    return None


def image_size(path: Path) -> tuple[int, int] | None:
    data = path.read_bytes()
    suffix = path.suffix.lower()
    if suffix == ".png":
        return png_size(data)
    if suffix in (".jpg", ".jpeg"):
        return jpeg_size(data)
    if suffix == ".webp":
        return webp_size(data)
    if suffix == ".svg":
        return svg_size(data.decode("utf-8", "replace"))
    return None


def resolve_image_path(raw: str) -> Path | None:
    value = raw.strip().strip("\"'")
    if not value or value in ("images/", "/images/", "images", "/images"):
        return None
    rel = value.lstrip("/")
    path = REPO_ROOT / rel
    return path if path.is_file() else None


def staged_post_paths() -> list[Path]:
    result = subprocess.run(
        [
            "git",
            "diff",
            "--cached",
            "--name-only",
            "--diff-filter=ACMRT",
            "--",
            "_posts/*.md",
        ],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    paths = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if line:
            paths.append(REPO_ROOT / line)
    return paths


def insert_dimensions(text: str, width: int, height: int) -> str:
    dims = f"image_width: {width}\nimage_height: {height}"
    if ALT_RE.search(text):
        return ALT_RE.sub(lambda m: f"{m.group(0)}\n{dims}", text, count=1)
    return IMAGE_RE.sub(lambda m: f"{m.group(0)}\n{dims}", text, count=1)


def process_post(path: Path) -> str | None:
    """Return a status message if the file was updated, else None."""
    text = path.read_text(encoding="utf-8")
    image_match = IMAGE_RE.search(text)
    if not image_match:
        return None

    if has_valid_dimensions(text):
        return None

    image_path = resolve_image_path(image_match.group(1))
    if image_path is None:
        print(
            f"add-image-dimensions: skip {path.relative_to(REPO_ROOT)} "
            f"(image missing or placeholder: {image_match.group(1).strip()})",
            file=sys.stderr,
        )
        return None

    size = image_size(image_path)
    if size is None:
        raise RuntimeError(
            f"could not read dimensions for {image_path.relative_to(REPO_ROOT)} "
            f"(from {path.relative_to(REPO_ROOT)})"
        )

    width, height = int(size[0]), int(size[1])
    # Drop blank/partial dims, then insert a complete pair
    text2 = WIDTH_RE.sub("", text)
    text2 = HEIGHT_RE.sub("", text2)
    text2 = insert_dimensions(text2, width, height)

    if text2 == text:
        return None

    path.write_text(text2, encoding="utf-8")
    return f"{path.relative_to(REPO_ROOT)}: {width}x{height}"


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "files",
        nargs="*",
        type=Path,
        help="Post markdown files (default: all _posts/*.md)",
    )
    parser.add_argument(
        "--staged",
        action="store_true",
        help="Only process staged files under _posts/",
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)

    if args.staged:
        posts = staged_post_paths()
    elif args.files:
        posts = []
        for raw in args.files:
            path = raw if raw.is_absolute() else REPO_ROOT / raw
            posts.append(path.resolve())
    else:
        posts = sorted(POSTS_DIR.glob("*.md"))

    if not posts:
        return 0

    updated: list[str] = []
    try:
        for post in posts:
            if not post.is_file():
                print(
                    f"add-image-dimensions: not a file: {post}",
                    file=sys.stderr,
                )
                return 1
            message = process_post(post)
            if message:
                updated.append(message)
    except RuntimeError as exc:
        print(f"add-image-dimensions: {exc}", file=sys.stderr)
        return 1

    for message in updated:
        print(f"add-image-dimensions: {message}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
