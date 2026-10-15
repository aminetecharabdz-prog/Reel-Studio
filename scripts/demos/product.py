from lib import *

style = {
    'name': 'Noir & gold',
    'palette': {'ink': '#17130E', 'paper': '#F1EADF', 'accent': '#C9973F', 'accent2': '#E8D3A8', 'muted': '#8E8578', 'dark': '#0B0907'},
    'fonts': {'display': {'ar': 'el-messiri', 'lat': 'playfair', 'weight': 700, 'italic': False},
              'serif': {'ar': 'amiri', 'lat': 'playfair', 'weight': 700, 'italic': True},
              'body': {'ar': 'readex', 'lat': 'inter', 'weight': 500, 'italic': False},
              'impact': {'ar': 'alexandria', 'lat': 'bebas', 'weight': 800, 'italic': False}},
    'grain': 0.2, 'motion': 'cinematic', 'music': 'calm-pad', 'sfx': 'soft', 'captions': 'none',
}
v = Video('product', style, bpm=80, wps=2.3, music='calm-pad', mode='product', title='ساعة كلاسيك — إعلان', blurb='إعلان منتوج فاخر')
DARK = {'kind': 'spotlight', 'tone': 'dark', 'vignette': True, 'leak': True, 'glow': 'accent'}

a = v.say('راك تحوس على هدية تبقى؟', pause=450)
v.scene(a, DARK,
  [T('ghost', [[{'t': 'هدية'}]], x=0.5, y=0.5, w=1.4, size='mega', role='serif', opacity=0.08, rotate=-8, anim='blur', hier=False, at=a[0]),
   I('gift', obj('gift-box'), x=0.5, y=0.62, w=0.7, anim='drop', idle='float', at=v.find(a, 'هدية'), depth=0.7),
   T('t1', [words(v, a[:3]), words(v, a[3:4], {'هدية': 'serif'}), words(v, a[4:])], x=0.62, y=0.27, w=0.72, size='xxl', align='start', anim='rise')],
  camera=('push', 0.5), intent='hook: a gift drops into a warm spotlight, ghost word behind')

b = v.say('ساعة كلاسيك، معدن صافي', pause=350)
v.scene(b, {'kind': 'solid', 'tone': 'light', 'vignette': True},
  [S('arc', 'arc', x=0.55, y=0.5, w=1.2, h=1.1, color='accent', stroke=12, anim='draw', at=b[0]),
   I('watch', obj('wristwatch'), x=0.72, y=0.58, w=1.0, rotate=-14, anim='slide-left', idle='sway', at=b[0], depth=0.8),
   T('t2', [words(v, b[:1], {'ساعة': 'big'}), words(v, b[1:])], x=0.36, y=0.26, w=0.6, size='xxl', align='start', anim='mask')],
  transition='fade', camera=('push', 0.4), intent='product reveal: the watch slides in, cropped by the right edge, gold arc')

c = v.say('تقاوم الماء', pause=380)
v.scene(c, {'kind': 'photo', 'tone': 'dark', 'image': bgp('water'), 'vignette': True},
  [T('t3', [words(v, c[:1]), words(v, c[1:], {'الماء': 'serif'})], x=0.5, y=0.3, w=0.86, size='xxl', anim='blur', color='white'),
   I('w2', obj('wristwatch'), x=0.5, y=0.64, w=0.6, anim='zoom', idle='float', at=c[1], glow='accent2')],
  transition='blur', camera=('drift', 0.5), intent='benefit 1: water resistant, real ocean photo behind')

d = v.say('وتليق مع كل لبسة', pause=400)
v.scene(d, {'kind': 'photo', 'tone': 'dark', 'image': bgp('city-night'), 'vignette': True, 'leak': True, 'glow': 'accent'},
  [I('frame', bgp('boutique'), x=0.5, y=0.56, w=0.66, h=0.46, frame='card', anim='reveal', idle='none', at=d[0], shadow=True, fit='cover'),
   T('t4', [words(v, d[:2]), words(v, d[2:], {'لبسة': 'accent'})], x=0.5, y=0.22, w=0.86, size='xl', anim='rise', color='white')],
  transition='zoom', camera=('push', 0.4), intent='benefit 2: lifestyle framed photo, city at night')

e = v.say('بـ 4900 دج بدل 6500', pause=420)
v.scene(e, {'kind': 'solid', 'tone': 'accent', 'vignette': True},
  [S('sh1', 'shard', x=0.88, y=0.1, w=0.44, h=0.2, rotate=90, color='paper', fill=True, anim='pop', at=e[0]),
   S('sh2', 'shard', x=0.12, y=0.9, w=0.4, h=0.18, rotate=-90, color='paper', fill=True, anim='pop', at=e[1]),
   U('price', 'price', title='السعر', value=4900, oldValue=6500, x=0.5, y=0.44, w=0.8, at=e[1], anim='pop'),
   I('w3', obj('wristwatch'), x=0.5, y=0.72, w=0.5, anim='float', idle='bob', at=e[2], rotate=8)],
  transition='flash', camera=('punch', 0.5), intent='offer: price slam on a gold field')

f = v.say('توصيل 58 ولاية والدفع عند الاستلام', pause=420)
v.scene(f, {'kind': 'paper', 'tone': 'light', 'vignette': True},
  [C('n58', 58, x=0.5, y=0.3, w=0.8, size='mega', color='accent', at=v.find(f, '58')),
   T('t6', [words(v, f[:1]), words(v, f[2:3]), words(v, f[3:], {'الاستلام': 'serif'})], x=0.5, y=0.6, w=0.86, size='xl', anim='rise', hier=False)],
  transition='whip', camera=('push', 0.4), intent='trust: delivery to 58 wilayas, cash on delivery')

g = v.say('اطلب دروك', pause=900)
v.scene(g, DARK,
  [I('w4', obj('wristwatch'), x=0.5, y=0.36, w=0.62, anim='zoom', idle='float', at=g[0], glow='accent'),
   T('t7', [words(v, g, {'دروك': 'accent'})], x=0.5, y=0.66, w=0.8, size='xxl', anim='stamp'),
   U('cta', 'button', title='اطلب الآن', x=0.5, y=0.79, w=0.6, at=g[-1])],
  transition='fade', camera=('push', 0.5), intent='CTA')

for s in v.scenes:
    for l in s['layers']:
        if 'from_' in l: l['from'] = l.pop('from_')
v.save()
