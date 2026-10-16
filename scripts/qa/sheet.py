"""Contact sheet of stills (+ optional side-by-side with the reference analysis sheet).
python3 scripts/qa/sheet.py <stills.json> <out.jpg> [--ref docs/styles/<id>/ref-sheet.jpg] [--cols 4] [--width 1600]"""
import json, sys, argparse
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('meta'); ap.add_argument('out')
ap.add_argument('--ref'); ap.add_argument('--cols', type=int, default=0); ap.add_argument('--width', type=int, default=1600)
a = ap.parse_args()
m = json.load(open(a.meta))
files = m['files']
ims = [Image.open(f['file']).convert('RGB') for f in files]
w0, h0 = ims[0].size
cols = a.cols or (6 if h0 > w0 else 4)
cw = a.width // cols
ch = int(cw * h0 / w0)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cw, rows * (ch + 22) + 28), (24, 24, 30))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except Exception:
    font = ImageFont.load_default()
d.text((8, 6), a.meta.split('/')[-1] + f"  ({len(ims)} stills, errors: {len(m.get('errors', []))})", fill=(220, 220, 230), font=font)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * cw, 28 + (i // cols) * (ch + 22)
    sheet.paste(im.resize((cw - 4, ch - 4)), (x + 2, y + 2))
    d.text((x + 6, y + ch + 3), f"{f['t']:.1f}s", fill=(200, 200, 210), font=font)
if a.ref:
    ref = Image.open(a.ref).convert('RGB')
    H = max(sheet.height, 1)
    ref = ref.resize((int(ref.width * H / ref.height), H))
    both = Image.new('RGB', (sheet.width + ref.width + 12, H), (10, 10, 12))
    both.paste(sheet, (0, 0)); both.paste(ref, (sheet.width + 12, 0))
    sheet = both
sheet.save(a.out, quality=82)
print(a.out, sheet.size)
