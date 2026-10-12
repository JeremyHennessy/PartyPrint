"""Create the two raster brand assets from versioned SVG source files.
Only used when changing artwork; the production site has no Python runtime.
"""
from pathlib import Path
from io import BytesIO
import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
source = ASSETS / "partyprint-social.svg"
out = ASSETS / "partyprint-social.png"
cairosvg.svg2png(url=str(source), write_to=str(out))
image = Image.open(out).convert("RGB")
assert image.size == (1200, 630), image.size
image.quantize(colors=128, dither=Image.Dither.NONE).save(out, optimize=True)

mark = BytesIO()
cairosvg.svg2png(url=str(ASSETS / "partyprint-mark.svg"), write_to=mark,
                  output_width=156, output_height=156)
icon = Image.open(BytesIO(mark.getvalue())).convert("RGBA")
touch = Image.new("RGBA", (180, 180), "#fff9f2")
touch.alpha_composite(icon, (12, 12))
touch.convert("RGB").save(ASSETS / "apple-touch-icon.png", optimize=True)

for path in (out, ASSETS / "apple-touch-icon.png"):
    print(f"Created {path.relative_to(ROOT)} ({path.stat().st_size} bytes)")
