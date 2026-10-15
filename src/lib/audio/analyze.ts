/** Web Audio analysis: decode, waveform peaks, voiced segments, silence ranges (mode C), loudness. */
export type AudioInfo = { durationMs: number; peaks: number[]; sampleRate: number; voiced: Array<[number, number]>; peakDb: number; rmsDb: number };

export const decodeAudio = async (blob: Blob): Promise<AudioBuffer> => {
  const ctx = new OfflineAudioContext(1, 1, 44100);
  return ctx.decodeAudioData(await blob.arrayBuffer());
};

export const analyzeBuffer = (buf: AudioBuffer, opts: { minSilenceMs?: number; threshold?: number } = {}): AudioInfo => {
  const data = buf.getChannelData(0);
  const sr = buf.sampleRate;
  const win = Math.round(sr * 0.01); // 10 ms
  const frames = Math.floor(data.length / win);
  const rms = new Float32Array(frames);
  let peak = 0;
  let sumSq = 0;
  for (let f = 0; f < frames; f++) {
    let s = 0;
    for (let i = f * win; i < (f + 1) * win; i++) {
      const v = data[i]!;
      s += v * v;
      const a = Math.abs(v);
      if (a > peak) peak = a;
    }
    sumSq += s;
    rms[f] = Math.sqrt(s / win);
  }
  // adaptive threshold: 30% between noise floor (10th percentile) and speech level (90th)
  const sorted = Array.from(rms).sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.1)] ?? 0;
  const loud = sorted[Math.floor(sorted.length * 0.9)] ?? 0.1;
  const thr = opts.threshold ?? floor + (loud - floor) * 0.18;
  const minSil = (opts.minSilenceMs ?? 350) / 10;
  const voiced: Array<[number, number]> = [];
  let start = -1;
  let quiet = 0;
  for (let f = 0; f < frames; f++) {
    if (rms[f]! > thr) {
      if (start < 0) start = f;
      quiet = 0;
    } else if (start >= 0) {
      quiet++;
      if (quiet >= minSil) {
        voiced.push([start * 10, (f - quiet + 1) * 10]);
        start = -1;
        quiet = 0;
      }
    }
  }
  if (start >= 0) voiced.push([start * 10, frames * 10]);
  const bins = 600;
  const peaks: number[] = [];
  const per = Math.max(1, Math.floor(frames / bins));
  for (let b = 0; b < frames; b += per) {
    let m = 0;
    for (let k = b; k < Math.min(frames, b + per); k++) m = Math.max(m, rms[k]!);
    peaks.push(m);
  }
  const maxPeak = Math.max(...peaks, 1e-6);
  return {
    durationMs: Math.round(buf.duration * 1000),
    peaks: peaks.map((p) => +(p / maxPeak).toFixed(3)),
    sampleRate: sr,
    voiced,
    peakDb: 20 * Math.log10(peak || 1e-6),
    rmsDb: 10 * Math.log10(sumSq / Math.max(1, data.length) || 1e-9),
  };
};

/** Silence ranges to cut (mode C), keeping 120 ms of breath on each side. */
export const silenceRanges = (voiced: Array<[number, number]>, durationMs: number, minMs = 350) => {
  const out: Array<{ startMs: number; endMs: number }> = [];
  let prevEnd = 0;
  for (const [s, e] of voiced) {
    if (s - prevEnd >= minMs) out.push({ startMs: prevEnd + 120, endMs: s - 120 });
    prevEnd = e;
  }
  if (durationMs - prevEnd >= minMs) out.push({ startMs: prevEnd + 120, endMs: durationMs });
  return out.filter((r) => r.endMs - r.startMs >= 150);
};
