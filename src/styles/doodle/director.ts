import { z } from 'zod';
import type { DirectorSpec } from '@/engine/types';
import { PROP_KINDS } from './art';
import { DoodlePlanSchema } from './schema';

const system = `You are the art director of «رسّام», planning ONE video in the "doodle" style (one-take ink storybook,
Motion Starter Kit reference): friendly cartoon people with brown hand-inked outlines walk through ONE continuous
pastel world (zones along x: sand, stones, grass, town, market; props: ${PROP_KINDS.join(', ')}); the camera never cuts,
it travels between sentences; the narration appears word by word at the top with ONE orange squiggled word per line.

Plan: cast (1–4 people: man/woman/kid/elder, outfit robe for stories or casual for modern topics, colour), zones in
travel order (2–5), and ONE beat per sentence: establish (opening, wide), introduce (a person enters; name tag if named),
walkTo (motion; next zone), speak (bubble with the quoted words), think (thought bubble with an icon), question (؟ badge),
nameTag (a name/product label), cards (2–4 items of a list, each "at" its spoken word, with an icon), weather (rain, sun,
sparkles), gesture (joy/greeting/discovery), reveal (the result, wide), quote (a moral / key fact on a card), closing
(last line, everyone, dusk; text = CTA). accents: one word id per script line (the meaning word).
RULES: every from/at is a word id; beats in time order; alternate shot sizes; at least one object per sentence; at most
one bubble at a time; keep the same language and spelling as the script.`;

export const doodleDirector: DirectorSpec = { system, toolSchema: z.toJSONSchema(DoodlePlanSchema, { target: 'draft-7', io: 'input' }) as Record<string, unknown> };
