/**
 * Studio steps 5–7: the script & scene plan (editable), the live preview with global and per-scene edits
 * (undo/redo), and the export (MP4 in the browser, SRT, cover, hook variants).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { RassamVideo, buildCtx } from '@/engine/Composition';
import { setAtPath } from '@/engine/plan';
import { TimingIndex, type Timing } from '@/engine/timing';
import { DIMS, type VideoInput } from '@/engine/types';
import { getBrandKit, type BrandKit } from '@/data/db';
import { mediaDuration, useAssetUrls } from '@/data/assets';
import { useSettings } from '@/data/settings';
import { STYLES, type StyleId } from '@/styles/catalog';
import { getLoadedStyle, loadStyle } from '@/styles/registry';
import { hasClaude } from '@/lib/providers/claude';
import { claudePlan } from '@/lib/director';
import { Icon } from '@/ui/Icon';
import { Badge, Button, cx, Field, Segmented, Slider, Textarea, Toggle } from '@/ui/kit';
import { brandOf, buildTiming, localPlan, pickStyle, productOf, toInput } from './produce';
import type { Wizard } from './state';

type Prod = NonNullable<Wizard['production']>;
type SetW = (w: Wizard) => void;

const hashOf = (w: Wizard, voiceDur: number) => `${w.content.script.trim()}|${w.settings.pace}|${w.style}|${w.content.voiceAsset ?? ''}|${w.content.videoAsset ?? ''}|${voiceDur.toFixed(1)}|${w.goal}`;

/** brand kit once */
const useBrand = () => {
  const [b, setB] = useState<BrandKit | null>(null);
  useEffect(() => {
    getBrandKit().then(setB, () => setB(null));
  }, []);
  return b;
};

