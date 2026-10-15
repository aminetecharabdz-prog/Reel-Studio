from lib import *

style = {
    'name': 'Ink & red',
    'palette': {'ink': '#151515', 'paper': '#F5F2EC', 'accent': '#E8141C', 'accent2': '#FFB400', 'muted': '#9A968F', 'dark': '#050506'},
    'fonts': {'display': {'ar': 'alexandria', 'lat': 'inter', 'weight': 800, 'italic': False},
              'serif': {'ar': 'amiri', 'lat': 'playfair', 'weight': 700, 'italic': True},
              'body': {'ar': 'readex', 'lat': 'inter', 'weight': 500, 'italic': False},
              'impact': {'ar': 'alexandria', 'lat': 'inter', 'weight': 900, 'italic': False}},
    'grain': 0.18, 'motion': 'snappy', 'music': 'upbeat-pop', 'sfx': 'punchy', 'captions': 'none',
}
v = Video('content', style, bpm=118, wps=2.6, music='upbeat-pop', title='محتوى بلا جمهور = ضجيج', blurb='تسويق بالمحتوى، بالدارجة')
LIGHT = {'kind': 'paper', 'tone': 'light', 'vignette': True}
DARK = {'kind': 'spotlight', 'tone': 'dark', 'vignette': True}

a = v.say('عندك فكرة قوية')
v.scene(a, LIGHT,
  [T('ghost', [[{'t': 'فكرة'}]], x=0.5, y=0.66, w=1.5, size='mega', role='serif', opacity=0.08, rotate=-10, anim='blur', hier=False, at=a[0]),
   I('pen', obj('fountain-pen'), x=0.3, y=0.66, w=1.1, rotate=-28, anim='slide-right', idle='sway', at=a[1], depth=0.8),
   T('t1', [words(v, a[:2]), words(v, a[2:], {'قوية': 'accent'})], x=0.66, y=0.36, w=0.56, size='xxl', anim='rise', align='end')],
  camera=('push', 0.4), intent='bulb bleeds in from the edge; small lead-in, huge red key word')

b = v.say('ومنتوج مليح بزاف')
v.scene(b, LIGHT,
  [S('arc', 'arc', x=0.62, y=0.5, w=1.1, h=1.1, color='muted', stroke=14, anim='draw', at=b[0]),
   I('box', obj('gift-box'), x=0.5, y=0.62, w=0.72, anim='drop', idle='float', at=b[1]),
   T('t2', [words(v, b[:1]), words(v, b[1:], {'مليح': 'serif'})], x=0.5, y=0.27, w=0.86, size='xxl', anim='mask')],
  transition='whip', camera=('drift', 0.5), intent='grey band sweeps, product drops; serif contrast on مليح')

c = v.say('بصح… الناس ما يشوفوكش', pause=500)
v.scene(c, DARK,
  [T('t3a', [words(v, c[:1], {'بصح': 'ghost'})], x=0.5, y=0.3, w=0.8, size='mega', anim='blur', exitAt=c[1]),
   I('eye', obj('eye'), x=0.5, y=0.6, w=1.0, anim='zoom', idle='float', at=c[1], depth=0.7),
   T('t3', [words(v, c[1:3]), words(v, c[3:], {'يشوفوكش': 'accent'})], x=0.5, y=0.3, w=0.86, size='xxl', anim='rise', at=c[1])],
  transition='flash', camera=('push', 0.6), intent='hard cut to black: nobody sees you, red glow')

d = v.say('المحتوى بلا جمهور')
v.scene(d, {'kind': 'noise-dark', 'tone': 'dark', 'vignette': True},
  [T('t4', [words(v, d[:2]), words(v, d[2:], {'جمهور': 'big'})], x=0.5, y=0.46, w=0.86, size='xxl', anim='blur')],
  transition='cut', camera=('push', 0.5), intent='pure black, type only: small lead-in, huge glowing red جمهور')

