"""Regression check for the glass card preview.

Renders GlassCardPreview and asserts:
1. The frosting is real: blurred vs blurPx=0 renders differ behind the card.
2. White text stays readable: contrast vs the brightest pixel behind it >= 4.5.

Usage: python3 scripts/check_glass.py  (set REMOTION_BROWSER to a Chromium binary if needed)
"""
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageChops

BROWSER = os.environ.get("REMOTION_BROWSER", "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell")
TEXT_FRAME, BG_FRAME = 60, 5  # BG_FRAME is before the text entrance starts


def still(out, frame, props=None):
    cmd = ["npx", "remotion", "still", "src/index.ts", "GlassCardPreview", out, f"--frame={frame}"]
    if props:
        cmd.append(f"--props={json.dumps(props)}")
    if os.path.exists(BROWSER):
        cmd.append(f"--browser-executable={BROWSER}")
    subprocess.run(cmd, check=True, capture_output=True)
    return Image.open(out).convert("RGB")


def lum(c):
    c = [x / 255 for x in c]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


tmp = tempfile.mkdtemp()
frosted = still(f"{tmp}/a.png", TEXT_FRAME)
clear = still(f"{tmp}/b.png", TEXT_FRAME, {"blurPx": 0})
background = still(f"{tmp}/c.png", BG_FRAME)

blur_diff = ImageChops.difference(frosted, clear).convert("L").point(lambda v: 255 if v > 15 else 0)
changed = sum(1 for v in blur_diff.get_flattened_data() if v)
text_box = ImageChops.difference(frosted, background).convert("L").point(lambda v: 255 if v > 10 else 0).getbbox()
contrast = 1.05 / (max(lum(p) for p in background.crop(text_box).get_flattened_data()) + 0.05)

print(f"blur changed pixels: {changed}  text contrast: {contrast:.2f}")
ok = changed > 1000 and contrast >= 4.5
print("PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
