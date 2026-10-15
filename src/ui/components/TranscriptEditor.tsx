import { useState } from 'react';
import type { Transcript } from '@/lib/schema/transcript';
import { realign } from '@/lib/timing/realign';
import { Button, Panel, Textarea, cx } from './ui';
import { getKeys } from '@/lib/providers/keys';
import { claudeFixTranscript } from '@/lib/providers/claude';

/** Editable transcript: edits keep the original timing; low-confidence words are highlighted. */
export const TranscriptEditor = ({ transcript, vocabulary, idea, projectId, onApply }: { transcript: Transcript; vocabulary: string; idea: string; projectId: string; onApply: (t: Transcript) => void }) => {
  const [text, setText] = useState(transcript.words.map((w) => w.text).join(' '));
  const [fixes, setFixes] = useState<Array<{ id: string; text: string }> | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const dirty = text.trim() !== transcript.words.map((w) => w.text).join(' ');
  const apply = (t: string) => {
    const words = realign(transcript.words, t);
    if (words.length === 0) return;
    onApply({ ...transcript, words });
    setMsg('تم الحفظ — التوقيت محفوظ لكل كلمة.');
  };
  const aiFix = async () => {
    const k = await getKeys();
    if (!k.anthropic) {
      setMsg('أضف مفتاح Claude في الإعدادات لاستعمال التصحيح الذكي.');
      return;
    }
    setBusy(true);
    try {
      setFixes(await claudeFixTranscript(k.anthropic, transcript, vocabulary, idea, projectId));
    } catch (e) {
      setMsg(String(e));
    } finally {
      setBusy(false);
    }
  };
  const low = transcript.words.filter((w) => w.confidence < 0.6);
  return (
    <div className="space-y-3">
      <Panel>
        <div className="mb-2 text-[13px] text-muted">{low.length ? `الكلمات الملوّنة غير مؤكدة (${low.length}) — راجعها.` : 'كل كلمة مربوطة بتوقيتها. صحّح الإملاء فقط.'}</div>
        <div className="flex flex-wrap gap-1.5 leading-8" dir="rtl">
          {transcript.words.map((w) => (
            <span key={w.id} className={cx('rounded-md px-1.5', w.confidence < 0.6 ? 'bg-rose/20 text-rose' : 'bg-raised')} title={`${(w.startMs / 1000).toFixed(2)}s`}>{w.text}</span>
          ))}
        </div>
      </Panel>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-40" dir="rtl" aria-label="النص المفرّغ" />
      <div className="flex flex-wrap gap-2">
        <Button disabled={!dirty} onClick={() => apply(text)}>احفظ التعديلات</Button>
        <Button variant="soft" disabled={busy} onClick={aiFix}>{busy ? 'جارٍ التصحيح…' : 'صحّح بالذكاء الاصطناعي'}</Button>
      </div>
      {msg && <p className="text-[14px] text-mint">{msg}</p>}
      {fixes && (
        <Panel className="space-y-2">
          <div className="font-bold">اقتراحات التصحيح ({fixes.length})</div>
          {fixes.length === 0 && <p className="text-muted">لا توجد أخطاء واضحة.</p>}
          {fixes.map((f) => {
            const w = transcript.words.find((x) => x.id === f.id);
            return <div key={f.id} className="text-[15px]"><span className="text-rose line-through">{w?.text}</span> ← <span className="text-mint">{f.text}</span></div>;
          })}
          {fixes.length > 0 && (
            <Button onClick={() => {
              const words = transcript.words.map((w) => { const f = fixes.find((x) => x.id === w.id); return f ? { ...w, text: f.text } : w; });
              onApply({ ...transcript, words });
              setText(words.map((w) => w.text).join(' '));
              setFixes(null);
              setMsg('تم تطبيق التصحيحات.');
            }}>طبّق الكل</Button>
          )}
        </Panel>
      )}
    </div>
  );
};
