#!/usr/bin/env python3
"""Gera versões WebP otimizadas dos assets."""
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).parent / "assets"

CONFIG = {
    "BG-1.jpg": {"max_width": 1920, "quality": 82},
    "LOGO.png": {"max_width": 424, "quality": 90},
    "CELULAR.png": {"max_width": 702, "quality": 85},
}

CAROUSEL_QUALITY = 82
CAROUSEL_MAX_WIDTH = 560


def save_webp(img: Image.Image, dest: Path, quality: int) -> None:
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
    img.save(dest, "WEBP", quality=quality, method=6)


def resize(img: Image.Image, max_width: int) -> Image.Image:
    if img.width <= max_width:
        return img
    ratio = max_width / img.width
    return img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)


def main() -> None:
    dims: dict[str, tuple[int, int]] = {}

    for name, opts in CONFIG.items():
        src = ASSETS / name
        if not src.exists():
            print(f"skip missing {name}")
            continue
        img = Image.open(src)
        img = resize(img, opts["max_width"])
        dest = src.with_suffix(".webp")
        save_webp(img, dest, opts["quality"])
        dims[dest.stem] = img.size
        orig_kb = src.stat().st_size / 1024
        new_kb = dest.stat().st_size / 1024
        print(f"{name} -> {dest.name}: {orig_kb:.1f}KB -> {new_kb:.1f}KB {img.size}")

    for src in sorted(ASSETS.glob("Design-sem-nome-*.png")):
        img = Image.open(src)
        img = resize(img, CAROUSEL_MAX_WIDTH)
        dest = src.with_suffix(".webp")
        save_webp(img, dest, CAROUSEL_QUALITY)
        dims[dest.stem] = img.size
        orig_kb = src.stat().st_size / 1024
        new_kb = dest.stat().st_size / 1024
        print(f"{src.name} -> {dest.name}: {orig_kb:.1f}KB -> {new_kb:.1f}KB")

    print("\nDIMENSIONS_JSON")
    import json

    print(json.dumps(dims, indent=2))


if __name__ == "__main__":
    main()
