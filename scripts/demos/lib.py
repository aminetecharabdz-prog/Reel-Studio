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
def _meta(i):
    p = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'engine', 'artMeta.ts')
    s = open(p).read().split('\n')
    return json.loads(s[i].split('= ', 1)[1].rstrip(';'))
def _fill(): return _meta(1)
def _box(): return _meta(3)

TEXT_PX = {'xs': 44, 's': 64, 'm': 92, 'l': 128, 'xl': 172, 'xxl': 230, 'mega': 310}
COUNTER_PX = {'l': 150, 'xl': 210, 'xxl': 290, 'mega': 400}
def _read_rect(l, W=1080, H=1920):
    if l['type'] == 'text':
        if l.get('opacity', 1) < 0.5 or l.get('exitAt'): return None
        lines = l['lines']
        any_em = any(w.get('em') and w['em'] != 'ghost' for ln in lines for w in ln)
        ls = [0.5 if (l.get('hier', True) and any_em and len(lines) > 1 and not any(w.get('em') and w['em'] != 'ghost' for w in ln)) else 1 for ln in lines]
        size = TEXT_PX[l.get('size', 'l')]
        boxW = min(l.get('w', 0.8), 0.83) * W
        tw = max([min(boxW, sum((len(w['t']) + 1) * size * k * (0.7 if w.get('em') == 'big' else 0.5) for w in ln)) for ln, k in zip(lines, ls)] + [0])
        th = sum(k * size * 1.3 for k in ls)
        cx = l.get('x', 0.5) * W; al = l.get('align', 'center')
        right = cx + tw / 2 if al == 'center' else (cx + boxW / 2 if al == 'start' else cx - boxW / 2 + tw)
        cy = min(max(l.get('y', 0.5) * H, 0.1 * H + th / 2), 0.8 * H - th / 2)
        return (right - tw, cy - th / 2, right, cy + th / 2)
    if l['type'] == 'counter':
        h = COUNTER_PX[l.get('size', 'xxl')]
        tw = (len(str(l['value'])) + len(l.get('prefix', '')) + len(l.get('suffix', ''))) * h * 0.62
        x, y = l.get('x', 0.5) * W, l.get('y', 0.5) * H
        return (x - tw / 2, y - h * 0.6, x + tw / 2, y + h * 0.5)
    if l['type'] == 'ui' and l['kind'] == 'button':
        h = 120; tw = min(l.get('w', 0.8) * W, (len(l.get('title', '')) + 3) * 32 + 90)
        x, y = l.get('x', 0.5) * W, l.get('y', 0.5) * H
        return (x - tw / 2, y - h / 2, x + tw / 2, y + h / 2)
    return None
def _img_rect(l, box, W=1080, H=1920):
    if l['type'] != 'image' or l.get('opacity', 1) < 0.5: return None
    w = l.get('w', 0.8); bw = w * W; bh = l['h'] * H if l.get('h') else w * W
    x0 = l.get('x', 0.5) * W - bw / 2; y0 = l.get('y', 0.5) * H - bh / 2
    src = l['src']; key = src.get('name', '') if src['kind'] == 'library' else '3d/' + src.get('name', '')
    b = box.get(key) if l.get('frame', 'none') == 'none' and l.get('fit', 'contain') == 'contain' else None
    return (x0 + b[0] * bw, y0 + b[1] * bh, x0 + b[2] * bw, y0 + b[3] * bh) if b else (x0, y0, x0 + bw, y0 + bh)
def _ov(a, b): return max(0, min(a[2], b[2]) - max(a[0], b[0])) * max(0, min(a[3], b[3]) - max(a[1], b[1]))
def _ar(a): return max(1, (a[2] - a[0]) * (a[3] - a[1]))

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
        box = _box()
        reads = [(l['id'], _read_rect(l)) for l in s['layers'] if _read_rect(l)]
        pics = [(l['id'], _img_rect(l, box)) for l in s['layers'] if _img_rect(l, box)]
        for tid, tr in reads:
            for iid, ir in pics:
                k = _ov(tr, ir) / _ar(tr)
                if k > 0.08: bad.append(f"{s['id']} collision {tid}/{iid} {k*100:.0f}%")
            for oid, orr in reads:
                if oid <= tid: continue
                k = _ov(tr, orr) / min(_ar(tr), _ar(orr))
                if k > 0.15: bad.append(f"{s['id']} collision {tid}/{oid} {k*100:.0f}%")
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
