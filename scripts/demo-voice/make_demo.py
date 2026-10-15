#!/usr/bin/env python3
"""
Generate the bundled demo voices + exact word-level transcripts with espeak-ng.

Why: the build sandbox has no human recordings and no neural Arabic TTS. espeak-ng is local,
GPLv3 (its *output* is free to use), and reports the audio position of every word, so the
transcript timings are exact (not estimated). French words are voiced with the French voice via SSML.

Usage: python3 scripts/demo-voice/make_demo.py   (writes public/demo/<id>.mp3 + <id>.transcript.json)
"""
import ctypes, json, os, subprocess, sys, wave, struct, re
from demos import DEMOS

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'demo')
lib = ctypes.CDLL("libespeak-ng.so.1")

class EV(ctypes.Structure):
    _fields_ = [("type", ctypes.c_int), ("unique_identifier", ctypes.c_uint), ("text_position", ctypes.c_int),
                ("length", ctypes.c_int), ("audio_position", ctypes.c_int), ("sample", ctypes.c_int),
                ("user_data", ctypes.c_void_p), ("id", ctypes.c_void_p)]

CB = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.POINTER(EV))
SR = lib.espeak_Initialize(2, 0, None, 0)  # AUDIO_OUTPUT_SYNCHRONOUS
state = {"samples": [], "events": []}

def _cb(wav, n, ev):
    if n > 0:
        state["samples"].extend(wav[:n])
    i = 0
    while ev[i].type != 0:
        e = ev[i]
        if e.type == 1:  # espeakEVENT_WORD
            state["events"].append((e.text_position, e.audio_position))
        i += 1
    return 0

_cbref = CB(_cb)
lib.espeak_SetSynthCallback(_cbref)

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def synth(demo):
    lib.espeak_SetVoiceByName(demo["voice"].encode())
    lib.espeak_SetParameter(1, demo.get("rate", 150), 0)   # espeakRATE
    lib.espeak_SetParameter(3, demo.get("pitch", 50), 0)   # espeakPITCH
    lib.espeak_SetParameter(4, demo.get("range", 60), 0)   # espeakRANGE
    # Build SSML and remember where each display token's spoken text starts/ends (char offsets, 1-based)
    ssml = "<speak>"
    spans = []  # (token_index, start_char, end_char)
    tokens = []
    for si, sentence in enumerate(demo["sentences"]):
        for tok in sentence:
            disp = tok[0]
            say = tok[1] if len(tok) > 1 and tok[1] else disp
            fr = len(tok) > 2 and tok[2] == 'fr'
            if fr:
                ssml += '<voice xml:lang="fr">'
            start = len(ssml) + 1
            ssml += esc(say)
            end = len(ssml)
            if fr:
                ssml += '</voice>'
            ssml += ' '
            spans.append((len(tokens), start, end))
            tokens.append(disp)
        ssml += f'<break time="{demo.get("pause", 320)}ms"/> '
    ssml += "</speak>"
    state["samples"], state["events"] = [], []
    b = ssml.encode()
    lib.espeak_Synth(b, len(b) + 1, 0, 0, 0, 0x01 | 0x10, None, None)  # UTF8 | SSML
    lib.espeak_Synchronize()
    return tokens, spans, list(state["samples"]), list(state["events"])

def energy_end(samples, start_ms, limit_ms, sr):
    """Trim a word's end to where the voice energy actually stops (≤ next word start)."""
    a = int(start_ms * sr / 1000); b = int(limit_ms * sr / 1000)
    win = int(0.01 * sr)
    last_loud = a
    for i in range(a, max(a + 1, b), win):
        chunk = samples[i:i + win]
        if not chunk:
            break
        rms = (sum(x * x for x in chunk) / len(chunk)) ** 0.5
        if rms > 600:
            last_loud = i + win
    return min(limit_ms, max(start_ms + 60, last_loud * 1000 / sr + 20))

def main():
    os.makedirs(OUT, exist_ok=True)
    only = sys.argv[1:]
    for demo in [d for d in DEMOS if not only or d['id'] in only]:
        tokens, spans, samples, events = synth(demo)
        lead_ms = 250
        starts = [None] * len(tokens)
        for pos, ms in events:
            for ti, s, e in spans:
                if s <= pos <= e:
                    if starts[ti] is None:
                        starts[ti] = ms + lead_ms
                    break
        # tokens that produced no event (rare): interpolate
        for i in range(len(starts)):
            if starts[i] is None:
                prev = next((starts[j] for j in range(i - 1, -1, -1) if starts[j] is not None), lead_ms)
                starts[i] = prev + 120
        total_ms = len(samples) * 1000 / SR + lead_ms + 500
        padded = [0] * int(lead_ms * SR / 1000) + samples + [0] * int(0.5 * SR)
        words = []
        for i, t in enumerate(tokens):
            nxt = starts[i + 1] if i + 1 < len(tokens) else total_ms - 400
            end = energy_end(padded, starts[i], nxt, SR)
            words.append({"id": f"w{i}", "text": t, "startMs": round(starts[i]), "endMs": round(end), "confidence": 1})
        wav_path = os.path.join(OUT, f'{demo["id"]}.wav')
        with wave.open(wav_path, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes(struct.pack('<%dh' % len(padded), *padded))
        mp3 = os.path.join(OUT, f'{demo["id"]}.mp3')
        # warm up the robotic timbre a bit and normalise loudness (≈ -16 LUFS, peaks ≤ -1.5 dBTP)
        af = "highpass=f=90,lowpass=f=8500,equalizer=f=220:t=q:w=1:g=3,equalizer=f=3200:t=q:w=1.5:g=2,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,aecho=0.8:0.5:28:0.12,loudnorm=I=-16:TP=-1.5:LRA=7"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path, "-af", af, "-ar", "44100", "-ac", "1", "-b:a", "96k", mp3], check=True)
        os.remove(wav_path)
        transcript = {"language": "mixed", "source": "demo", "durationMs": round(total_ms), "words": words}
        with open(os.path.join(OUT, f'{demo["id"]}.transcript.json'), 'w', encoding='utf-8') as f:
            json.dump(transcript, f, ensure_ascii=False, indent=0)
        print(demo["id"], f"{total_ms/1000:.1f}s", len(words), "words")

if __name__ == '__main__':
    main()
