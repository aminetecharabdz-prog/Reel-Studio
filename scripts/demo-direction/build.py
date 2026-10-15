"""Demo scene plans authored by Claude as art/scene director (QUALITY_BAR: demos must be Claude-quality,
stored as fixtures). Run: python3 scripts/demo-direction/build.py → public/demo/<id>.direction.json"""
import json, os
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'demo')

def S(i, a, b, hero, headline=None, kicker=None, at=None, bg='dna', tr='cut', variant=0, emphasis=(), prim='hero-scene', **content):
    c = {'hero': hero}
    if headline: c['headline'] = headline
    if kicker: c['kicker'] = kicker
    if at: c['headlineAt'] = at
    c.update(content)
    return {'id': f's{i}', 'from': a, 'to': b, 'primitive': prim, 'variant': variant, 'content': c, 'emphasis': list(emphasis),
            'transition': tr, 'bgIndex': i % 3, 'bg': bg, 'zoomOn': [], 'locked': False}

def dna(mood, bg, surface, primary, accent, text, display, body, captions, latin, easing, base, transitions, bgkind, illus, iconset, grain, shadows, corners, sfx, seed, layout='centered', scale=1.0, angle=165, pattern='dots'):
    return {'mood': mood, 'palette': {'bg': bg, 'surface': surface, 'primary': primary, 'accent': accent, 'text': text, 'textOnAccent': '#111111'},
            'typography': {'display': display, 'body': body, 'captions': captions, 'latin': latin, 'scale': scale, 'weightContrast': 'high'},
            'layoutGrammar': layout, 'motionLanguage': {'easing': easing, 'baseDurationFrames': base, 'overshoot': 0.2, 'stagger': 3, 'transitionFamily': transitions},
            'background': {'kind': bgkind, 'params': {'angle': angle, 'pattern': pattern, 'density': 0.6}}, 'illustrationStyle': illus, 'iconSet': iconset,
            'texture': {'grain': grain, 'shadows': shadows, 'corners': corners}, 'sfxPalette': sfx, 'seed': seed}

F = lambda f, w: {'family': f, 'weight': w}

# ───────────── Dentist: clinical blue, glossy 3D, white teeth, mint accent ─────────────
dentist_dna = dna('clinical-blue-trust', ['#0E6BD8', '#0A55B8', '#1477E0'], '#0A3F8F', '#8FE6FF', '#5CF2C0', '#FFFFFF',
                  F('readex', 700), F('tajawal', 500), F('tajawal', 800), 'bricolage', 'bouncy', 14, ['zoom', 'slide', 'iris'], 'gradient',
                  'glossy 3D dental illustration, white teeth on clinical blue, soft studio light', 'fluent-emoji-flat', 0.04, 'soft', 36, 'soft-ui', 4127)
