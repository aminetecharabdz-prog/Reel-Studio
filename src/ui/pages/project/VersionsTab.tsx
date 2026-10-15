import type { Project } from '@/lib/schema/project';
import { Button, Panel } from '../../components/ui';

export const VersionsTab = ({ project, onChange }: { project: Project; onChange: (p: Project) => void }) => (
  <div className="space-y-2">
    <p className="text-[14px] text-muted">كل «نسخة جديدة» تُحفظ هنا — نفس الصوت بتصميم آخر (مفيد لاختبار الإعلانات A/B).</p>
    {[...project.versions].reverse().map((v, i) => (
      <Panel key={v.id} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 space-x-reverse">
            {[v.dna.palette.bg[0], v.dna.palette.primary, v.dna.palette.accent].map((c, k) => <span key={k} className="h-8 w-8 rounded-full ring-2 ring-surface" style={{ backgroundColor: c }} />)}
          </div>
          <div>
            <div className="font-bold">نسخة {project.versions.length - i} · {v.label}</div>
            <div className="text-[12px] text-muted">{v.dna.mood} · {v.plan.scenes.length} مشهد · {new Date(v.createdAt).toLocaleTimeString('ar-DZ')}</div>
          </div>
        </div>
        <Button size="sm" variant={project.dna?.seed === v.dna.seed ? 'soft' : 'ghost'} onClick={() => onChange({ ...project, dna: v.dna, plan: v.plan })}>{project.dna?.seed === v.dna.seed ? 'الحالية' : 'استرجع'}</Button>
      </Panel>
    ))}
    {project.plan?.hookVariants?.length ? (
      <Panel>
        <div className="mb-2 font-bold">جمل افتتاحية بديلة (A/B)</div>
        <ul className="list-inside list-disc space-y-1 text-[15px]">{project.plan.hookVariants.map((h, i) => <li key={i}>{h}</li>)}</ul>
      </Panel>
    ) : null}
  </div>
);
