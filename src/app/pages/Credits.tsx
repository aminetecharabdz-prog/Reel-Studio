import { useEffect, useState } from 'react';
import { Shell } from '../ui/Shell';
import { publicUrl } from '@/engine/assets';

type Credit = { name: string; author: string; license: string; source: string };
export const Credits = () => {
  const [rows, setRows] = useState<Credit[]>([]);
  useEffect(() => { fetch(publicUrl('art/photo/credits.json')).then((r) => (r.ok ? r.json() : [])).then(setRows).catch(() => setRows([])); }, []);
  return (
    <Shell active="">
      <div className="mx-auto max-w-2xl space-y-4 pt-7 pb-12 text-[14px] leading-relaxed text-muted">
        <h1 className="font-ar text-[28px] font-black text-text">الحقوق</h1>
        <p>الخطوط: Google Fonts / Fontsource (رخصة OFL). الأشكال ثلاثية الأبعاد: Microsoft Fluent Emoji (MIT). المحرك: Remotion.</p>
        <p>صور المكتبة (رخص حرة CC0 / CC BY / CC BY-SA):</p>
        <ul className="space-y-1.5" dir="ltr">
          {rows.map((r) => <li key={r.name}><a className="underline" href={r.source} target="_blank" rel="noreferrer">{r.name}</a> — <span dangerouslySetInnerHTML={{ __html: r.author.replace(/<[^>]+>/g, '') }} /> ({r.license})</li>)}
        </ul>
      </div>
    </Shell>
  );
};