dentist = [
    S(0, 'w0', 'w3', {'note': '7 worried faces out of 10 = the 70% statistic, literally', 'layout': 'count', 'art': 'grimacing-face', 'art2': 'smiling-face-with-smiling-eyes', 'count': 10, 'highlight': 7, 'backdrop': 'card'},
      '70%', 'من الناس', 'w3', bg='spotlight', emphasis=['w3']),
    S(1, 'w4', 'w9', {'note': 'teeth with yellow plaque between them = teeth not brushed well; microbe badge', 'illus': 'teeth-row', 'illusParams': {'plaque': True}, 'badge': {'art': 'microbe', 'at': 'w8'}},
      'سنان مهملة', None, 'w7', bg='dna', tr='zoom', emphasis=['w7']),
    S(2, 'w10', 'w14', {'note': 'the dentist introduces herself: health-worker character in a clinic room, tooth + stethoscope props', 'art': 'woman-health-worker', 'backdrop': 'arch', 'props': ['tooth', 'stethoscope', 'sparkles']},
      'د. سارة', 'طبيبة أسنان', 'w11', bg='room', tr='slide', variant=1),
    S(3, 'w15', 'w19', {'note': '3 light bulbs = 3 tips', 'layout': 'count', 'art': 'light-bulb', 'count': 3, 'backdrop': 'none'},
      '3 نصائح', 'بسيطة', 'w17', bg='rays', tr='iris', emphasis=['w17']),
    S(4, 'w20', 'w26', {'note': 'tip 1: twice a day = sun (morning) and night, toothbrush badge', 'layout': 'pair', 'art': 'sun-behind-small-cloud', 'art2': 'night-with-stars', 'markAt': 'w23', 'badge': {'art': 'toothbrush', 'text': 'نصيحة 1', 'at': 'w21'}},
      'مرتين', 'في النهار', 'w23', bg='split', tr='slide', emphasis=['w23']),
    S(5, 'w27', 'w29', {'note': '2 minutes = stopwatch, toothbrush prop', 'art': 'stopwatch', 'backdrop': 'ring', 'props': ['toothbrush', 'sparkles']},
      '2 دقايق', None, 'w27', bg='spotlight', tr='zoom', variant=1, emphasis=['w28']),
    S(6, 'w30', 'w37', {'note': 'tip 2: change the toothbrush every 3 months = toothbrush + calendar badge', 'art': 'toothbrush', 'backdrop': 'blob', 'badge': {'art': 'spiral-calendar', 'text': '3 شهور', 'at': 'w36'}, 'props': ['counterclockwise-arrows-button']},
      'بدّل la brosse', 'نصيحة 2', 'w31', bg='duotone', tr='slide', emphasis=['w33']),
    S(7, 'w38', 'w40', {'note': "don't wait until it's worn out = old toothbrush crossed out", 'art': 'toothbrush', 'mark': 'cross', 'markAt': 'w40', 'backdrop': 'disc'},
      'فرشاة مهترئة', None, 'w40', bg='dna', tr='zoom', variant=1),
    S(8, 'w41', 'w45', {'note': 'tip 3: floss = thread sliding between the teeth, cleaning the plaque', 'illus': 'teeth-row', 'illusParams': {'plaque': True, 'floss': True}, 'badge': {'art': 'thread', 'text': 'نصيحة 3', 'at': 'w44'}},
      'le fil dentaire', None, 'w44', bg='grid', tr='iris', variant=1, emphasis=['w44']),
    S(9, 'w46', 'w51', {'note': "the brush can't reach between teeth = magnifier on the gaps with germs", 'art': 'magnifying-glass-tilted-left', 'backdrop': 'disc', 'props': ['microbe', 'tooth', 'microbe']},
      'بين السنان', 'ما توصلش', 'w50', bg='spotlight', tr='slide'),
    S(10, 'w52', 'w56', {'note': 'beware sugar and soft drinks = candy + soda forbidden', 'layout': 'pair', 'art': 'candy', 'art2': 'cup-with-straw', 'mark': 'forbidden', 'markAt': 'w54', 'badge': {'art': 'warning', 'at': 'w52'}},
      'حذاري!', 'sucre · soda', 'w52', bg='rays', tr='zoom', emphasis=['w54', 'w55']),
    S(11, 'w57', 'w61', {'note': 'first cause of tooth decay = cross-section with a cavity reaching the dentin, candy badge', 'illus': 'tooth-cross', 'illusParams': {'highlight': 'cavity'}, 'badge': {'art': 'candy', 'at': 'w58'}},
      'التسوس', 'la carie', 'w61', bg='dna', tr='iris', variant=1, emphasis=['w58']),
    S(12, 'w62', 'w67', {'note': 'pain when drinking cold = cold waves hitting the tooth, pulsing red pulp, cold face badge', 'illus': 'tooth-cross', 'illusParams': {'highlight': 'cold'}, 'badge': {'art': 'cold-face', 'at': 'w64'}},
      'حساسية', 'sensibilité', 'w64', bg='deep', tr='slide', emphasis=['w64', 'w67']),
    S(13, 'w68', 'w72', {'note': 'go see the dentist = clinic with calendar badge', 'art': 'hospital', 'backdrop': 'arch', 'props': ['tooth', 'stethoscope'], 'badge': {'art': 'spiral-calendar', 'text': 'موعد', 'at': 'w70'}},
      'زور الطبيب', None, 'w70', bg='room', tr='zoom', emphasis=['w70']),
    S(14, 'w73', 'w74', {'note': 'your smile deserves it = beaming face with sparkles and hearts orbiting', 'layout': 'orbit', 'art': 'beaming-face-with-smiling-eyes', 'props': ['sparkles', 'sparkling-heart', 'glowing-star', 'tooth']},
      'ابتسامتك', None, 'w73', bg='rays', tr='iris', emphasis=['w73']),
    S(15, 'w75', 'w78', {'note': 'follow me = bell + thumbs up + heart', 'art': 'bell', 'backdrop': 'ring', 'props': ['thumbs-up', 'red-heart']},
      'تابعني', '@dr.sara.dental', 'w75', bg='split', tr='slide', emphasis=['w75']),
]

