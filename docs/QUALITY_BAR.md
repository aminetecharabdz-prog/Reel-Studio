# Quality bar — what "professional" means here (read before any video work)

The owner reviewed the first dentist demo contact sheet and judged it **unacceptable**. This file defines the minimum bar. A video that fails any MUST below is not shippable, and the QA step must block it.

## What the competitor ("Make it") already delivers — we must clearly beat it
Observed from its published reels (dentist tips, motion-graphics explainer, jacket product ad):
- **Every frame is full.** Each scene has a large, rich hero visual filling 40–70 % of the frame: a cut-out photo of the speaker on a coloured stage, big 3D-style illustrations (a tooth cross-section with pulp, teeth rows with red/green markers, a gauge), a consistent illustrated character (yellow hoodie) acting out the sentence at a desk, phone mockups, a clock, an Instagram grid, confetti. Never a nearly empty screen with only a caption.
- **Visuals literally illustrate the sentence**: "تشققات كبار" → a cracked tooth with a red circle; "pulpe" → tooth cross-section with highlighted pulp; "ما عندك وقت" → clock; "مونتاج" → tangled colourful timeline; "Instagram" → row of IG posts.
- **Layered composition**: background (gradient / room / stage), mid-ground hero, foreground labels/badges/icons, plus the caption pill. Depth via shadows and scale.
- **Short keyword labels** on screen (1–3 words) — never the full sentence repeated twice.
- **Product ads** keep the real footage full-frame and add small punchy keyword labels and price/delivery badges ("350 تحت", "58 ولاية") on top; zoom/crop changes every 1–2 s.
- Consistent colour story per video (clinical blue for the dentist; warm cream for the explainer), different between videos.

