import type { FC } from 'react';
import type { z } from 'zod';
import type { Aspect, PlanInput, StyleId } from './types';

export type StyleMeta = {
  id: StyleId;
  nameAr: string;
  nameEn: string;
  /** one-line use case (Arabic) */
  useAr: string;
  defaultAspect: Aspect;
  /** passed the MISSION_V3 §5 quality gate → shown in the gallery */
  ready: boolean;
  /** hints for the automatic style picker */
  keywords: string[];
  swatch: [string, string, string];
};

export type DirectorSpec = {
  /** system prompt: style bible + vocabulary + rules */
  system: string;
  toolName: string;
  toolDescription: string;
};

export type StyleModule<P = unknown> = {
  meta: StyleMeta;
  schema: z.ZodType<P>;
  Video: FC<{ plan: P }>;
  loadFonts: () => Promise<void>;
  /** word id where each scene starts (sorted) — used for scene windows, editing and QA */
  sceneStarts: (plan: P) => string[];
  /** no-key planner that still produces a good video */
  localPlan: (input: PlanInput) => P;
  director: DirectorSpec;
  /** repair a parsed plan against the transcript (unknown word ids, ordering…); returns issues */
  sanitize: (plan: P, wordIds: string[]) => { plan: P; issues: string[] };
  /** editable text fields of a scene (for the editor) */
  texts: (plan: P) => Array<{ scene: number; path: string; label: string; value: string }>;
  setText: (plan: P, path: string, value: string) => P;
  tailSeconds: number;
};
