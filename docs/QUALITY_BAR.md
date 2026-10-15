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