/** (re)build timing + plan whenever the script/pace/voice changed; keeps user edits otherwise */
export const useProduction = (w: Wizard, setW: SetW) => {
  const brand = useBrand();
  const assets = useAssetUrls([w.content.voiceAsset, w.content.videoAsset, ...w.content.product.photos]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ready, setReady] = useState(false);
  const wRef = useRef(w);
  wRef.current = w;

  const voiceDuration = useCallback(async () => {
    const id = w.content.voiceAsset || w.content.videoAsset;
    const url = id ? assets[id] : null;
    return url ? mediaDuration(url, w.content.voiceAsset ? 'audio' : 'video') : 0;
  }, [w.content.voiceAsset, w.content.videoAsset, assets]);

  const rebuild = useCallback(
    async (opts: { seed?: number; ai?: boolean } = {}) => {
      const cur = wRef.current;
      if (!cur.content.script.trim()) {
        setErr('اكتب السكريبت أولًا في خطوة «المحتوى».');
        return;
      }
      setBusy(true);
      setErr('');
      try {
        const vd = await voiceDuration();
        const media = cur.content.voiceAsset || cur.content.videoAsset;
        const timing = buildTiming(cur, media && vd ? { asset: media, duration: vd } : null);
        const pick = cur.style && cur.style !== 'auto' ? { id: cur.style, reason: '' } : pickStyle(cur);
        const styleId = (getLoadedStyle(pick.id) || (await loadStyle(pick.id).catch(() => null)) ? pick.id : 'product') as StyleId;
        const style = await loadStyle(styleId);
        const seed = opts.seed ?? cur.production?.seed ?? 1;
        const b = brandOf(brand);
        let res: { plan: unknown; issues: string[] };
        let source: Prod['source'] = 'local';
        if (opts.ai && hasClaude()) {
          res = await claudePlan(style, { timing, goal: cur.goal ?? 'free', aspect: cur.settings.aspect, topic: cur.content.topic || cur.content.product.name, product: productOf(cur), brandName: b?.name ?? '', seed });
          source = 'claude';
        } else res = await localPlan(styleId, cur, timing, seed, b);
        setW({ ...wRef.current, production: { styleId, reason: pick.reason, seed, source, scriptHash: hashOf(cur, vd), timing, plan: res.plan, issues: res.issues, hooks: cur.production?.hooks ?? [] } });
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    [brand, setW, voiceDuration],
  );

  // first build / stale build
  useEffect(() => {
    let live = true;
    (async () => {
      const vd = await voiceDuration();
      const p = wRef.current.production;
      if (p) await loadStyle(p.styleId).catch(() => undefined);
      if (!live) return;
      if (!p || p.scriptHash !== hashOf(wRef.current, vd)) await rebuild();
      if (live) setReady(true);
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w.content.script, w.settings.pace, w.style, w.content.voiceAsset, w.content.videoAsset, assets]);

  const settings = useSettings();
  const input = useMemo<VideoInput | null>(() => {
    const p = w.production;
    if (!p || !ready || !getLoadedStyle(p.styleId)) return null;
    return toInput(w, { styleId: p.styleId, timing: p.timing as Timing, plan: p.plan }, assets, brandOf(brand), settings.digits);
  }, [w, ready, assets, brand, settings.digits]);

  return { input, busy, err, rebuild, brand };
};

/* ─────────────────────────── step 5: script & scenes ─────────────────────────── */

export const ScriptScenes = ({ w, setW }: { w: Wizard; setW: SetW }) => {
  const { input, busy, err, rebuild } = useProduction(w, setW);
  const p = w.production;
  const style = p ? getLoadedStyle(p.styleId) : undefined;
  const T = useMemo(() => (p ? new TimingIndex(p.timing as Timing) : null), [p]);
  const scenes = useMemo(() => (style && p ? style.scenes(p.plan as never) : []), [style, p]);
  const setText = (path: string, value: string) => p && setW({ ...w, production: { ...p, plan: setAtPath(p.plan, path, value) } });
  return (
    <div className="flex flex-col gap-6">
      <div className="surface flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] p-4">
        <Icon name="palette" size={22} className="text-[var(--color-spark)]" />
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold">{p ? STYLES[p.styleId].nameAr : '...'}</div>
          {p?.reason && <div className="text-[0.85rem] text-[var(--text-2)]">{p.reason}</div>}
        </div>
        <Badge tone={p?.source === 'claude' ? 'spark' : 'neutral'}>{p?.source === 'claude' ? 'خطة Claude' : 'خطة محلية'}</Badge>
        <Button size="sm" icon="redo" disabled={busy} onClick={() => rebuild({ seed: (p?.seed ?? 1) + 1 })}>
          خطة أخرى
        </Button>
        {hasClaude() && (
          <Button size="sm" variant="spark" icon="wand" disabled={busy} onClick={() => rebuild({ ai: true })}>
            خطّط بالذكاء
          </Button>
        )}
      </div>
      {busy && <p className="text-[var(--text-2)]">نخطط المشاهد على كلامك...</p>}
      {err && <p className="rounded-[var(--radius-md)] border border-[rgb(255_107_94/0.5)] p-3 text-[var(--color-danger)]">{err}</p>}

      {T && (
        <section>
          <h2 className="mb-3 font-display text-[1.15rem] font-bold">السكريبت سطرًا بسطر</h2>
          <ol className="flex flex-col gap-1.5">
            {T.lines.map((l, i) => (
              <li key={i} className="flex items-baseline gap-3 rounded-[var(--radius-sm)] px-2 py-1.5 odd:bg-[var(--surface)]">
                <span className="num w-6 shrink-0 text-[var(--text-3)]">{i + 1}</span>
                <span className="flex-1 leading-relaxed">{l.text}</span>
                <span className="num shrink-0 text-[0.8rem] text-[var(--text-3)]">{l.start.toFixed(1)}ث</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {T && scenes.length > 0 && (
        <section>
          <h2 className="mb-1 font-display text-[1.15rem] font-bold">خطة المشاهد</h2>
          <p className="mb-3 text-[0.85rem] text-[var(--text-2)]">كل مشهد يبدأ على كلمة من كلامك. عدّل النصوص هنا قبل المعاينة.</p>
          <div className="flex flex-col gap-3">
            {scenes.map((s, i) => {
              const word = T.byId(s.at);
              const li = T.lines.indexOf(T.lineOf(s.at)) + 1;
              return (
                <div key={i} className="card rounded-[var(--radius-lg)] p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="num grid size-7 place-items-center rounded-full bg-[var(--surface-3)] text-[0.8rem] font-bold">{i + 1}</span>
                    <span className="font-display font-bold">{s.label}</span>
                    <span className="text-[0.82rem] text-[var(--text-3)]">
                      السطر <span className="num">{li}</span> · على كلمة «{word.w}» · <span className="num">{word.start.toFixed(1)}</span>ث
                    </span>
                  </div>
                  {s.texts.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {s.texts.map((t) => (
                        <label key={t.path} className="flex flex-col gap-1 text-[0.8rem] text-[var(--text-3)]">
                          {t.label}
                          <input className="h-10 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-3 text-[0.95rem] text-[var(--text)]" value={t.value} onChange={(e) => setText(t.path, e.target.value)} />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
      {input && <p className="text-[0.85rem] text-[var(--text-3)]">المدة: <span className="num">{(buildCtx(input).durationInFrames / 30).toFixed(1)}</span> ثانية</p>}
    </div>
  );
};

/* ─────────────────────────── step 6: preview & edit ─────────────────────────── */

const ACCENTS: Array<{ id: string; c: string; ar: string }> = [
  { id: 'violet', c: '#8B5CFF', ar: 'بنفسجي' },
  { id: 'orange', c: '#FF6A1A', ar: 'برتقالي' },
  { id: 'blue', c: '#2F5BFF', ar: 'أزرق' },
  { id: 'pink', c: '#D946EF', ar: 'وردي' },
];

export const usePlayerSize = (aspect: VideoInput['aspect']) => {
  const { w, h } = DIMS[aspect];
  return { w, h, style: { width: '100%', maxWidth: aspect === '16:9' ? 900 : aspect === '9:16' ? 380 : 480, aspectRatio: `${w}/${h}` } };
};

export const Preview = ({ w, setW }: { w: Wizard; setW: SetW }) => {
  const { input, busy, err } = useProduction(w, setW);
  const player = useRef<PlayerRef>(null);
  const hist = useRef<{ past: unknown[]; future: unknown[] }>({ past: [], future: [] });
  const [, force] = useState(0);
  const p = w.production;
  const style = p ? getLoadedStyle(p.styleId) : undefined;
  const scenes = useMemo(() => (style && p ? style.scenes(p.plan as never) : []), [style, p]);
  const T = useMemo(() => (p ? new TimingIndex(p.timing as Timing) : null), [p]);
  const size = usePlayerSize(w.settings.aspect);
  const editPlan = (plan: unknown) => {
    if (!p) return;
    hist.current.past.push(p.plan);
    hist.current.future = [];
    setW({ ...w, production: { ...p, plan } });
    force((x) => x + 1);
  };
  const undo = () => {
    if (!p || !hist.current.past.length) return;
    hist.current.future.push(p.plan);
    setW({ ...w, production: { ...p, plan: hist.current.past.pop() } });
    force((x) => x + 1);
  };
  const redo = () => {
    if (!p || !hist.current.future.length) return;
    hist.current.past.push(p.plan);
    setW({ ...w, production: { ...p, plan: hist.current.future.pop() } });
    force((x) => x + 1);
  };
  const ctx = input ? buildCtx(input) : null;
  const accent = (p?.plan as { accent?: string } | undefined)?.accent;
  const setS = (patch: Partial<Wizard['settings']>) => setW({ ...w, settings: { ...w.settings, ...patch } });
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col items-center gap-3">
        {input && ctx ? (
          <div style={size.style} className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] shadow-[var(--shadow-e3)]">
            <Player
              ref={player}
              component={RassamVideo}
              inputProps={{ input }}
              durationInFrames={ctx.durationInFrames}
              fps={ctx.fps}
              compositionWidth={size.w}
              compositionHeight={size.h}
              style={{ width: '100%', height: '100%' }}
              controls
              loop
              acknowledgeRemotionLicense
            />
          </div>
        ) : (
          <div style={size.style} className="grid place-items-center rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] text-[var(--text-2)]">
            {busy ? 'نحضّر المعاينة...' : err || '...'}
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" icon="undo" disabled={!hist.current.past.length} onClick={undo}>
            تراجع
          </Button>
          <Button size="sm" variant="ghost" icon="redo" disabled={!hist.current.future.length} onClick={redo}>
            إعادة
          </Button>
        </div>
      </div>
      <aside className="flex flex-col gap-5">
        {accent && (
          <Field label="لون التمييز">
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button key={a.id} type="button" aria-label={a.ar} aria-pressed={accent === a.id} onClick={() => p && editPlan({ ...(p.plan as object), accent: a.id })} className={cx('size-10 rounded-full border-2 transition', accent === a.id ? 'border-[var(--text)] scale-110' : 'border-transparent')} style={{ background: a.c }} />
              ))}
            </div>
          </Field>
        )}
        <Field label="المقاس">
          <Segmented value={w.settings.aspect} onChange={(aspect) => setS({ aspect })} options={(['9:16', '4:5', '1:1', '16:9'] as const).map((a) => ({ value: a, label: <span className="num">{a}</span> }))} />
        </Field>
        <Field label="الإيقاع">
          <Segmented
            value={w.settings.pace}
            onChange={(pace) => setS({ pace })}
            options={[
              { value: 'calm', label: 'هادئ' },
              { value: 'normal', label: 'عادي' },
              { value: 'fast', label: 'سريع' },
            ]}
          />
        </Field>
        <Field label="الموسيقى">
          <Segmented
            value={w.settings.music}
            onChange={(music) => setS({ music })}
            options={[
              { value: 'tech', label: 'تقنية' },
              { value: 'calm', label: 'هادئة' },
              { value: 'bright', label: 'مبهجة' },
              { value: 'none', label: 'بدون' },
            ]}
          />
        </Field>
        <Slider label="مستوى الموسيقى" value={Math.round(w.settings.musicVolume * 100)} min={0} max={100} onChange={(v) => setS({ musicVolume: v / 100 })} format={(v) => `${v}%`} />
        <Toggle label="المؤثرات الصوتية" checked={w.settings.sfx} onChange={(sfx) => setS({ sfx })} />
        {T && scenes.length > 0 && (
          <div>
            <h3 className="mb-2 font-display font-bold">المشاهد</h3>
            <ol className="flex max-h-[420px] flex-col gap-2 overflow-auto pe-1">
              {scenes.map((s, i) => (
                <li key={i} className="card rounded-[var(--radius-md)] p-3">
                  <button type="button" className="mb-1 flex w-full items-center gap-2 text-right" onClick={() => player.current?.seekTo(Math.max(0, T.toFrame(T.cutBefore(s.at, 0.1)) + 1))}>
                    <Icon name="play" size={16} className="text-[var(--color-spark)]" />
                    <span className="font-semibold">{i + 1}. {s.label}</span>
                    <span className="num ms-auto text-[0.78rem] text-[var(--text-3)]">{T.byId(s.at).start.toFixed(1)}ث</span>
                  </button>
                  {s.texts.map((t) => (
                    <input key={t.path} aria-label={t.label} className="mt-1 h-9 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-2 text-[0.9rem]" value={t.value} onChange={(e) => p && editPlan(setAtPath(p.plan, t.path, e.target.value))} />
                  ))}
                </li>
              ))}
            </ol>
          </div>
        )}
      </aside>
    </div>
  );
};

/* ─────────────────────────── step 7: export ─────────────────────────── */

export const Export = ({ w, setW, name }: { w: Wizard; setW: SetW; name: string }) => {
  const { input } = useProduction(w, setW);
  const [quality, setQuality] = useState<'720p' | '1080p'>('720p');
  const [prog, setProg] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const abort = useRef<AbortController | null>(null);
  const file = (name || 'rassam').replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'rassam';
  const run = async () => {
    if (!input) return;
    const { exportVideo, download } = await import('@/lib/exporter');
    abort.current = new AbortController();
    setProg(0);
    setMsg('');
    try {
      const out = await exportVideo(input, { quality, onProgress: setProg, signal: abort.current.signal });
      download(out.blob, `${file}.${out.ext}`);
      setMsg(out.ext === 'mp4' ? 'تم! الفيديو MP4 في التنزيلات.' : 'تم! جهازك لا يدعم MP4 فحفظناه WebM.');
    } catch (e) {
      setMsg(abort.current?.signal.aborted ? 'أُلغي التصدير.' : `تعذّر التصدير: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setProg(null);
    }
  };
  const srt = async () => {
    if (!input) return;
    const { toSrt, download } = await import('@/lib/exporter');
    download(new Blob([toSrt(input.timing)], { type: 'text/plain' }), `${file}.srt`);
  };
  const cover = async () => {
    if (!input) return;
    const { exportStill, download } = await import('@/lib/exporter');
    const ctx = buildCtx(input);
    download(await exportStill(input, Math.min(ctx.durationInFrames - 1, Math.round(ctx.fps * 1.5))), `${file}-cover.jpg`);
  };
  const hooks = useMemo(() => hookVariants(w), [w]);
  const applyHook = (h: string) => {
    const lines = w.content.script.split('\n');
    lines[0] = h;
    setW({ ...w, content: { ...w.content, script: lines.join('\n') }, step: 6 });
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="surface flex flex-col gap-4 rounded-[var(--radius-lg)] p-5">
        <h2 className="font-display text-[1.15rem] font-bold">تنزيل الفيديو</h2>
        <Segmented
          label="الجودة"
          value={quality}
          onChange={setQuality}
          options={[
            { value: '720p', label: '720p سريع' },
            { value: '1080p', label: '1080p عالي' },
          ]}
        />
        {prog === null ? (
          <Button variant="spark" size="lg" icon="download" disabled={!input} onClick={run}>
            صدّر الفيديو
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-3)]">
              <div className="h-full bg-[var(--color-spark)] transition-[width]" style={{ width: `${Math.round(prog * 100)}%` }} />
            </div>
            <div className="flex items-center justify-between text-[0.9rem]">
              <span className="num">{Math.round(prog * 100)}%</span>
              <Button size="sm" variant="ghost" icon="x" onClick={() => abort.current?.abort()}>
                إلغاء
              </Button>
            </div>
            <p className="text-[0.82rem] text-[var(--text-3)]">التصدير يتم في هاتفك. اترك الصفحة مفتوحة حتى ينتهي.</p>
          </div>
        )}
        {msg && <p className="text-[0.95rem]">{msg}</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button icon="text" disabled={!input} onClick={srt}>
          ملف الترجمة SRT
        </Button>
        <Button icon="camera" disabled={!input} onClick={cover}>
          صورة الغلاف
        </Button>
      </div>
      <section className="surface rounded-[var(--radius-lg)] p-5">
        <h2 className="mb-1 font-display text-[1.15rem] font-bold">3 نسخ للإعلان</h2>
        <p className="mb-3 text-[0.85rem] text-[var(--text-2)]">نفس الفيديو ببداية مختلفة لتجرّب أيها يجلب أكثر. اختر نسخة، راجعها في المعاينة، ثم صدّرها.</p>
        <div className="flex flex-col gap-2">
          {hooks.map((h, i) => (
            <div key={i} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--line)] p-3">
              <span className="num font-bold text-[var(--color-spark)]">{i + 1}</span>
              <span className="flex-1">{h}</span>
              <Button size="sm" onClick={() => applyHook(h)}>
                استعمل
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

/** three alternative opening lines (Claude's when available, else question / bold claim / number patterns) */
export const hookVariants = (w: Wizard): string[] => {
  if (w.production?.hooks.length) return w.production.hooks.slice(0, 3);
  const first = w.content.script.split('\n')[0]?.trim() ?? '';
  const subj = w.content.product.name || w.content.topic || first.split(' ').slice(0, 3).join(' ');
  const lang = /[a-z]/i.test(first) && !/[؀-ۿ]/.test(first) ? 'fr' : 'ar';
  const out =
    lang === 'ar'
      ? [`حبس! قبل ما تشري ${subj} شوف هادي`, `${subj}: الحاجة اللي ما حد قالهالك`, `3 أسباب تخليك تختار ${subj}`]
      : [`Stop ! Avant d’acheter ${subj}, regardez ça`, `${subj} : ce que personne ne vous dit`, `3 raisons de choisir ${subj}`];
  return out.filter((h) => h !== first);
};

export const ScriptEditorMini = ({ w, setW }: { w: Wizard; setW: SetW }) => (
  <Textarea rows={6} value={w.content.script} onChange={(e) => setW({ ...w, content: { ...w.content, script: e.target.value } })} />
);
