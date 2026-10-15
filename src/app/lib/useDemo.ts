import { useEffect, useState } from 'react';
import type { Compiled } from '@/engine/compile';
import { loadDemo, type Demo } from '../demos';
import { build } from '../build';
import { publicUrl } from '@/engine/assets';

export const compileDemo = (d: Demo, opts: { captions?: boolean } = {}) =>
  build({ plan: d.plan, transcript: d.transcript, mode: d.mode, music: d.music, voice: d.voice ? publicUrl(d.voice) : null, video: d.video ? publicUrl(d.video) : null, captions: opts.captions ?? d.mode === 'talking' });

export const useDemo = (id: string) => {
  const [s, setS] = useState<{ d: Demo; c: Compiled } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadDemo(id)
      .then((d) => alive && setS({ d, c: compileDemo(d) }))
      .catch((e) => alive && setErr(String(e)));
    return () => {
      alive = false;
    };
  }, [id]);
  return { ...s, err };
};
