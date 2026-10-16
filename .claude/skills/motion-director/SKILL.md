---
name: motion-director
description: Professional motion-graphics craft for auto-generated reels — speech beats, word-anchored timing, easing, composition, transitions, sound design and anti-template variety. Use when planning scenes, building Remotion primitives, writing the AI art/scene director prompts, or judging whether a generated video looks professional.
---

# Motion Director

You are directing short vertical videos (15–90 s) where every visual serves the spoken word. The bar is a senior motion designer at a top agency, not a slideshow.

## 1. Read the speech before designing
1. Split the transcript into **beats**: one idea each, usually 1–3 sentences, 1.5–6 s.
2. For each beat find: the **key word(s)** (nouns, numbers, verbs of change, emotional words), the **beat type**, and the **visual metaphor**.
3. Beat types → good primitive families:
   | Beat type | Examples | Primitive ideas |
   |---|---|---|
   | Hook / question | "واش تعرف بلي…؟" | giant kinetic question, zoom-punch, glitch reveal |
   | Problem / pain | "سنانك يوجعوك" | red accent, shake/crack, warning icon, before state |
   | Number / fact | "70% من الناس" | counter, ring/bar, big number + label |
   | List / steps | "أولا… ثانيا…" | stacked list reveal, numbered steps, checklist |
   | Comparison | "بدل… استعمل…" | split screen, before/after, A vs B |
   | Process / how | "كيفاش يخدم المحرك" | diagram build, arrows, timeline, exploded view |
   | Product / offer | "ب 2500 دج" | product hero, price tag, delivery/COD badge |
   | Emotion / story | "حسيت براحة" | full-bleed image, slow Ken Burns, soft type |
   | CTA | "اطلب دروك" | strong button-like card, arrow, handle/phone |
4. Never illustrate filler words. Not every sentence needs a new scene — sustain a scene with emphasis motion instead of cutting for the sake of cutting.

## 2. Timing (word-anchored)
- Visual entrance starts **3–6 frames before** its key word (at 30 fps), entrance finishes by the end of that word.
- Emphasis (scale 1→1.06, color sweep, underline draw) lands exactly **on** the stressed word.
- Exits happen at beat end, preferably during a pause; never mid-word.
- Cuts snap to word boundaries, ideally inside pauses ≥ 120 ms.
- Nothing static for more than ~2 s: add secondary motion (drift, parallax, subtle loop) during long beats.
- Pacing presets: fast = new visual idea every 1.2–2 s; normal 2–3 s; calm 3–4.5 s. "Auto" follows speech rate and energy.

## 3. Motion language
- Use springs and custom beziers, not linear. Pick ONE family per video from the Design DNA:
  - snappy: `cubic-bezier(.2,.9,.1,1)`, 8–12 f entrances
  - smooth: `cubic-bezier(.4,0,.2,1)`, 14–20 f
  - bouncy: spring damping 10–12, slight overshoot
  - mechanical: steps/linear segments, precise, tech feel
  - elastic: spring damping 6–8 (use sparingly, playful brands)
- Principles: anticipation, follow-through, overlap (stagger children 2–4 f), arcs, ease-in/out, secondary action. Large elements move less and slower; small elements can move faster.
- Transitions: match-cut on shape/colour, push, mask wipe, zoom-through, morph. Max 2–3 transition types per video, from the DNA.
- Respect reading time: a line of on-screen text must stay ≥ (words × 0.25 s + 0.5 s) unless it's mirrored by captions.

## 4. Composition (9:16 first)
- Safe zones: keep text out of the top ~12 % and bottom ~20 % and right ~12 % (platform UI). Use the platform overlay toggle to check.
- One focal point per frame. Visual hierarchy: key word / visual > supporting text > decoration.
- Grid: 8-pt spacing; consistent margins (≥ 64 px at 1080 w).
- Typography: display size for key words (110–180 px at 1080 w), body 48–64 px, captions ≥ 42 px. Max ~3 lines of display text.
- Contrast ≥ 4.5:1 for text. Add scrims/blur behind text on photos.
- Captions and graphics must never collide — reserve a caption zone per layout.

## 5. Anti-template variety
- Every video gets a fresh Design DNA (palette, type pairing, layout grammar, motion family, background, texture, icon set, SFX palette) chosen from the **topic and audience**, overridden by the brand kit when present.
- Within a video: no identical primitive variant twice in a row; ≤ 3 uses of any primitive.
- Across videos: compare against the user's last 10 fingerprints; if too similar, re-roll the DNA/sequence.
- Variety must still feel **coherent**: same DNA throughout one video.

## 6. Sound design
- SFX tied to visual events: whoosh (transition), pop/click (icon/element in), tick (counter), riser (before reveal), impact (hook word). Subtle, −18 to −24 dB under voice.
- Music: mood-matched, ducked −12 dB under speech (150 ms attack / 400 ms release), fade in/out. Optional cut-on-beat in Auto pacing.

## 7. Topic-specific direction (examples, not templates)
- Dentist/doctor tips: clean clinical palette or warm trust palette, anatomical illustrations, icons, check/cross comparisons, calm-to-normal pacing.
- Car engines/mechanics: dark industrial or bold technical palette, exploded diagrams, gauges, arrows, mechanical easing, faster pacing.
- Product ads (phone holder, shoes, clothes): product hero shots with shadows, feature callouts pointing at the product, price/offer badges, energetic pacing, strong CTA, hook in first 1.5 s.

## 8. Self-check before shipping a plan
- Does each scene's visual match what is *said at that moment*?
- Is the hook visually strong within the first 1.5 s?
- Is there any frame where text is hard to read, crowded, or under platform UI?
- Would a viewer believe a human motion designer made this specifically for this topic?
