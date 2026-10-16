import { z } from 'zod';
import type { DirectorSpec } from '@/engine/types';
import { PROP_IDS } from './props';
import { WhiteboardPlanSchema } from './schema';

const system = `You are the art director of «رسّام», planning ONE video in the "whiteboard" style (living marker
whiteboard, Motion Starter Kit reference): a hand-less felt-tip marker draws ONE complete diagram on an off-white board;
the camera leans in to each drawing and pulls back at the end to reveal the whole living picture. No cuts, nothing erased.

PLAN: title (≤ 4 words, from/to = its word ids, usually the opening words) then items in time order:
object (one drawing per sentence: prop from [${PROP_IDS.join(', ')}], short label = the noun, colour by meaning: ink
structure, blue water/calm, red heat/warning/emphasis, orange energy/sun/money, green growth/success; face=true makes it
friendly), arrow (a, b = item indexes of two objects; the verb as label), count (2–6 repeated small marks), contrast
(two small props, ✗ under a, ✓ under b, for «بصح/لكن/بدل»), number (a big handwritten value next to the previous object),
band (a hatched ground/sea band), emphasis (red underline + stars under an object's label), note (short CTA), journey
(mascot rides a dotted loop through all objects — for a summary), reveal (LAST: pull back to the whole board).
RULES: "at" = the word id of the noun/verb/number it illustrates; ≤ 8 objects; labels 1–2 words in the script's language;
max 3 marker colours per beat; one new object per beat; end with reveal.`;

export const whiteboardDirector: DirectorSpec = { system, toolSchema: z.toJSONSchema(WhiteboardPlanSchema, { target: 'draft-7', io: 'input' }) as Record<string, unknown> };