# ───────────── Engine: graphite night + molten orange, technical cutaways ─────────────
engine_dna = dna('garage-night-precision', ['#15181D', '#1B1F26', '#101216'], '#232830', '#FF7A1A', '#FFC53D', '#F4F6F8',
                 F('changa', 800), F('cairo', 600), F('cairo', 800), 'unbounded', 'snappy', 10, ['wipe', 'shutter', 'push'], 'grain',
                 'technical cutaway illustration, brushed metal, molten orange accents', 'tabler', 0.12, 'long', 12, 'mechanical', 90211, layout='asymmetric', scale=1.05, angle=200)
engine = [
    S(0, 'w0', 'w3', {'note': 'how does a car engine work = the engine cross-section running', 'illus': 'engine-cylinder', 'illusParams': {'stroke': 'cycle', 'speed': 1.1}},
      'الموتور', '4 temps', 'w2', bg='grid', emphasis=['w2']),
    S(1, 'w4', 'w9', {'note': 'everything happens in a quarter of a second = stopwatch with sparks', 'art': 'stopwatch', 'backdrop': 'ring', 'props': ['high-voltage', 'gear', 'fire']},
      'ربع ثانية', None, 'w5', bg='spotlight', tr='wipe', variant=1, emphasis=['w5']),
    S(2, 'w10', 'w14', {'note': '4 stages = 4 gears', 'layout': 'count', 'art': 'gear', 'count': 4, 'backdrop': 'none'},
      '4 مراحل', None, 'w13', bg='rays', tr='shutter', emphasis=['w13']),
    S(3, 'w15', 'w22', {'note': 'stroke 1: piston goes down, air + fuel enter through the intake valve', 'illus': 'engine-cylinder', 'illusParams': {'stroke': 1}, 'badge': {'art': 'fuel-pump', 'text': "l'essence", 'at': 'w22'}},
      'الشفط', '1 · admission', 'w15', bg='dna', tr='push', emphasis=['w18']),
    S(4, 'w23', 'w25', {'note': 'stroke 2: piston goes up and compresses the mixture', 'illus': 'engine-cylinder', 'illusParams': {'stroke': 2}},
      'الضغط', '2 · compression', 'w23', bg='grid', tr='wipe', variant=1, emphasis=['w25']),
    S(5, 'w26', 'w30', {'note': 'stroke 3: the spark plug fires', 'illus': 'engine-cylinder', 'illusParams': {'stroke': 3}, 'badge': {'art': 'high-voltage', 'text': 'شرارة', 'at': 'w30'}},
      'la bougie', '3 · étincelle', 'w28', bg='spotlight', tr='shutter', emphasis=['w30']),
    S(6, 'w31', 'w36', {'note': 'the explosion pushes the piston down hard = explosion with fire', 'art': 'collision', 'backdrop': 'ring', 'props': ['fire', 'high-voltage', 'fire']},
      'انفجار!', 'explosion', 'w31', bg='rays', tr='push', variant=1, emphasis=['w31', 'w36']),
    S(7, 'w37', 'w41', {'note': 'stroke 4: smoke leaves through the exhaust valve', 'illus': 'engine-cylinder', 'illusParams': {'stroke': 4}, 'badge': {'art': 'dashing-away', 'at': 'w39'}},
      "l'échappement", '4 · الدخان', 'w41', bg='dna', tr='wipe', emphasis=['w39']),
    S(8, 'w42', 'w48', {'note': 'the cycle repeats thousands of times a minute = engine running fast with a cycle badge', 'illus': 'engine-cylinder', 'illusParams': {'stroke': 'cycle', 'speed': 3.2}, 'badge': {'art': 'counterclockwise-arrows-button', 'at': 'w44'}},
      'بلا حبس', 'آلاف المرات', 'w45', bg='grid', tr='shutter', variant=1, emphasis=['w45']),
    S(9, 'w49', 'w55', {'note': '3000 rpm at 90 km/h = tachometer needle on 3, car badge with 90', 'illus': 'gauge-dial', 'illusParams': {'value': 3, 'max': 8, 'unit': 'x1000 tr/min'}, 'badge': {'art': 'racing-car', 'text': '90 km/h', 'at': 'w55'}},
      '3000 دورة', None, 'w50', bg='spotlight', tr='push', emphasis=['w50']),
    S(10, 'w56', 'w59', {'note': 'to make the engine last = mechanic with tools', 'art': 'man-mechanic', 'backdrop': 'arch', 'props': ['wrench', 'gear', 'nut-and-bolt']},
      'صيانة', 'entretien', 'w58', bg='room', tr='wipe', variant=1),
    S(11, 'w60', 'w64', {'note': 'change the oil every 10 000 km = oil drum + motorway badge', 'art': 'oil-drum', 'backdrop': 'disc', 'props': ['droplet', 'droplet'], 'badge': {'art': 'motorway', 'text': '10 000 km', 'at': 'w63'}},
      "بدّل l'huile", None, 'w61', bg='duotone', tr='shutter', emphasis=['w61', 'w63']),
    S(12, 'w65', 'w69', {'note': 'check the radiator water = water + thermometer', 'art': 'water-wave', 'backdrop': 'blob', 'props': ['thermometer', 'droplet'], 'badge': {'art': 'magnifying-glass-tilted-left', 'at': 'w65'}},
      'le radiateur', 'الماء', 'w69', bg='grid', tr='push', variant=1, emphasis=['w66']),
    S(13, 'w70', 'w73', {'note': 'good engine, safe road = car with shield and a green check', 'art': 'oncoming-automobile', 'mark': 'check', 'markAt': 'w73', 'backdrop': 'ring', 'props': ['shield', 'sparkles']},
      'طريق آمنة', None, 'w72', bg='rays', tr='wipe', emphasis=['w73']),
]

