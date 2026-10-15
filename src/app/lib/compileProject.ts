import type { Project } from '@/data/project';
import { assetUrl, loadAssetUrls } from '@/data/db';
import { getSettings } from '@/data/settings';
import type { Plan } from '@/engine/schema';
import { build } from '../build';

export const assetIds = (p: Project) => {
  const ids = new Set<string>();
  if (p.voiceAsset) ids.add(p.voiceAsset);
  if (p.videoAsset) ids.add(p.videoAsset);
  p.media.forEach((m) => ids.add(m.assetId));
  const walk = (plan?: Plan) => plan?.scenes.forEach((s) => {
    if (s.bg.image?.assetId) ids.add(s.bg.image.assetId);
    s.layers.forEach((l) => l.type === 'image' && l.src.assetId && ids.add(l.src.assetId));
  });
  walk(p.plan);
  return ids;
};

export const compileProject = async (p: Project, demoAssets?: { voice?: string; video?: string }) => {
  if (!p.plan || !p.transcript) return null;
  await loadAssetUrls(assetIds(p));
  const s = getSettings();
  const o = p.options;
  const endCard = o.endCard && (o.cta || o.handle || o.phone) ? { enabled: true, cta: o.cta || 'تابعنا', handle: o.handle, phone: o.phone, seconds: 2.4 } : undefined;
  return build({
    plan: p.plan,
    transcript: p.transcript,
    mode: p.mode,
    aspect: o.aspect,
    voice: demoAssets?.voice ?? (p.voiceAsset ? assetUrl(p.voiceAsset) : null),
    video: demoAssets?.video ?? (p.videoAsset ? assetUrl(p.videoAsset) : null),
    music: o.music,
    musicVolume: o.musicVolume,
    sfx: o.sfx,
    sfxLevel: s.defaults.sfxLevel,
    captions: o.captions,
    digits: o.digits,
    endCard,
    assets: assetUrl,
    userMedia: p.media.map((m) => assetUrl(m.assetId) ?? ''),
    safe: s.safeOverlay,
  });
};
