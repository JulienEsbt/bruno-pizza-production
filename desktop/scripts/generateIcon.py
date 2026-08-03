from pathlib import Path

from PIL import Image, ImageDraw


ASSETS_DIRECTORY = Path(__file__).resolve().parents[1] / "assets"
CANVAS_SIZE = 1024


def create_icon() -> Image.Image:
    icon = Image.new(
        "RGBA",
        (CANVAS_SIZE, CANVAS_SIZE),
        (0, 0, 0, 0),
    )
    draw = ImageDraw.Draw(icon)

    for offset, alpha in ((36, 24), (24, 36), (12, 54)):
        draw.rounded_rectangle(
            (64 + offset, 64 + offset, 960 + offset, 960 + offset),
            radius=220,
            fill=(8, 15, 30, alpha),
        )

    draw.rounded_rectangle(
        (64, 64, 960, 960),
        radius=220,
        fill="#172033",
        outline="#2c3a52",
        width=18,
    )

    draw.polygon(
        ((274, 306), (762, 350), (468, 812)),
        fill="#f8cf62",
        outline="#f59e0b",
        width=24,
    )
    draw.line(
        ((260, 286), (773, 332)),
        fill="#e97e16",
        width=112,
        joint="curve",
    )
    draw.line(
        ((269, 276), (765, 321)),
        fill="#f5a13b",
        width=66,
    )

    for center, radius in (
        ((420, 430), 52),
        ((603, 458), 48),
        ((493, 614), 46),
    ):
        x, y = center
        draw.ellipse(
            (x - radius, y - radius, x + radius, y + radius),
            fill="#d9483b",
            outline="#a9222a",
            width=12,
        )
        draw.ellipse(
            (x - 15, y - 19, x + 2, y - 2),
            fill="#f47b64",
        )

    draw.ellipse(
        (355, 346, 390, 381),
        fill="#fff3bd",
    )
    draw.ellipse(
        (664, 376, 701, 413),
        fill="#fff3bd",
    )

    return icon


def main() -> None:
    ASSETS_DIRECTORY.mkdir(parents=True, exist_ok=True)
    icon = create_icon()

    icon.save(ASSETS_DIRECTORY / "bruno-pizza.png")
    icon.save(
        ASSETS_DIRECTORY / "bruno-pizza.ico",
        sizes=[
            (16, 16),
            (24, 24),
            (32, 32),
            (48, 48),
            (64, 64),
            (128, 128),
            (256, 256),
        ],
    )
    icon.save(
        ASSETS_DIRECTORY / "bruno-pizza.icns",
        sizes=[
            (16, 16),
            (32, 32),
            (64, 64),
            (128, 128),
            (256, 256),
            (512, 512),
            (1024, 1024),
        ],
    )


if __name__ == "__main__":
    main()
