import { useEffect, useState } from 'react';
import { repo, type LedgerEntry } from '@/lib/repo/db';
import { Panel } from '../components/ui';
import type { Project } from '@/lib/schema/project';

/** Admin view: cost of each project from the cost ledger (not shown to end users). */
export const AdminPage = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [renders, setRenders] = useState<Record<string, number>>({});
  useEffect(() => {
    repo.ledger().then(setEntries);
    repo.listProjects().then(setProjects);
    repo.getSetting<Record<string, number>>('renderCount').then((r) => setRenders(r ?? {}));
  }, []);
  const total = entries.reduce((s, e) => s + e.usd, 0);
  const byProject = new Map<string, number>();
  for (const e of entries) byProject.set(e.projectId ?? '—', (byProject.get(e.projectId ?? '—') ?? 0) + e.usd);
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <h1 className="font-display text-[30px] font-bold">التكاليف</h1>
      <Panel><div className="text-muted">المجموع</div><div className="font-display text-[34px] font-bold" dir="ltr">${total.toFixed(3)}</div></Panel>
      <Panel className="space-y-2">
        <div className="font-bold">حسب المشروع</div>
        {[...byProject].map(([id, usd]) => <div key={id} className="flex justify-between text-[15px]"><span>{projects.find((p) => p.id === id)?.name ?? id}</span><span dir="ltr">${usd.toFixed(3)}</span></div>)}
        {byProject.size === 0 && <div className="text-muted">لا توجد مكالمات مدفوعة بعد (الوضع التجريبي مجاني).</div>}
      </Panel>
      <Panel className="space-y-1">
        <div className="font-bold">عمليات التصيير في المتصفح</div>
        {Object.entries(renders).map(([k, n]) => <div key={k} className="flex justify-between text-[15px]"><span dir="ltr">{k}</span><span>{n}</span></div>)}
      </Panel>
      <Panel className="space-y-1">
        <div className="font-bold">آخر العمليات</div>
        {[...entries].reverse().slice(0, 40).map((e) => <div key={e.id} className="flex justify-between gap-2 text-[13px]" dir="ltr"><span>{new Date(e.at).toLocaleString()}</span><span>{e.provider}/{e.op}</span><span>${e.usd.toFixed(4)}</span></div>)}
      </Panel>
    </div>
  );
};
