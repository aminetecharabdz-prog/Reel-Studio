"""Rassam — study a style reference video (our own tool; same outputs as the kit's analysis, written from scratch).

    python3 scripts/ref/analyze_ref.py .ref/msk/styles/product/reference.mp4 --out .ref/analysis/product

Outputs: sheets/sheet_NN.jpg (time-stamped contact sheets: every cut + an even sample),
motion/strip_NN.jpg (8 frames 0.1 s apart at the busiest moments), palette.json/png, report.md.
Needs ffmpeg, numpy, pillow.
"""
import argparse, json, re, subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


def sh(args):
    return subprocess.run(args, capture_output=True)


def probe(p):
    err = sh(["ffmpeg", "-hide_banner", "-i", str(p)]).stderr.decode("utf-8", "replace")
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err)
    dur = int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])
    v = re.search(r"Video:.*?(\d{3,5})x(\d{3,5})", err)
    f = re.search(r"([\d.]+) fps", err)
    return dur, int(v[1]), int(v[2]), float(f[1]) if f else 30.0, "Audio:" in err


def motion(p, w, h, rate=10):
    tw, th = 96, max(2, int(96 * h / w))
    raw = sh(["ffmpeg", "-v", "error", "-i", str(p), "-vf", f"fps={rate},scale={tw}:{th},format=gray", "-f", "rawvideo", "-"]).stdout
    fr = np.frombuffer(raw, np.uint8)
    n = len(fr) // (tw * th)
    fr = fr[: n * tw * th].reshape(n, th, tw).astype(np.float32)
    return np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2)) / 255.0, fr.mean(axis=(1, 2)) / 255.0


def cuts(p, thr=0.3):
    err = sh(["ffmpeg", "-hide_banner", "-i", str(p), "-vf", f"scale=320:-2,select='gt(scene,{thr})',showinfo", "-f", "null", "-"]).stderr.decode()
    return [round(float(t), 2) for t in re.findall(r"pts_time:([\d.]+)", err)]


def grab(p, t, out, width):
    sh(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(p), "-frames:v", "1", "-vf", f"scale={width}:-2", "-q:v", "3", str(out)])
    return out.exists()


def stamp(im, text):
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 8 * len(text) + 10, 20], fill=(0, 0, 0))
    d.text((5, 4), text, fill=(255, 255, 255))
    return im


def sheet(items, out, cols=4, cell=420):
    ims = [Image.open(p).convert("RGB") for _, p in items]
    ch = int(cell * ims[0].height / ims[0].width)
    rows = (len(ims) + cols - 1) // cols
    s = Image.new("RGB", (cols * cell + (cols + 1) * 6, rows * ch + (rows + 1) * 6), (128, 128, 128))
    for i, ((t, _), im) in enumerate(zip(items, ims)):
        s.paste(stamp(im.resize((cell, ch)), f"{t:.1f}s"), (6 + (i % cols) * (cell + 6), 6 + (i // cols) * (ch + 6)))
    s.save(out, quality=88)


def palette(paths, k=8):
    X = np.concatenate([np.asarray(Image.open(p).convert("RGB").resize((64, 36)), np.float32).reshape(-1, 3) for p in paths])
    lum = X @ np.array([0.299, 0.587, 0.114], np.float32)
    C = np.stack([X[np.argsort(lum)[int(q * (len(X) - 1))]] for q in np.linspace(0.02, 0.98, k)])
    for _ in range(20):
        lab = np.argmin(((X[:, None, :] - C[None]) ** 2).sum(-1), axis=1)
        C = np.stack([X[lab == i].mean(0) if np.any(lab == i) else C[i] for i in range(k)])
    share = np.bincount(lab, minlength=k) / len(X)
    return [{"hex": "#%02X%02X%02X" % tuple(int(v) for v in C[i]), "share": round(float(share[i]), 4)} for i in np.argsort(-share)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--out", required=True)
    ap.add_argument("--every", type=float, default=1.0)
    a = ap.parse_args()
    v, out = Path(a.video), Path(a.out)
    (out / "frames").mkdir(parents=True, exist_ok=True)
    (out / "sheets").mkdir(exist_ok=True)
    (out / "motion").mkdir(exist_ok=True)
    dur, w, h, fps, audio = probe(v)
    diff, luma = motion(v, w, h)
    cs = cuts(v)
    times = sorted(set([round(t, 1) for t in np.arange(0.2, dur - 0.1, a.every)] + [round(c + 0.15, 1) for c in cs if c + 0.15 < dur]))
    frames = []
    for t in times:
        f = out / "frames" / f"t{t:06.1f}.jpg"
        if grab(v, t, f, 640):
            frames.append((t, f))
    for i in range(0, len(frames), 16):
        sheet(frames[i:i + 16], out / "sheets" / f"sheet_{i // 16 + 1:02d}.jpg")
    # busiest moments, at least 1.5 s apart
    order = np.argsort(-diff)
    picks = []
    for idx in order:
        t = idx / 10
        if all(abs(t - p) > 1.5 for p in picks):
            picks.append(t)
        if len(picks) >= 12:
            break
    for j, t0 in enumerate(sorted(picks)):
        items = []
        for k in range(8):
            t = max(0, t0 - 0.3) + k * 0.1
            f = out / "frames" / f"m{j:02d}_{k}.jpg"
            if grab(v, t, f, 420):
                items.append((t, f))
        if items:
            sheet(items, out / "motion" / f"strip_{j + 1:02d}.jpg", cols=4, cell=420)
    pal = palette([p for _, p in frames])
    (out / "palette.json").write_text(json.dumps(pal, indent=1))
    pim = Image.new("RGB", (800, 80))
    d = ImageDraw.Draw(pim)
    x = 0
    for c in pal:
        ww = max(1, int(800 * c["share"]))
        d.rectangle([x, 0, x + ww, 80], fill=c["hex"])
        x += ww
    pim.save(out / "palette.png")
    shots = np.diff([0] + cs + [dur])
    rep = [f"# {v.parent.name}", f"- size {w}x{h} @ {fps} fps, duration {dur:.1f}s, audio: {audio}",
           f"- cuts: {len(cs)} ({len(cs) / dur * 60:.1f}/min), mean shot {shots.mean():.2f}s, median {np.median(shots):.2f}s",
           f"- cut times: {cs}", f"- motion mean {diff.mean():.4f}, still share (<0.004) {(diff < 0.004).mean():.0%}",
           f"- luma mean {luma.mean():.2f} (min {luma.min():.2f} max {luma.max():.2f})",
           f"- busiest moments: {[round(p, 1) for p in sorted(picks)]}", "- palette: " + ", ".join(f"{c['hex']} {c['share']:.0%}" for c in pal)]
    (out / "report.md").write_text("\n".join(rep) + "\n")
    print("\n".join(rep))


if __name__ == "__main__":
    main()
