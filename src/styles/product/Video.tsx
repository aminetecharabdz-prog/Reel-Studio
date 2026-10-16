import { AbsoluteFill, Sequence } from 'remotion';
import { useVideo } from '@/engine/context';
import type { ProductPlan, ProductScene } from './schema';
import { CapsuleView, CardsView, EndView, LogoView, OrbView, PromptView, PunchView, ShowcaseView, WordsView } from './scenes';
import { Grain } from './Grain';
import { CUT_LEAD, T } from './tokens';

const View = ({ s, from, dur, plan }: { s: ProductScene; from: number; dur: number; plan: ProductPlan }) => {
  switch (s.kind) {
    case 'words':
      return <WordsView s={s} from={from} dur={dur} plan={plan} />;
    case 'punch':
      return <PunchView s={s} from={from} dur={dur} plan={plan} />;
    case 'prompt':
      return <PromptView s={s} from={from} dur={dur} plan={plan} />;
    case 'logo':
      return <LogoView s={s} from={from} dur={dur} plan={plan} />;
    case 'showcase':
      return <ShowcaseView s={s} from={from} dur={dur} plan={plan} />;
    case 'capsule':
      return <CapsuleView s={s} from={from} dur={dur} plan={plan} />;
    case 'cards':
      return <CardsView s={s} from={from} dur={dur} plan={plan} />;
    case 'orb':
      return <OrbView s={s} from={from} dur={dur} plan={plan} />;
    case 'end':
      return <EndView s={s} from={from} dur={dur} plan={plan} />;
  }
};

/** scene windows in frames (cut in the pause before each scene's first word) */
export const useWindows = (plan: ProductPlan) => {
  const { T: TI, contentEnd } = useVideo();
  return TI.windows(
    plan.scenes.map((s) => s.from),
    contentEnd,
    CUT_LEAD,
  ).map((w) => ({ from: TI.toFrame(w.from), to: TI.toFrame(w.to) }));
};

export const ProductVideo = ({ plan }: { plan: ProductPlan }) => {
  const wins = useWindows(plan);
  return (
    <AbsoluteFill style={{ backgroundColor: T.dark }}>
      {plan.scenes.map((s, i) => {
        const w = wins[i]!;
        return (
          <Sequence key={i} from={w.from} durationInFrames={Math.max(1, w.to - w.from)} premountFor={15} name={`${i + 1}·${s.kind}`}>
            <View s={s} from={w.from} dur={w.to - w.from} plan={plan} />
          </Sequence>
        );
      })}
      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};
