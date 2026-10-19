"""Generate the brand's sound effects (deterministic, no third-party samples).

Run: python3 scripts/make-sfx.py  ->  public/sfx/{whoosh,tap,chime}.wav
"""
import wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.7
    with wave.open(f"public/sfx/{name}.wav", "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def lowpass(x, cutoff):
    """One-pole low-pass with a per-sample cutoff (Hz)."""
    a = np.exp(-2 * np.pi * np.asarray(cutoff) / SR) * np.ones_like(x)
    y = np.zeros_like(x)
    for i in range(1, len(x)):
        y[i] = (1 - a[i]) * x[i] + a[i] * y[i - 1]
    return y


# Whoosh: band-limited noise whose brightness rises then falls, soft envelope.
n = int(0.45 * SR)
t = np.linspace(0, 1, n)
env = np.sin(np.pi * t) ** 2
cut = 400 + 5000 * np.sin(np.pi * t) ** 1.5
noise = rng.standard_normal(n)
w = lowpass(noise, cut) - lowpass(noise, cut * 0.15)
save("whoosh", w * env)

# Tap: short, soft, rounded click (UI touch).
n = int(0.09 * SR)
t = np.arange(n) / SR
tap = np.sin(2 * np.pi * 1100 * t) * np.exp(-t * 70) + 0.4 * np.sin(2 * np.pi * 2300 * t) * np.exp(-t * 120)
save("tap", tap)

# Chime: two gentle bell partials (notification).
n = int(0.9 * SR)
t = np.arange(n) / SR
bell = lambda f, d: np.sin(2 * np.pi * f * t) * np.exp(-t * d)
chime = bell(1318.5, 5) + 0.6 * bell(1975.5, 6) + 0.25 * bell(2637, 9)
chime[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
save("chime", chime)
