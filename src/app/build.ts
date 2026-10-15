/** Shared "compile a project/demo for the player" helper. */
import { compile, type CompileOpts, type Compiled } from '@/engine/compile';
import { makeResolver } from '@/engine/assets';
import { musicUrl, sfxUrl } from '@/engine/audio';
import type { Plan, Transcript } from '@/engine/schema';

export type BuildIn = {
  plan: Plan;
  transcript: Transcript;
  mode: Compiled['mode'];
  aspect?: CompileOpts['aspect'];
  voice?: string | null;
  video?: string | null;
  music?: string | null;
  musicVolume?: number;
  sfx?: boolean;
  sfxLevel?: number;
  captions?: boolean;
  digits?: 'western' | 'eastern';
  endCard?: CompileOpts['endCard'];
  cuts?: CompileOpts['cuts'];
  assets?: (id: string) => string | null;
  userMedia?: string[];
  safe?: boolean;
};

export const build = (b: BuildIn): Compiled =>
  compile({
    plan: b.plan,
    transcript: b.transcript,
    mode: b.mode,
    aspect: b.aspect ?? '9:16',
    fps: 30,
    voice: b.voice ?? null,
    video: b.video ?? null,
    music: musicUrl(b.music === undefined || b.music === 'auto' ? b.plan.style.music : b.music),
    musicVolume: b.musicVolume ?? 0.5,
    sfx: { on: b.sfx ?? true, intensity: b.sfxLevel ?? 1, src: sfxUrl },
    captionsOn: b.captions ?? true,
    digits: b.digits ?? 'western',
    endCard: b.endCard,
    cuts: b.cuts,
    resolve: makeResolver(b.assets ?? (() => null), b.userMedia ?? []),
    showSafe: b.safe,
  });
