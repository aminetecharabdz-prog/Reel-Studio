#!/usr/bin/env python3
"""Synthesise royalty-free music loops and SFX (original, generated from scratch with numpy).
Writes public/audio/music/*.mp3 and public/audio/sfx/*.mp3. The owner can add real tracks later."""
import numpy as np, subprocess, os, json
from scipy.signal import butter, sosfilt

SR = 44100
ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'audio')
rng = np.random.default_rng(7)

def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
def env(n, a, d, s, r, sl=None):
    a, d, r = int(a*SR), int(d*SR), int(r*SR)
    sl = sl if sl is not None else n
    e = np.zeros(n)
    a = min(a, n); e[:a] = np.linspace(0, 1, a, endpoint=False)
    dd = min(d, max(0, n-a)); e[a:a+dd] = np.linspace(1, s, dd, endpoint=False)
    e[a+dd:sl] = s
    rr = min(r, max(0, n-sl)); 
    if rr: e[sl:sl+rr] = np.linspace(s, 0, rr)
    return e
def note(m): return 440.0 * 2 ** ((m - 69) / 12)
def saw(f, t): return 2 * ((f * t) % 1) - 1
def write(path, x, br='128k'):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    wav = path.replace('.mp3', '.raw')
    (x.astype(np.float32)).tofile(wav)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', wav, '-b:a', br, path], check=True)
    os.remove(wav)

def pad_chord(notes, dur, bright=1800):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in notes:
        for det in (-0.08, 0.0, 0.07):
            x += saw(note(m + det), t + rng.random())
    x = lp(x, bright, 2) * env(n, 0.6, 0.4, 0.8, 0.8, n - int(0.8*SR))
    return x / len(notes) / 3

def pluck(m, dur, bright=3500):
    n = int(dur * SR); t = np.arange(n) / SR
    x = (saw(note(m), t) * 0.6 + np.sin(2*np.pi*note(m)*t)) * np.exp(-t * 7)
    return lp(x, bright)

def kick(dur=0.5):
    n = int(dur*SR); t = np.arange(n)/SR
    f = 50 + 120*np.exp(-t*30)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*8)
def hat(dur=0.08):
    n = int(dur*SR); return hp(rng.standard_normal(n), 7000) * np.exp(-np.arange(n)/SR*60) * 0.3
def snare(dur=0.25):
    n = int(dur*SR); t=np.arange(n)/SR
    return (bp(rng.standard_normal(n), 1200, 6000)*0.7 + np.sin(2*np.pi*190*t)*0.5) * np.exp(-t*18)

def place(buf, x, at):
    i = int(at * SR); j = min(len(buf), i + len(x)); buf[i:j] += x[:j-i]

def track(name, bpm, prog, bars=16, drums=True, arp=True, bright=1800, mood='', energy=0.5):
    beat = 60 / bpm; bar = beat * 4; total = bar * bars
    n = int(total * SR); mix = np.zeros(n + SR*2)
    for b in range(bars):
        ch = prog[b % len(prog)]
        place(mix, pad_chord([m + 12 for m in ch], bar + 0.8, bright) * 0.5, b * bar)
        place(mix, pluck(ch[0] - 12, bar, 600) * 0.45, b * bar)  # bass
        if arp:
            pattern = [0, 1, 2, 1, 2, 0, 1, 2]
            for k in range(8):
                place(mix, pluck(ch[pattern[k]] + 24, beat * 0.9) * 0.22, b * bar + k * beat / 2)
        if drums:
            for k in range(4):
                if k % 2 == 0 or energy > 0.6: place(mix, kick() * 0.7, b * bar + k * beat)
                if k % 2 == 1: place(mix, snare() * 0.35, b * bar + k * beat)
                place(mix, hat() , b * bar + k * beat + beat / 2)
    # seamless loop: fold the tail back onto the head
    tail = mix[n:]; mix = mix[:n]; mix[:len(tail)] += tail
    return mix