e = v.say('غير ضجيج', pause=520)
v.scene(e, LIGHT,
  [I('mega', obj('megaphone-man'), x=0.62, y=0.64, w=0.95, anim='slide-left', idle='none', at=e[0], depth=0.6),
   T('t5', [words(v, e[:1]), words(v, e[1:], {'ضجيج': 'accent'})], x=0.5, y=0.27, w=0.86, size='xxl', anim='stamp', at=e[0]),
   S('burst', 'burst', x=0.3, y=0.52, w=0.5, color='accent', stroke=10, anim='pop', at=e[1])],
  transition='glitch', camera=('shake', 0.5), intent='just noise: loudspeakers cropped at the corners')

f = v.say('الجمهور هو الرأس مال الحقيقي', pause=450)
v.scene(f, DARK,
  [I('bag', obj('property-coins'), x=0.5, y=0.64, w=0.86, anim='drop', idle='float', at=v.find(f, 'الرأس'), glow='accent2'),
   T('t6', [words(v, f[:2]), words(v, f[2:4], {'مال': 'accent'}), words(v, f[4:])], x=0.5, y=0.28, w=0.88, size='xxl', anim='rise', hier=True)],
  transition='zoom', camera=('rise', 0.5), intent='audience = real capital: money bag drops on الرأس مال')

g = v.say('إنستغرام ما يكافيش التعب')
v.scene(g, {'kind': 'solid', 'tone': 'accent', 'vignette': True},
  [I('lap', obj('stressed-laptop'), x=0.5, y=0.7, w=0.8, anim='float', idle='none', at=g[1], shadow=True),
   T('t7', [words(v, g[:1], {'إنستغرام': 'serif'}), words(v, g[1:3]), words(v, g[3:], {'التعب': 'strike'})], x=0.5, y=0.3, w=0.88, size='xl', anim='mask', hier=False, color='white')],
  transition='slide-up', camera=('push', 0.4), intent='type only on paper: effort struck out')

h = v.say('يكافي الاستراتيجية', pause=520)
v.scene(h, LIGHT,
  [T('t8', [words(v, h[:1]), words(v, h[1:], {'الاستراتيجية': 'accent'})], x=0.5, y=0.3, w=0.9, size='xxl', anim='pop', at=h[0]),
   I('target', obj('chess-king'), x=0.74, y=0.66, w=0.62, anim='slide-left', idle='float', at=h[1], depth=0.8)],
  transition='cut', camera=('push', 0.4), intent='strategy in red, bullseye bleeding off the right edge')

i = v.say('كل فيديو لازم يوقف السكرول في 3 ثواني', pause=500)
v.scene(i, {'kind': 'blur-photo', 'tone': 'dark', 'image': bgp('phone-feed'), 'vignette': True},
  [U('notif', 'profile', title='motiq.studio', sub='+1 250 متابع جديد هذا الأسبوع', x=0.5, y=0.24, w=0.84, at=i[0], anim='drop'),
   C('three', 3, from_=0, suffix='', x=0.5, y=0.5, w=0.8, size='mega', color='accent', at=v.find(i, '3')),
   T('t9', [words(v, i[:4]), words(v, i[4:6], {'السكرول': 'accent'}), words(v, i[6:])], x=0.5, y=0.72, w=0.9, size='l', anim='rise', hier=False)],
  transition='whip', camera=('punch', 0.5), intent='hook rule: profile card, a giant red 3')

j = v.say('ابدا اليوم مع موتيك', pause=800)
v.scene(j, {'kind': 'spotlight', 'tone': 'dark', 'glow': 'accent', 'vignette': True},
  [T('t10', [words(v, j[:2]), words(v, j[2:], {'موتيك': 'big'})], x=0.5, y=0.42, w=0.86, size='xxl', anim='blur'),
   U('cta', 'button', title='اصنع الريلز تاعك', x=0.5, y=0.68, w=0.66, at=j[-1])],
  transition='flash', camera=('push', 0.6), intent='call to action')

for s in v.scenes:
    for l in s['layers']:
        if 'from_' in l: l['from'] = l.pop('from_')
v.save()
