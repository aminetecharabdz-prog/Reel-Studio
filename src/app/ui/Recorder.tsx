import { useEffect, useRef, useState } from 'react';
import { Btn, I } from './kit';

/** Voice recorder (MediaRecorder) with a live level meter. */
export const Recorder = ({ onDone }: { onDone: (b: Blob) => void }) => {
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [sec, setSec] = useState(0);
  const [lvl, setLvl] = useState<number[]>(Array(24).fill(0.1));
  const [err, setErr] = useState('');
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const start = async () => {
    setErr('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        cancelAnimationFrame(raf.current);
        onDone(new Blob(chunks, { type: mr.mimeType || 'audio/webm' }));
      };
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      an.fftSize = 64;
      ctx.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.frequencyBinCount);
      const t0 = performance.now();
      const tick = () => {
        an.getByteFrequencyData(buf);
        setLvl(Array.from({ length: 24 }, (_, i) => 0.08 + (buf[i % buf.length]! / 255) * 0.92));
        setSec(Math.floor((performance.now() - t0) / 1000));
        raf.current = requestAnimationFrame(tick);
      };
      tick();
      mr.start();
      setRec(mr);
    } catch {
      setErr('ما قدرناش نفتحو الميكروفون. اسمح للمتصفح باستعمال الميكروفون.');
    }
  };
  const stop = () => {
    rec?.stop();
    setRec(null);
  };
  return (
    <div className="rounded-2xl border border-line bg-ink p-4">
      <div className="flex h-14 items-center justify-center gap-[3px]">
        {lvl.map((v, i) => <span key={i} className="w-1.5 rounded-full grad-bg" style={{ height: `${v * 100}%`, opacity: rec ? 1 : 0.35 }} />)}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-display text-[15px] tabular-nums text-muted">{String(Math.floor(sec / 60)).padStart(2, '0')}:{String(sec % 60).padStart(2, '0')}</span>
        {rec ? <Btn kind="danger" onClick={stop}>إيقاف وحفظ</Btn> : <Btn onClick={start} icon={<I.mic size={18} />}>سجّل صوتك</Btn>}
      </div>
      {err && <p className="mt-2 text-[13px] text-coral">{err}</p>}
    </div>
  );
};
