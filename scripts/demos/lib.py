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
        report(self)

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
def obj(name): return {'kind': 'library', 'name': f'obj/{name}'}
def bgp(name): return {'kind': 'library', 'name': f'bg/{name}'}

# --- quick mirror of src/engine/qa.ts heroArea / bg checks, so demos can be checked without node ---
def _fill():
    p = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'engine', 'artMeta.ts')
    s = open(p).read()
    return json.loads(s.split('= ', 1)[1].rstrip(';\n'))

def report(v, W=1080, H=1920):
    fill = _fill()
    bad = []
    prev = None
    sigs = set()
    for s in v.scenes:
        bg = s['bg']
        sig = (bg['kind'], bg.get('tone', 'dark'), (bg.get('image') or {}).get('name', ''), bg.get('color', ''))
        sigs.add(sig)
        if sig == prev: bad.append(f"{s['id']} bg-repeat")
        prev = sig
        a = 0.0
        if bg['kind'] == 'photo' and bg.get('image'): a = 1
        for l in s['layers']:
            if l.get('opacity', 1) < 0.5: continue
            if l['type'] == 'image':
                src = l['src']; n = src.get('name', '')
                key = n if src['kind'] == 'library' else '3d/' + n
                framed = l.get('frame', 'none') != 'none' or l.get('fit') == 'cover'
                f = 1 if framed else fill.get(key, 0.6)
                w = l.get('w', 0.8); bw = w * W
                bh = l['h'] * H if l.get('h') else w * W
                x, y = l.get('x', 0.5) * W, l.get('y', 0.5) * H
                iw = max(0, min(W, x + bw / 2) - max(0, x - bw / 2)); ih = max(0, min(H, y + bh / 2) - max(0, y - bh / 2))
                a += iw * ih / (W * H) * f
            elif l['type'] == 'counter':
                a += {'mega': 0.14, 'xxl': 0.08}.get(l.get('size', 'xxl'), 0.04)
            elif l['type'] == 'ui':
                k = l['kind']
                if k in ('price', 'stat', 'checklist', 'chat', 'timer'): a += max(0.16, l.get('w', 0.8) * 0.25)
                elif k in ('profile', 'notification', 'rating', 'progress', 'search'): a += l.get('w', 0.8) * 0.12
        a = min(1, a)
        flag = '' if a >= 0.2 else '  <-- NO HERO'
        if flag: bad.append(f"{s['id']} no-hero")
        print(f"  {s['id']} hero {a*100:4.0f}%  bg {sig[0]}/{sig[1]} {sig[2]}{flag}")
    if len(sigs) < 3: bad.append('bg-variety')
    if v.mode != 'product':
        uses = {}
        for s in v.scenes:
            for l in s['layers']:
                if l['type'] == 'image' and l['src'].get('name') and l['src']['kind'] in ('library', 'sticker'):
                    uses.setdefault(l['src']['name'], set()).add(s['id'])
        bad += [f'hero-reuse {k}' for k, ids in uses.items() if len(ids) > 1]
    print('  ISSUES:', bad or 'none')
    return bad
