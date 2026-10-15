#!/usr/bin/env python3
"""Synthetic 'talking head' clip for the mode C demo: an illustrated speaker whose mouth follows the
voice loudness, blinking and swaying — so silence cuts, punch-in zooms and split screens can be shown
without real footage. Labelled as a synthetic demo in the UI. Writes public/demo/talking.webm."""
import subprocess, numpy as np, os, math
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'demo')
W, H, FPS = 720, 1280, 30
pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f'{ROOT}/talking.mp3', '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768
spf = 16000 // FPS
n = len(a) // spf
rms = np.array([np.sqrt(np.mean(a[i*spf:(i+1)*spf] ** 2)) for i in range(n)])
rms = rms / (np.percentile(rms, 95) + 1e-6)
mouth = np.clip(np.convolve(rms, np.ones(3) / 3, mode='same'), 0, 1.2)

# static background: a warm room with a blurred window and a plant shape
bg = Image.new('RGB', (W, H))
d = ImageDraw.Draw(bg)
for y in range(H):
    t = y / H
    d.line([(0, y), (W, y)], fill=(int(58 + 40 * t), int(48 + 30 * t), int(70 + 20 * t)))
d.rectangle([60, 180, 330, 620], fill=(150, 175, 205))
d.rectangle([80, 200, 310, 600], fill=(190, 210, 230))
d.ellipse([480, 700, 700, 980], fill=(52, 110, 80))
d.rectangle([560, 950, 620, 1150], fill=(120, 80, 60))
bg = bg.filter(ImageFilter.GaussianBlur(14))

proc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                         '-i', f'{ROOT}/talking.mp3', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', '-pix_fmt', 'yuv420p', '-c:a', 'libopus', '-b:a', '80k',
                         '-shortest', f'{ROOT}/talking.webm'], stdin=subprocess.PIPE)
for f in range(n):
    im = bg.copy()
    d = ImageDraw.Draw(im)
    sway = math.sin(f / 23) * 8
    cx = W // 2 + int(sway)
    # shoulders / shirt
    d.rounded_rectangle([cx - 250, 930, cx + 250, 1400], radius=140, fill=(40, 90, 160))
    d.polygon([(cx - 70, 930), (cx + 70, 930), (cx, 1040)], fill=(235, 235, 240))
    # neck + head
    d.rectangle([cx - 55, 820, cx + 55, 960], fill=(196, 140, 110))
    d.ellipse([cx - 165, 420, cx + 165, 880], fill=(214, 160, 128))
    d.chord([cx - 175, 390, cx + 175, 700], 180, 360, fill=(45, 32, 28))  # hair
    d.ellipse([cx - 185, 600, cx - 145, 690], fill=(200, 145, 115))
    d.ellipse([cx + 145, 600, cx + 185, 690], fill=(200, 145, 115))
    blink = (f % 110) < 4
    for ex in (-65, 65):
        if blink:
            d.line([cx + ex - 22, 650, cx + ex + 22, 650], fill=(40, 30, 30), width=6)
        else:
            d.ellipse([cx + ex - 22, 632, cx + ex + 22, 668], fill=(255, 255, 255))
            d.ellipse([cx + ex - 10, 640, cx + ex + 10, 662], fill=(50, 35, 30))
        d.line([cx + ex - 28, 605, cx + ex + 26, 598], fill=(45, 32, 28), width=8)
    d.line([cx, 670, cx - 10, 745], fill=(180, 120, 95), width=5)
    m = float(mouth[f])
    mh = 8 + 52 * min(1, m)
    d.rounded_rectangle([cx - 52, 780 - mh / 2, cx + 52, 780 + mh / 2], radius=int(min(26, mh / 2)), fill=(120, 40, 50))
    if mh > 22:
        d.rectangle([cx - 40, 780 - mh / 2 + 2, cx + 40, 780 - mh / 2 + 10], fill=(245, 245, 245))
    proc.stdin.write(im.tobytes())
proc.stdin.close()
proc.wait()
print('talking.webm', os.path.getsize(f'{ROOT}/talking.webm') // 1024, 'KB', n, 'frames')
