"""Align the written script to the voice recordings without a speech model.

Every phrase break in the text (… . ؟ : ، line end) is pinned to a real
silence in the audio with a monotonic dynamic-programming match; words between
pinned breaks are spread over the speech (non-silent) time by their length.

Run: python3 scripts/align.py src/daftari/script.txt public/daftari src/daftari/words.json
Script format: "## voice-N" lines start the text spoken in public/daftari/voice-N.mp3.
"""
import json
import math
import re
import subprocess
import sys

STRONG = "….؟?!"


def silences(path, noise="-35dB", min_d=0.15):
    err = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", path, "-af", f"silencedetect=noise={noise}:d={min_d}", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    dur = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True,
    ).stdout)
    s = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", err)]
    e = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    e += [dur] * (len(s) - len(e))
    return [(max(0.0, a), b) for a, b in zip(s, e)], dur


def strength(word, line_end):
    tail = word.rstrip("»\"' ")
    if tail and tail[-1] in STRONG:
        return 3.0
    if tail.endswith(":"):
        return 2.0
    if line_end:
        return 2.0
    if tail.endswith("،") or tail.endswith(","):
        return 1.5
    return 0.0


def weight(word):
    """Spoken length of a word in letters; digits and % are read out as words."""
    letters = len(re.sub(r"[^\w]|\d", "", word))
    digits = sum(len(d) * 3.5 for d in re.findall(r"\d+", word))
    percent = 7 if "%" in word else 0
    return letters + digits + percent + 1.0


def speech_between(sil, a, b):
    """Speech intervals inside [a, b] (silences removed)."""
    out, t = [], a
    for s0, s1 in sil:
        if s1 <= a or s0 >= b:
            continue
        if s0 > t:
            out.append((t, s0))
        t = max(t, s1)
    if t < b:
        out.append((t, b))
    return out


def spread(words, sil, a, b):
    """Assign start/end to words over speech time in [a, b] by length."""
    iv = speech_between(sil, a, b) or [(a, b)]
    total = sum(y - x for x, y in iv)
    w = [weight(x["text"]) for x in words]
    W = sum(w)

    def real(sp):
        for x, y in iv:
            if sp <= y - x + 1e-9:
                return x + sp
            sp -= y - x
        return iv[-1][1]

    acc = 0.0
    for word, wi in zip(words, w):
        word["start"] = round(real(total * acc / W), 3)
        acc += wi
        word["end"] = round(real(total * acc / W - 1e-6), 3)


def align(words, sil, dur):
    # Speech bounds: drop leading/trailing silence.
    head = sil[0][1] if sil and sil[0][0] <= 0.05 else 0.0
    tail = sil[-1][0] if sil and sil[-1][1] >= dur - 0.05 else dur
    inner = [(a, b) for a, b in sil if a > head + 1e-3 and b < tail - 1e-3]

    breaks = [i for i, w in enumerate(words[:-1]) if w["strength"] > 0]
    pauses = inner
    speech_total = tail - head - sum(b - a for a, b in inner)
    cum = [0.0]
    for w in words:
        cum.append(cum[-1] + weight(w["text"]))
    rate = cum[-1] / speech_total  # chars per speech-second for this voice

    def speech_len(a, b):
        return sum(y - x for x, y in speech_between(inner, a, b))

    # Nodes: virtual start, pinned breaks, virtual end. A segment between two
    # pinned nodes costs its deviation from the voice's average speaking rate,
    # plus penalties for strong breaks left unpinned and long pauses inside.
    nodes = [(-1, None)] + [(b, j) for b in range(len(breaks)) for j in range(len(pauses))] + [(len(breaks), None)]

    def node_time(n, side):
        b, j = n
        if b == -1:
            return head
        if b == len(breaks):
            return tail
        return pauses[j][1] if side == "start" else pauses[j][0]

    def node_char(n):
        b, _ = n
        if b == -1:
            return 0.0
        if b == len(breaks):
            return cum[-1]
        return cum[breaks[b] + 1]

    def seg_cost(n1, n2):
        t0, t1 = node_time(n1, "start"), node_time(n2, "end")
        if t1 <= t0:
            return float("inf")
        chars = node_char(n2) - node_char(n1)
        T = speech_len(t0, t1)
        Te = chars / rate
        if T <= 0.05:
            return float("inf")
        c = 6.0 * math.log(T / Te) ** 2 * (1 + chars / 30)
        for b in range(n1[0] + 1, n2[0]):
            c += 0.6 * words[breaks[b]]["strength"]
        for a, b2 in pauses:
            if a >= t0 and b2 <= t1:
                c += 2.0 * max(0.0, (b2 - a) - 0.2)
        return c

    best = {nodes[0]: (0.0, None)}
    for n2 in nodes[1:]:
        cand = (float("inf"), None)
        for n1, (c1, _) in best.items():
            if n1[0] >= n2[0]:
                continue
            if n1[1] is not None and n2[1] is not None and n2[1] <= n1[1]:
                continue
            v = c1 + seg_cost(n1, n2)
            if v < cand[0]:
                cand = (v, n1)
        if cand[1] is not None:
            best[n2] = cand
    pins, n = {}, nodes[-1]
    while n is not None and n[0] != -1:
        if n[1] is not None:
            pins[breaks[n[0]]] = pauses[n[1]]
        n = best[n][1]

    # Re-spread words between pinned breaks.
    anchors = [(-1, head)] + sorted((bi, None) for bi in pins) + [(len(words) - 1, None)]
    start_t = head
    for (a_idx, _), (b_idx, _) in zip(anchors, anchors[1:]):
        end_t = pins[b_idx][0] if b_idx in pins else tail
        spread(words[a_idx + 1 : b_idx + 1], inner, start_t, end_t)
        if b_idx in pins:
            start_t = pins[b_idx][1]
    return pins, breaks


def main(script, audio_dir, out):
    blocks, cur = {}, None
    for line in open(script, encoding="utf-8"):
        line = line.strip()
        if line.startswith("## "):
            cur = line[3:]
            blocks[cur] = []
        elif line:
            toks = line.split()
            for n, tok in enumerate(toks):
                blocks[cur].append({"text": tok, "strength": strength(tok, n == len(toks) - 1)})
    result, voices, wid = [], [], 0
    for voice, words in blocks.items():
        sil, dur = silences(f"{audio_dir}/{voice}.mp3")
        voices.append({"id": voice, "duration": round(dur, 3)})
        pins, breaks = align(words, sil, dur)
        print(f"{voice}: {len(words)} words, {len(breaks)} breaks, {len(pins)} pinned to pauses, {dur:.2f}s")
        for w in words:
            result.append({
                "id": f"w{wid}", "voice": voice, "text": w["text"],
                "start": w["start"], "end": w["end"], "breakAfter": w["strength"],
            })
            wid += 1
    json.dump({"voices": voices, "words": result}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main(*sys.argv[1:4])
