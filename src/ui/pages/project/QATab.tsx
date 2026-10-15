import { useState } from 'react';
import type { Project } from '@/lib/schema/project';
import type { CompiledReel } from '@/lib/timing/types';
import { Button, Panel, Pulse, cx } from '../../components/ui';
import { checkPlan, checkReel, autoFixPlan } from '@/lib/qa/checks';
import { runVisionQA } from '@/lib/qa/vision';

export const QATab = ({ project, reel, onChange }: { project: Project; reel: CompiledReel | null; onChange: (p: Project) => void }) => {
  const [busy, setBusy] = useState<string | null>(null);
  const issues = project.qa;
  const rerun = () => {
    if (!project.plan || !project.transcript) return;
    let plan = project.plan;
    let found = checkPlan(plan, project.transcript, project.mode);
    const fixed = [] as Project['qa'];
    for (let i = 0; i < 2 && found.length; i++) {
      const r = autoFixPlan(plan, project.transcript, found);
      plan = r.plan;
      fixed.push(...r.fixed);
      found = checkPlan(plan, project.transcript, project.mode);
    }
    const reelIssues = reel ? checkReel(reel, project.transcript) : [];
    onChange({ ...project, plan, qa: [...fixed, ...found, ...reelIssues] });
  };
  const vision = async () => {
    if (!reel) return;
    setBusy('فحص اللقطات بالذكاء الاصطناعي…');
    try {
      const res = await runVisionQA(project, reel, (m) => setBusy(m));
      onChange(res);
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(null);
    }
  };
  const open = issues.filter((i) => !i.fixed);
  return (
    <div className="space-y-3">
      <Panel className="space-y-2">
        <div className="font-bold">{open.length === 0 ? 'لا توجد مشاكل ✓' : `${open.length} ملاحظة`}</div>
        <p className="text-[14px] text-muted">يفحص النظام: تزامن الكابشن (≤ إطار واحد)، كل كلمة مرة واحدة، طول المشاهد، التباين، مناطق الأمان، المحتوى الناقص، والتكرار — ويصلح ما يمكن إصلاحه تلقائيًا.</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="soft" onClick={rerun}>أعد الفحص</Button>
          <Button size="sm" variant="ghost" disabled={!!busy} onClick={vision}>فحص بصري بالذكاء الاصطناعي</Button>
        </div>
        {busy && <div className="flex items-center gap-2 text-sm text-muted"><Pulse /> {busy}</div>}
      </Panel>
      {issues.map((i, k) => (
        <div key={k} className={cx('rounded-xl p-3 text-[14px]', i.fixed ? 'bg-mint/10 text-mint' : i.severity === 'error' ? 'bg-rose/10 text-rose' : 'bg-raised text-ink')}>
          {i.fixed ? '✓ أُصلح: ' : i.severity === 'error' ? '✗ ' : '! '}{i.message}
        </div>
      ))}
    </div>
  );
};