def main():
    os.makedirs(f'{ROOT}/music', exist_ok=True); os.makedirs(f'{ROOT}/sfx', exist_ok=True)
    C = [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]]          # C Am F G — warm
    D = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]]          # Am F G Em — dark/tech
    E = [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]]          # D Bm G A — upbeat
    F = [[60, 64, 67, 71], [65, 69, 72, 76], [62, 65, 69, 72], [67, 71, 74, 77]]  # calm maj7
    tracks = [
        dict(id='warm-pluck', title='دافئ', bpm=100, prog=C, drums=True, arp=True, bright=2200, moods=['soft-ui', 'playful'], energy=0.4),
        dict(id='tech-pulse', title='تقني', bpm=122, prog=D, drums=True, arp=True, bright=1400, moods=['mechanical', 'cinematic'], energy=0.8),
        dict(id='upbeat-pop', title='حماسي', bpm=118, prog=E, drums=True, arp=True, bright=2600, moods=['punchy', 'playful'], energy=0.9),
        dict(id='calm-pad', title='هادئ', bpm=80, prog=F, drums=False, arp=True, bright=1500, moods=['soft-ui', 'cinematic'], energy=0.2),
    ]
    meta = []
    for tr in tracks:
        x = track(tr['id'], tr['bpm'], tr['prog'], drums=tr['drums'], arp=tr['arp'], bright=tr['bright'], energy=tr['energy'])
        write(f"{ROOT}/music/{tr['id']}.mp3", x, '112k')
        meta.append({k: tr[k] for k in ('id', 'title', 'bpm', 'moods', 'energy')})
    with open(f'{ROOT}/music/index.json', 'w', encoding='utf-8') as f: json.dump(meta, f, ensure_ascii=False)

    # ---- SFX (two flavours where it matters: soft vs hard)
    def noise(d): return rng.standard_normal(int(d*SR))
    def sweep_bp(x, f0, f1):
        out = np.zeros_like(x); seg = 512
        for i in range(0, len(x), seg):
            f = f0 + (f1 - f0) * i / len(x)
            out[i:i+seg] = bp(x[i:i+seg+256], max(60, f*0.7), min(SR/2-100, f*1.4))[:len(x[i:i+seg])]
        return out
    t = lambda d: np.arange(int(d*SR))/SR
    sfx = {}
    w = noise(0.55); sfx['whoosh-soft'] = lp(w, 2500) * np.sin(np.pi * np.linspace(0, 1, len(w))) ** 2
    w = noise(0.45); sfx['whoosh-hard'] = sweep_bp(w, 300, 5000) * np.sin(np.pi * np.linspace(0, 1, len(w))) ** 1.5
    tt = t(0.12); sfx['pop-soft'] = np.sin(2*np.pi*(500 + 900*np.exp(-tt*40))*tt) * np.exp(-tt*35)
    tt = t(0.1); sfx['pop-punchy'] = (np.sin(2*np.pi*(300 + 1500*np.exp(-tt*60))*tt) + 0.3*hp(noise(0.1), 3000)) * np.exp(-tt*45)
    tt = t(0.04); sfx['tick'] = hp(noise(0.04), 3000) * np.exp(-tt*120) + np.sin(2*np.pi*2400*tt)*np.exp(-tt*150)*0.5
    tt = t(1.2); sfx['impact'] = np.sin(2*np.pi*np.cumsum(40 + 90*np.exp(-tt*12))/SR) * np.exp(-tt*3.5) + lp(noise(1.2), 900) * np.exp(-tt*9) * 0.6
    tt = t(1.2); sfx['riser'] = sweep_bp(noise(1.2), 200, 6000) * (tt/1.2)**2
    tt = t(1.0); sfx['ding'] = (np.sin(2*np.pi*1320*tt) + 0.5*np.sin(2*np.pi*1980*tt) + 0.25*np.sin(2*np.pi*2640*tt)) * np.exp(-tt*4.5)
    tt = t(0.05); sfx['click'] = np.sin(2*np.pi*1800*tt) * np.exp(-tt*140)
    w = noise(0.3); sfx['swipe'] = sweep_bp(w, 4000, 800) * np.sin(np.pi*np.linspace(0, 1, len(w)))
    tt = t(0.35); sfx['mech-clunk'] = (lp(noise(0.35), 500) + np.sin(2*np.pi*90*tt)) * np.exp(-tt*16)
    for k, v in sfx.items():
        tail = np.zeros(int(0.05*SR)); write(f'{ROOT}/sfx/{k}.mp3', np.concatenate([np.zeros(int(0.005*SR)), v, tail]), '96k')
    print('music:', [m['id'] for m in meta]); print('sfx:', list(sfx))

if __name__ == '__main__':
    main()
