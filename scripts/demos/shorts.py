from lib import *

style = {
    'name': 'Ultraviolet editorial',
    'palette': {'ink': '#16101F', 'paper': '#F6F4F8', 'accent': '#7A1FD1', 'accent2': '#FFFFFF', 'muted': '#A69BB5', 'dark': '#0B0711'},
    'fonts': {'display': {'ar': 'alexandria', 'lat': 'playfair', 'weight': 800, 'italic': False},
              'serif': {'ar': 'amiri', 'lat': 'playfair', 'weight': 700, 'italic': True},
              'body': {'ar': 'readex', 'lat': 'inter', 'weight': 500, 'italic': False},
              'impact': {'ar': 'alexandria', 'lat': 'playfair', 'weight': 900, 'italic': False}},
    'grain': 0.16, 'motion': 'snappy', 'music': 'tech-pulse', 'sfx': 'punchy', 'captions': 'none',
}
v = Video('shorts', style, bpm=122, wps=2.8, music='tech-pulse', title='3 أخطاء تقتل الشورتس تاعك', blurb='يوتيوب شورتس')
FIELD = {'kind': 'solid', 'tone': 'accent', 'grid': True, 'vignette': True}
PAPER = {'kind': 'paper', 'tone': 'light', 'grid': True, 'vignette': True}
DARK = {'kind': 'spotlight', 'tone': 'dark', 'vignette': True}

a = v.say('3 أخطاء تقتل الشورتس تاعك')
v.scene(a, FIELD,
  [S('sh1', 'shard', x=0.9, y=0.08, w=0.5, h=0.22, rotate=90, color='white', fill=True, anim='pop', at=a[0]),
   C('n3', 3, x=0.3, y=0.3, w=0.5, size='mega', color='white', at=a[0], role='serif'),
   I('eye', obj('eye'), x=0.78, y=0.86, w=0.9, anim='slide-left', idle='sway', at=v.find(a, 'تقتل'), depth=0.8),
   T('t1', [words(v, a[1:2], {'أخطاء': 'serif'}), words(v, a[2:3]), words(v, a[3:])], x=0.4, y=0.6, w=0.66, size='xxl', align='start', anim='mask', color='white')],
  camera=('punch', 0.5), intent='hook on a purple field: giant 3, eyeball cropped by the edge')

b = v.say('الخطأ الأول: بداية بطيئة', pause=420)
v.scene(b, PAPER,
  [T('ghost', [[{'t': 'بطيئة'}]], x=0.45, y=0.68, w=1.5, size='mega', role='serif', opacity=0.1, anim='blur', hier=False, at=b[2]),
   I('hg', obj('hourglass'), x=0.5, y=0.62, w=0.56, anim='drop', idle='sway', at=b[2]),
   T('t2', [words(v, b[:2]), words(v, b[2:], {'بطيئة': 'serif'})], x=0.6, y=0.25, w=0.74, size='xxl', align='start', anim='rise')],
  transition='whip', camera=('push', 0.4), intent='mistake 1: slow start; hourglass, ghost word behind')

c = v.say('عندك ثانيتين باش توقف السكرول', pause=420)
v.scene(c, DARK,
  [C('two', 2, x=0.5, y=0.36, w=0.6, size='mega', color='accent', at=v.find(c, 'ثانيتين'), suffix='s'),
   T('t3', [words(v, c[:2], {'ثانيتين': 'accent'}), words(v, c[2:4]), words(v, c[4:], {'السكرول': 'serif'})], x=0.5, y=0.66, w=0.86, size='xl', anim='rise', hier=False)],
  transition='cut', camera=('punch', 0.5), intent='two seconds: giant glowing 2 on black')

d = v.say('الخطأ الثاني: كلام بلا صورة', pause=420)
v.scene(d, FIELD,
  [I('tv', obj('retro-computer'), x=0.5, y=0.62, w=0.72, anim='pop', idle='float', at=v.find(d, 'صورة'), shadow=True),
   T('t4', [words(v, d[:2]), words(v, d[2:], {'صورة': 'serif'})], x=0.5, y=0.24, w=0.86, size='xxl', anim='mask', color='white')],
  transition='zoom', camera=('push', 0.4), intent='mistake 2: talking without visuals; vintage TV')

e = v.say('العين تشري قبل الودن', pause=420)
v.scene(e, PAPER,
  [I('eye2', obj('eye'), x=0.3, y=0.36, w=1.2, anim='slide-right', idle='float', at=e[0], depth=0.9),
   T('t5', [words(v, e[:2], {'العين': 'accent'}), words(v, e[2:])], x=0.64, y=0.62, w=0.66, size='xxl', align='end', anim='rise')],
  transition='cut', camera=('drift', 0.5), intent='the eye buys before the ear: eyeball bleeding from the left')

f = v.say('الخطأ الثالث: ما كاش خطة', pause=420)
v.scene(f, DARK,
  [T('ghost', [[{'t': 'خطة'}]], x=0.5, y=0.55, w=1.4, size='mega', role='serif', opacity=0.1, anim='blur', hier=False, at=f[0]),
   I('king', obj('chess-pieces'), x=0.68, y=0.64, w=0.62, anim='float', idle='sway', at=v.find(f, 'خطة'), glow='accent'),
   T('t6', [words(v, f[:2]), words(v, f[2:], {'خطة': 'serif'})], x=0.4, y=0.26, w=0.7, size='xxl', align='start', anim='rise')],
  transition='glitch', camera=('push', 0.5), intent='mistake 3: no strategy; chess king rises')

g = v.say('كل فيديو لازم يخدم هدف واحد', pause=420)
v.scene(g, PAPER,
  [I('dart', obj('trophy'), x=0.76, y=0.66, w=0.6, anim='drop', idle='float', at=v.find(g, 'هدف')),
   T('t7', [words(v, g[:3]), words(v, g[3:5]), words(v, g[5:], {'هدف': 'highlight'})], x=0.44, y=0.3, w=0.76, size='xl', align='start', anim='mask', hier=False)],
  transition='slide-up', camera=('push', 0.4), intent='one goal: dartboard cropped bottom-right')

h = v.say('تابع باش ما تفوتكش الحيلة الجاية', pause=900)
v.scene(h, FIELD,
  [S('sh3', 'shard', x=0.1, y=0.9, w=0.5, h=0.22, rotate=-90, color='white', fill=True, anim='pop', at=h[0]),
   T('t8', [words(v, h[:1], {'تابع': 'big'}), words(v, h[1:4]), words(v, h[4:])], x=0.5, y=0.42, w=0.86, size='xxl', anim='pop', color='white'),
   U('cta', 'button', title='اشترك', x=0.5, y=0.72, w=0.5, color='paper', at=h[-1])],
  transition='flash', camera=('push', 0.5), intent='CTA on the purple field')

for s in v.scenes:
    for l in s['layers']:
        if 'from_' in l: l['from'] = l.pop('from_')
v.save()
