---
name: arabic-rtl-video
description: Rules and tests for rendering Arabic, Algerian Darija and mixed Arabic/French/English text with numbers correctly in Remotion videos and the RTL web UI — shaping, bidi order, line breaking, fonts, digits, mirroring. Use whenever code renders or measures text, or when a caption/title looks wrong.
---

# Arabic & mixed-script text (video + UI)

## Must-haves
1. Every text container: `direction: rtl` for Arabic-dominant text; wrap each Latin/number run with `unicode-bidi: isolate` (`<bdi>` in UI). Detect direction per line from the first strong character.
2. Never split a word across lines; never letter-space Arabic (breaks joining). Use font features, not CSS letter-spacing.
3. Measure with the real font before layout (`@remotion/layout-utils` → `measureText` / `fitText`), after fonts have loaded.
4. Leave vertical room for diacritics and tall letters: line-height ≥ 1.35 for Arabic display fonts; add padding to clipped containers.
5. Animations: "reading direction" effects (typewriter, wipe, word-by-word, slide-in) go **right → left** for Arabic, left → right for Latin runs.
6. Word-by-word caption highlight works on whole words; Arabic words must stay joined while highlighted (wrap the whole word in one span — never per-letter spans in Arabic).
7. Digits: default Western digits (123) — common in Algeria; option for Eastern Arabic (١٢٣). Prices like `2500 دج`, `DA 2 500`, `3500DA` must keep the number and currency together.
8. Punctuation: Arabic comma `،`, question mark `؟`, semicolon `؛`. Keep French punctuation for French runs.
9. Fonts: pair an Arabic display font (e.g. Lalezar, Alexandria, El Messiri, Readex Pro, Cairo, Tajawal, Almarai, Baloo Bhaijaan 2, Changa, Noto Kufi) with a Latin font that matches weight and x-height. Check that every glyph in the text exists in the chosen font; fall back gracefully.

## Darija specifics
- Speech mixes Arabic script Darija with French words (livraison, la veste, sport, montage) and sometimes writes them in Arabic letters. Keep the transcript's script choice; do not "correct" Darija into MSA.
- Common Darija words to treat as stopwords for keyword detection: راني، راك، راه، واش، باش، بلي، هاذ، هادي، تاع، بزاف، شوية، كيما، وين، كي، مور، برك، غير، يا.
- Question openers: واش، علاش، كيفاش، وين، قداش، شكون.

## Test strings (add to unit + visual tests)
- `الجاكيت ب 3500 DA مع livraison لـ 58 ولاية`
- `واش تعرف بلي 70% من الناس ما يغسلوش سنانهم مليح؟`
- `Make it مع Claude: الريل واجد في 47 ثانية!`
- `أولا: بدّل l'huile كل 10 000 km`
- Long single word stress test: `والمستشفيات`

## Checklist when something "looks wrong"
- Is the container direction correct for the dominant script?
- Are Latin/number runs isolated?
- Was text measured before fonts loaded?
- Is a per-letter animation breaking Arabic joining?
- Is CSS `letter-spacing` or `text-transform` applied to Arabic?