## Frame-by-frame reference: how the competitor's reels are actually built
(Studied from screen recordings of its three published outputs. The owner's instruction: **match this level, then go a little beyond it.**)

### A. Expert talking-head + explainer graphics (dentist tips, ~50 s)
- **Layout, every scene:** the speaker's face/shoulders as a clean cut-out in the **top ~45 %** on a vivid blue gradient; the **bottom ~55 %** is a graphic panel that changes with every idea. Caption pill at the very bottom.
- **Graphic panel content** = a large, glossy, 3D-style medical illustration that literally shows the sentence: tooth cross-section with red cracks + "تشققات كبار" label with a highlighted word chip; row of teeth with a red "forbidden" circle for "ما تعضوش"; tooth with snowflake + "حساسية" red tag + small explanation card; magnifier over teeth for "micro-fissures"; mouth guard for "sport guard spécial"; pressure gauge icons; shield badge for protection.
- **Floating badge** top corner (warning triangle, magnifier-tooth, shield) that pops in with the idea.
- Full-frame **illustrated cutaway scenes** in between (a cartoon bodybuilder in a gym for "les body builders", a crack line drawing across the screen, a minimal tooth + dumbbell icons for "Donc la prochaine…").
- Headline labels are **2–3 words** in bold white with one word inside a coloured chip (e.g. `micro-fissures` + chip `تشققات صغار`).

### B. Pure motion-graphics explainer with a recurring character (~50 s)
- One **consistent illustrated character** (same face, yellow hoodie) appears across scenes acting out each sentence: at a desk with laptop and coffee, stressed with a tangled multicolour timeline above his head, holding a phone at a window with a city skyline, relaxed with hands behind head, holding a phone showing a reel, waving goodbye.
- Scenes are **rich illustrated rooms**: window with sunset/city, desk, mug, plants, picture frames, bokeh lights, depth.
- **Object metaphors** fill the top half: editing timeline with coloured clips and waveform, grid of Instagram posts, fanned stack of social cards, tangled lines (= stress), burst of light (= relief), phone mockup of the app UI, notification bell over a row of reels, logo sting at the end.
- Caption: dark rounded pill, white text, **keyword in yellow** (brand colour of that video), 1–2 lines.
- Strong colour story: navy night + yellow, consistent through the video.

### C. Product ad (jacket, ~35 s)
- **Every scene is a full-bleed lifestyle photo/video** of a model wearing the product in a situation that matches the sentence: running in rain (problem), shivering in a grey hoodie (cold), close-up of a cold face, smiling in the jacket (solution), close-up hand on the logo (quality), unboxing at home with **price badge "350 تحت"**, delivery badge **"58 ولاية"**, boxing pose in a gym ("تقدر ترتاض"), walking with friends in autumn park, thumbs-up close (CTA).
- These lifestyle shots are clearly **AI-generated from the product photo** (same model, same jacket, many contexts). Slow push-in/Ken Burns on each, cut every ~2–3 s.
- Captions: **each word in its own small dark box**, keyword boxes in **yellow** with dark text, centred low; mixed Arabic/French words in correct order ("les sportifs", "la veste", "très à l'aise", "la commande").

### What this tells us about the engine
- The quality comes mostly from **generated imagery** (consistent character, 3D-style topic illustrations, product-in-context lifestyle photos), composed in a strict, clean layout system, with keyword captions. Icons and text alone cannot reach it.
- Therefore **image generation is a core feature, not optional**: implement a provider (default: Google Gemini image model — check the current model name in Google's docs; it handles character consistency and putting a product into new scenes from a reference photo; keep fal.ai/OpenAI adapters). Per video: generate a style sheet first (character / product reference + palette), then every scene image with that reference so the style stays consistent. Cache everything.
- Mode A must support both layouts seen above: **speaker-top + graphic panel** (when a face/video is provided or a portrait photo is uploaded) and **full-frame illustrated scenes** (voice only).
- Mode B must support **product → AI lifestyle scenes** from 1–3 product photos.
- Until the owner adds an image key, demos must use the best possible vector/3D-icon compositions AND the UI must clearly say that full quality needs the image key; when a key exists, re-generate the demos with images.

## MUSTs for our engine (all videos, all topics)
1. **No empty scenes.** Every scene has a hero visual occupying ≥ 35 % of the frame area, plus at least one supporting element. Caption-only scenes are forbidden (automated check: measured hero bbox area).
2. **Topic-literal imagery.** The hero visual is chosen from the meaning of the sentence. For each scene the director must state *what the viewer sees and why it matches the words*. Generic shapes (a drop, a coloured square with a digit) are not acceptable as hero visuals.
3. **Rich illustration source.** Use, in order of preference: user media → high-quality illustrated/3D icon sets (e.g. fluent-emoji-3d / flat colour sets) composed into small scenes → generated images (when a key is present) → composed vector illustrations built from primitives (device mockups, charts, anatomy-like simple drawings). A single small line icon is never a hero.
4. **Per-video identity.** Palette, background treatment and layout grammar come from the topic (Design DNA), not from the app's UI brand colours. Backgrounds vary within a video (at least 3 different treatments / compositions).
5. **Headline ≠ caption.** On-screen headline is 1–3 key words or a number; never the same sentence as the caption.
6. **Correct mixed Arabic/French order** in every text node (e.g. "استعمل le fil dentaire", "بدّل la brosse تاعك").
7. **Numbers shown at their final value** in the hero frame (counters finish on the spoken number).
8. **Motion everywhere**: entrance, emphasis on the key word, subtle loop while held, exit; camera moves (push-in, parallax) at least every 2 s.

## Demo projects must showcase the best quality
The demo projects are the owner's first impression and his sales material. Their scene plans should be authored by you (Claude) as the art/scene director — at Claude-API quality — and stored as fixtures, not produced by the rule-based fallback. The rule-based fallback must still meet the MUSTs above.

## Process
Before continuing to later phases: fix the engine against this file, re-render the three demos, build contact sheets, and compare them honestly against the competitor description above. Only continue when each demo would be accepted by a paying customer.
