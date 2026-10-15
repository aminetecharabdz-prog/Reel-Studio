"""Fetch openly licensed photos (Openverse + Wikimedia Commons), cut out objects (rembg), write candidates + sheets.
Runs in GitHub Actions (needs internet). Output: staging/<kind>/<name>/<n>.webp + meta.json, staging/sheet-*.jpg"""
import json, io, os, sys, time, urllib.parse, urllib.request
from PIL import Image, ImageDraw

UA = {'User-Agent': 'MotiqAssetFetcher/1.0 (https://github.com/aminetecharabdz-prog/Reel-Studio)'}
OK = {'cc0', 'pdm', 'by', 'by-sa'}
N = int(os.environ.get('CANDIDATES', '4'))
only = set(sys.argv[1:])

def get(url, raw=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as r:
        b = r.read()
    return b if raw else json.loads(b)

def openverse(q):
    u = 'https://api.openverse.org/v1/images/?' + urllib.parse.urlencode({'q': q, 'license': ','.join(OK), 'page_size': 20, 'mature': 'false'})
    try:
        res = get(u).get('results', [])
    except Exception as e:
        print('openverse fail', q, e); return []
    out = []
    for r in res:
        if (r.get('width') or 0) < 700: continue
        out.append({'url': r['url'], 'author': r.get('creator') or '', 'license': f"{r.get('license')} {r.get('license_version') or ''}".strip(), 'source': r.get('foreign_landing_url') or r['url'], 'title': r.get('title') or ''})
    return out

def commons(q):
    u = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': f'{q} filetype:bitmap', 'gsrnamespace': 6, 'gsrlimit': 15, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size', 'iiurlwidth': 1400})
    try:
        pages = get(u).get('query', {}).get('pages', {})
    except Exception as e:
        print('commons fail', q, e); return []
    out = []
    for p in sorted(pages.values(), key=lambda p: p.get('index', 99)):
        ii = (p.get('imageinfo') or [{}])[0]
        md = ii.get('extmetadata', {})
        lic = (md.get('LicenseShortName', {}).get('value') or '').lower()
        if not any(k in lic for k in ['cc0', 'public domain', 'cc by', 'cc-by']): continue
        if 'nc' in lic or 'nd' in lic: continue
        if (ii.get('width') or 0) < 700: continue
        out.append({'url': ii.get('thumburl') or ii.get('url'), 'author': (md.get('Artist', {}).get('value') or '')[:200], 'license': lic, 'source': ii.get('descriptionurl', ''), 'title': p.get('title', '')})
    return out

def main():
    items = json.load(open(os.path.join(os.path.dirname(__file__), 'items.json')))
    from rembg import remove, new_session
    sess = new_session('isnet-general-use')
    os.makedirs('staging', exist_ok=True)
    for kind in ['objects', 'backgrounds']:
        thumbs = []
        for name, q in items[kind].items():
            if only and name not in only: continue
            cands = (commons(q) + openverse(q))[: N * 3]
            d = f'staging/{kind}/{name}'
            os.makedirs(d, exist_ok=True)
            meta, n = [], 0
            for c in cands:
                if n >= N: break
                try:
                    img = Image.open(io.BytesIO(get(c['url'], raw=True))).convert('RGB')
                except Exception as e:
                    print('dl fail', c['url'], e); continue
                img.thumbnail((1400, 1400))
                if kind == 'objects':
                    cut = remove(img, session=sess)
                    bb = cut.getbbox()
                    if not bb: continue
                    cut = cut.crop(bb)
                    cov = sum(1 for a in cut.getchannel('A').getdata() if a > 128) / (cut.width * cut.height)
                    if cov < 0.15: continue
                    cut.thumbnail((900, 900))
                    cut.save(f'{d}/{n}.webp', quality=88)
                    tile = Image.new('RGB', (220, 220), (60, 60, 70)); t2 = cut.copy(); t2.thumbnail((210, 210)); tile.paste(t2, ((220 - t2.width) // 2, (220 - t2.height) // 2), t2)
                else:
                    w, h = img.size
                    tw = min(w, int(h * 9 / 16)); x0 = (w - tw) // 2
                    crop = img.crop((x0, 0, x0 + tw, h)); crop.thumbnail((1080, 1920))
                    crop.save(f'{d}/{n}.webp', quality=82)
                    tile = Image.new('RGB', (220, 220), (60, 60, 70)); t2 = crop.copy(); t2.thumbnail((210, 210)); tile.paste(t2, ((220 - t2.width) // 2, (220 - t2.height) // 2))
                ImageDraw.Draw(tile).text((4, 4), f'{name}/{n}', fill=(255, 255, 0))
                thumbs.append(tile)
                meta.append({**c, 'file': f'{n}.webp'})
                n += 1
                time.sleep(0.3)
            json.dump(meta, open(f'{d}/meta.json', 'w'), indent=1, ensure_ascii=False)
            print(kind, name, n)
        cols = 8
        for s in range(0, len(thumbs), 64):
            part = thumbs[s:s + 64]
            sheet = Image.new('RGB', (cols * 222, ((len(part) + cols - 1) // cols) * 222), (20, 20, 20))
            for i, t in enumerate(part): sheet.paste(t, ((i % cols) * 222, (i // cols) * 222))
            sheet.save(f'staging/sheet-{kind}-{s // 64}.jpg', quality=80)

main()
