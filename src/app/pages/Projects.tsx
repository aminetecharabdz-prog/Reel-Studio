import { useEffect, useState } from 'react';
import { Shell } from '../ui/Shell';
import { Btn, I } from '../ui/kit';
import { deleteProject, listProjects } from '@/data/db';
import type { Project } from '@/data/project';

export const Projects = () => {
  const [list, setList] = useState<Project[] | null>(null);
  const load = () => listProjects().then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);
  return (
    <Shell active="projects">
      <div className="flex items-center justify-between pt-7">
        <h1 className="font-ar text-[30px] font-black">مشاريعي</h1>
        <a href="#/new"><Btn icon={<I.plus size={18} />}>جديد</Btn></a>
      </div>
      {list && list.length === 0 && (
        <div className="mt-10 rounded-[28px] border border-dashed border-line p-10 text-center">
          <p className="text-muted">مازال ما صنعت حتى فيديو.</p>
          <div className="mt-4 flex justify-center gap-2"><a href="#/new"><Btn>اصنع أول فيديو</Btn></a><a href="#/demo/content"><Btn kind="ghost">جرّب مثال</Btn></a></div>
        </div>
      )}
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list?.map((p) => {
          const pal = p.plan?.style.palette;
          return (
            <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-line bg-panel p-3">
              <a href={`#/p/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid h-16 w-12 shrink-0 place-items-center overflow-hidden rounded-lg" style={{ background: pal ? `linear-gradient(160deg, ${pal.dark}, ${pal.accent})` : '#1D1A29' }}>
                  <I.play size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{p.title}</span>
                  <span className="text-[12.5px] text-muted">{{ content: 'محتوى', product: 'إعلان منتوج', talking: 'شخص يتكلّم' }[p.mode]} · {new Date(p.updatedAt).toLocaleDateString('ar-DZ')}{p.status === 'error' ? ' · خطأ' : ''}</span>
                </span>
              </a>
              <button aria-label="حذف" onClick={async () => { if (confirm('نحذفو المشروع؟')) { await deleteProject(p.id); load(); } }} className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-raised hover:text-coral"><I.trash size={17} /></button>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
};
