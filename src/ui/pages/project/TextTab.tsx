import type { Project } from '@/lib/schema/project';
import { TranscriptEditor } from '../../components/TranscriptEditor';
import { autoFixPlan, checkPlan } from '@/lib/qa/checks';

export const TextTab = ({ project, onChange }: { project: Project; onChange: (p: Project) => void }) => (
  <TranscriptEditor
    transcript={project.transcript!}
    vocabulary={project.media.vocabulary}
    idea={project.media.idea}
    projectId={project.id}
    onApply={(t) => {
      // keep the plan valid: anchors to removed words are repaired automatically
      const plan = project.plan ? autoFixPlan(project.plan, t, checkPlan(project.plan, t, project.mode)).plan : project.plan;
      onChange({ ...project, transcript: t, plan });
    }}
  />
);
