import { useEffect, useState } from 'react';
import { getKeys } from '@/lib/providers/keys';
import { navigate } from '../router';

/** QUALITY_BAR: without an image key the reel uses 3D objects + drawn illustrations; say so and show how to unlock full quality. */
export const ImageKeyNotice = () => {
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    getKeys().then((k) => setMissing(!k.imageProvider || k.imageProvider === 'none' || !(k.gemini || k.openai || k.fal))).catch(() => undefined);
  }, []);
  if (!missing) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-[14px] leading-relaxed" data-testid="image-key-notice">
      <b>الجودة الكاملة تحتاج مفتاح الصور.</b> الآن الفيديو مبني برسومات ثلاثية الأبعاد ورسوم متحركة جاهزة. أضف مفتاح Gemini
      ليولّد صورًا خاصة لكل مشهد (شخصية ثابتة، منتجك في مواقف حقيقية).{' '}
      <button className="font-bold text-lilac underline" onClick={() => navigate('/settings')}>أضف المفتاح</button>
    </div>
  );
};
