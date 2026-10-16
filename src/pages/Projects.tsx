import { useEffect, useMemo, useState } from 'react';
import { href, go } from '@/app/router';
import { deleteProject, duplicateProject, listProjects, saveProject, type ProjectRecord } from '@/data/db';
import { STYLES, type StyleId } from '@/styles/catalog';
import { Icon } from '@/ui/Icon';
import { Loader } from '@/ui/Logo';
import { Button, Empty, IconButton, Input, Section } from '@/ui/kit';
import { StylePoster } from './StyleTile';

const fmt = new Intl.DateTimeFormat('ar-DZ', { dateStyle: 'medium', timeStyle: 'short', numberingSystem: 'latn' });

export const ProjectsPage = () => {
  const [items, setItems] = useState<ProjectRecord[] | null>(null);
  const [q, setQ] = useState('');
  const reload = () => listProjects().then(setItems).catch(() => setItems([]));
  useEffect(() => {
    reload();
  }, []);
  const shown = useMemo(() => (items ?? []).filter((p) => !q.trim() || p.name.includes(q.trim())), [items, q]);

  return (
    <Section
      title="مشاريعي"
      kicker="محفوظة في هذا الهاتف"
      action={
        <Button variant="spark" size="sm" icon="plus" href={href('/create')}>
          فيديو جديد
        </Button>
      }
    >
      {items === null ? (
        <Loader label="نحمّل مشاريعك..." />
      ) : items.length === 0 ? (
        <Empty
          icon="folder"
          title="لا مشاريع بعد"
          body="كل فيديو تصنعه يُحفظ هنا تلقائيًا، وتقدر ترجع له وتعدّله في أي وقت."
          action={
            <Button variant="spark" icon="plus" href={href('/create')}>
              اصنع فيديوك الأول
            </Button>
          }
        />
      ) : (
        <>
          <div className="relative mb-5 max-w-md">
            <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[var(--text-3)]" />
            <Input placeholder="ابحث باسم المشروع" value={q} onChange={(e) => setQ(e.target.value)} className="pr-10" aria-label="بحث" />
          </div>
          {shown.length === 0 && <p className="text-[var(--text-2)]">لا مشروع بهذا الاسم.</p>}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((p) => {
              const st = STYLES[p.styleId as StyleId];
              return (
                <li key={p.id} className="card flex flex-col overflow-hidden rounded-[var(--radius-lg)]">
                  <a href={href(`/create?project=${p.id}`)} className="relative block aspect-[4/5] border-b border-[var(--line)] bg-[var(--bg-2)]">
                    {p.cover ? <img src={p.cover} alt="" className="absolute inset-0 h-full w-full object-cover" /> : st && <StylePoster s={st} className="absolute inset-0 h-full w-full" />}
                  </a>
                  <div className="flex flex-col gap-1 p-3">
                    <h3 className="truncate text-[0.95rem] font-bold">{p.name}</h3>
                    <p className="text-[0.75rem] text-[var(--text-3)]">
                      {st?.nameAr ?? p.styleId} · <span className="num">{fmt.format(p.updatedAt)}</span>
                    </p>
                    <div className="mt-1 flex justify-end gap-0.5">
                      <IconButton
                        icon="edit"
                        label="إعادة تسمية"
                        onClick={async () => {
                          const name = window.prompt('اسم المشروع', p.name)?.trim();
                          if (name) {
                            await saveProject({ ...p, name });
                            reload();
                          }
                        }}
                      />
                      <IconButton
                        icon="copy"
                        label="نسخ"
                        onClick={async () => {
                          await duplicateProject(p.id);
                          reload();
                        }}
                      />
                      <IconButton
                        icon="trash"
                        label="حذف"
                        onClick={async () => {
                          if (!window.confirm(`حذف «${p.name}»؟`)) return;
                          await deleteProject(p.id);
                          reload();
                        }}
                      />
                      <IconButton icon="arrowL" label="فتح" onClick={() => go(`/create?project=${p.id}`)} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Section>
  );
};