# ───────────── Phone holder ad: warm cream, hot orange, black chips, product + car POV ─────────────
holder_dna = dna('street-deal-energy', ['#FFF3E3', '#FFE6C7', '#FFF8EE'], '#FFFFFF', '#F24E0F', '#161616', '#141414',
                 F('lalezar', 400), F('cairo', 700), F('cairo', 800), 'archivo-black', 'bouncy', 10, ['zoom', 'push', 'flash'], 'gradient',
                 'bright commercial product photography, warm light', 'solar', 0.03, 'long', 28, 'punchy', 31337, scale=1.05, angle=150)
P = {'src': 'demo/phone-holder.svg'}
holder = [
    S(0, 'w0', 'w5', {'note': 'driving and the phone falls = car POV, phone tumbling off the dashboard, worried face', 'illus': 'car-dash', 'illusParams': {'phone': 'falling', 'bumpy': True}, 'badge': {'art': 'anxious-face-with-sweat', 'at': 'w3'}},
      'يطيح؟', None, 'w3', bg='dna', emphasis=['w3']),
    S(1, 'w6', 'w11', {'note': 'the solution = the magnetic holder itself, magnet + sparkles', 'image': P, 'cutout': True, 'backdrop': 'disc', 'props': ['magnet', 'sparkles']},
      'الحل', 'magnétique', 'w8', bg='rays', tr='zoom', variant=1, emphasis=['w8', 'w11']),
    S(2, 'w12', 'w17', {'note': 'installs in a second on the AC vent = phone snapping onto the holder in the car', 'illus': 'car-dash', 'illusParams': {'phone': 'snap'}, 'badge': {'art': 'stopwatch', 'text': '1 seconde', 'at': 'w14'}},
      'la clim', 'تركيب سهل', 'w17', bg='spotlight', tr='push', emphasis=['w14']),
    S(3, 'w18', 'w24', {'note': 'holds firmly even on bad roads = bumpy road, phone stays put, green check', 'illus': 'car-dash', 'illusParams': {'phone': 'mounted', 'bumpy': True}, 'mark': 'check', 'markAt': 'w20', 'badge': {'art': 'magnet', 'at': 'w18'}},
      'يشد بقوة', None, 'w20', bg='split', tr='flash', variant=1, emphasis=['w20']),
    S(4, 'w25', 'w27', {'note': 'rotates 360° = the real holder with a phone on it, rotation arrows orbiting', 'image': {'src': 'demo/phone-holder-in-use.svg'}, 'cutout': True, 'spin': True, 'backdrop': 'ring', 'props': ['counterclockwise-arrows-button', 'sparkles']},
      '360°', 'rotation', 'w26', bg='dna', tr='zoom', emphasis=['w26']),
    S(5, 'w28', 'w30', {'note': 'fits all phones = a row of phones', 'layout': 'count', 'art': 'mobile-phone', 'count': 4, 'backdrop': 'card'},
      'لكل الأنواع', None, 'w29', bg='duotone', tr='push'),
    S(6, 'w31', 'w38', {'note': 'price drop 2500 → 1500 DA = product with a price sticker that flips to the new price', 'image': P, 'cutout': True, 'backdrop': 'ring', 'props': ['money-with-wings']},
      'تخفيض', '-40%', 'w35', bg='rays', tr='flash', emphasis=['w33', 'w37'], price=1500, oldPrice=2500, currency='دج', valueAt='w37'),
    S(7, 'w39', 'w42', {'note': 'delivery to 58 wilayas = delivery truck with parcels and a map pin', 'art': 'delivery-truck', 'backdrop': 'disc', 'props': ['package', 'round-pushpin'], 'badge': {'art': 'globe-showing-europe-africa', 'text': '58 ولاية', 'at': 'w41'}},
      'livraison', '58 ولاية', 'w39', bg='split', tr='push', variant=1, emphasis=['w41']),
    S(8, 'w43', 'w45', {'note': 'pay on delivery = parcel + money bag with a green check', 'layout': 'pair', 'art': 'package', 'art2': 'money-bag', 'mark': 'check', 'markAt': 'w45'},
      'خلّص كي تستلم', None, 'w44', bg='spotlight', tr='zoom', emphasis=['w45']),
    S(9, 'w46', 'w52', {'note': 'order now before stock runs out = cart + hourglass', 'art': 'shopping-cart', 'backdrop': 'blob', 'props': ['sparkles', 'package'], 'badge': {'art': 'hourglass-not-done', 'text': 'stock محدود', 'at': 'w50'}},
      'اطلب دروك', '0770 00 11 22', 'w46', bg='rays', tr='flash', emphasis=['w46', 'w52']),
]

for name, d, scenes in [('dentist', dentist_dna, dentist), ('engine', engine_dna, engine), ('phone-holder', holder_dna, holder)]:
    with open(os.path.join(OUT, f'{name}.direction.json'), 'w') as f:
        json.dump({'author': 'Claude (art + scene director) — authored fixture, see scripts/demo-direction/build.py', 'dna': d, 'plan': {'scenes': scenes}}, f, ensure_ascii=False, indent=1)
    print(name, len(scenes))
