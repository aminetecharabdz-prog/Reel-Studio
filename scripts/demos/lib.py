"""Tiny DSL to author demo videos as the AI director would: script → timed words → scene graph JSON."""
import json, os

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'demo')

class Video:
    def __init__(self, vid, style, bpm=118, wps=2.5, start_ms=350, music='auto', mode='content', title='', blurb=''):
        self.vid, self.style, self.bpm, self.wps, self.t = vid, style, bpm, wps, start_ms
        self.words, self.scenes, self.music, self.mode, self.title, self.blurb = [], [], music, mode, title, blurb
        self.beat = 60000 / bpm

    def say(self, text, pause=380, snap=True):
        """append a phrase; word durations follow length; phrase starts snap to the musical beat"""
        if snap:
            b = self.beat / 2
            self.t = round(self.t / b) * b
        ids = []
        for tok in text.split():
            d = 1000 / self.wps * (0.55 + 0.11 * len(tok.strip('.,!?؟،')))
            w = {'id': f'w{len(self.words)}', 'text': tok, 'startMs': round(self.t), 'endMs': round(self.t + d * 0.9), 'confidence': 1}
            self.words.append(w)
            ids.append(w['id'])
            self.t += d
        self.t += pause
        return ids

    def find(self, ids, text):
        for i in ids:
            w = next(x for x in self.words if x['id'] == i)
            if w['text'].strip('.,!?؟،…') == text or w['text'] == text:
                return i
        raise KeyError(text)

    def scene(self, ids, bg, layers, camera=('push', 0.35), transition='cut', intent='', speaker=None):
        s = {'id': f's{len(self.scenes)}', 'from': ids[0], 'to': ids[-1], 'intent': intent, 'bg': bg,
             'camera': {'move': camera[0], 'amount': camera[1]}, 'transition': transition, 'layers': layers}
        if speaker: s['speaker'] = speaker
        self.scenes.append(s)

    def save(self):
        os.makedirs(OUT, exist_ok=True)
        dur = round(self.t + 600)
        data = {'id': self.vid, 'title': self.title, 'blurb': self.blurb, 'mode': self.mode, 'music': self.music,
                'transcript': {'words': self.words, 'durationMs': dur, 'language': 'ar', 'source': 'demo'},
                'plan': {'v': 1, 'style': self.style, 'scenes': self.scenes, 'hooks': [], 'author': 'fixture'}}
        with open(os.path.join(OUT, f'{self.vid}.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
        print(self.vid, f'{dur/1000:.1f}s', len(self.scenes), 'scenes')

def words(v, ids, em=None, at=True):
    """text line from word ids; em: dict text->emphasis"""
    em = em or {}
    out = []
    for i in ids:
        w = next(x for x in v.words if x['id'] == i)
        t = w['text']
        clean = t.strip('.,!?؟،…')
        d = {'t': t}
        if at: d['at'] = i
        if clean in em: d['em'] = em[clean]
        out.append(d)
    return out

def T(id, lines, **kw):
    d = {'id': id, 'type': 'text', 'lines': lines}
    d.update(kw); return d
def I(id, src, **kw):
    d = {'id': id, 'type': 'image', 'src': src}
    d.update(kw); return d
def S(id, kind, **kw):
    d = {'id': id, 'type': 'shape', 'kind': kind}
    d.update(kw); return d
def C(id, value, **kw):
    d = {'id': id, 'type': 'counter', 'value': value}
    d.update(kw); return d
def U(id, kind, **kw):
    d = {'id': id, 'type': 'ui', 'kind': kind}
    d.update(kw); return d
def sticker(name): return {'kind': 'sticker', 'name': name}
def url(u): return {'kind': 'url', 'url': u}
