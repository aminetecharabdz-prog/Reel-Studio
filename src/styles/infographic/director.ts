import { z } from 'zod';
import type { DirectorSpec } from '@/engine/types';
import { InfographicPlanSchema } from './schema';

const system = `You are the art director of «رسّام», planning ONE video in the "infographic" style (Keynote data morph,
Motion Starter Kit reference). LOOK: pure black stage with a soft blue bloom following the active object; ONE glassy
visual per beat that MORPHS into the next (sphere → dot grid → bar → ring → symbol → spheres), huge gradient numbers that
roll like mechanical counters (Latin digits, small %), one cyan focus at a time, IBM Plex Sans Arabic.

BEATS (kind → use): stat (one hero number; visual none|sphere|globe), globe (topic is the world/a planet/a body),
sphere (all of a quantity, 100%), grid (one percentage out of 100 → N units light up; rest = label for the remainder),
bar (2–4 shares of a whole, values in %), ring (the same split bent into a donut + legend; place it right AFTER a bar),
symbol (one symbol — drop, coin, person, leaf, house, bolt, heart, star, phone, car, box, clock, tooth — with a number and
an optional equation line), compare (2–4 amounts as log-scaled spheres, largest first), versus (A vs B bars), timeline
(two years), headline (a line without figures; key = the one word to colour cyan), source (final beat: the source line).

RULES: every number must come from the transcript (never invent figures); "at" is the word id where that number is
said; "from" is the first word id of the beat; beats in time order; one beat per sentence; end with source when a source
is given. Labels/eyebrows are short (≤ 6 words) taken from the sentence, same language and spelling.`;

export const infographicDirector: DirectorSpec = { system, toolSchema: z.toJSONSchema(InfographicPlanSchema, { target: 'draft-7', io: 'input' }) as Record<string, unknown> };
