import { AbsoluteFill, Sequence } from 'remotion';
import { useVideo } from '@/core/context';
import type { ProductPlan, ProductScene } from './schema';
import { CapsuleView, CardsView, EndView, LogoView, OrbView, PromptView, PunchView, ShowcaseView, WordsView } from './scenes';
import { Grain } from './Grain';

const View = ({ s, from, dur, plan }: { s: ProductScene; from: number; dur: number; plan: ProductPlan }) => {
  switch (s.kind) {
    case 'words': return <WordsView s={s} from={from} dur={dur} plan={plan} />;
    case 'punch': return <PunchView s={s} from={from} dur={dur} plan={plan} />;
    case 'prompt': return <PromptView s={s} from={from} dur={dur} plan={plan} />;
    case 'logo': return <LogoView s={s} from={from} dur={dur} plan={plan} />;
    case 'showcase': return <ShowcaseView s={s} from={from} dur={dur} plan={plan} />;
    case 'capsule': return <CapsuleView s={s} from={from} dur={dur} plan={plan} />;
    case 'cards': return <CardsView s={s} from={from} dur={dur} plan={plan} />;
    case 'orb': return <OrbView s={s} from={from} dur={dur} plan={plan} />;
    case 'end': return <EndView s={s} from={from} dur={dur} plan={plan} />;
  }
};

export const ProductVideo = ({ plan }: { plan: ProductPlan }) => {
  const { tl } = useVideo();
  const wins = tl.scenes(plan.scenes.map((s) => s.from));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05050A' }}>
      {plan.scenes.map((s, i) => {
        const w = wins[i]!;
        return (
          <Sequence key={i} from={w.from} durationInFrames={w.to - w.from} premountFor={15} name={`${i + 1}·${s.kind}`}>
            <View s={s} from={w.from} dur={w.to - w.from} plan={plan} />
          </Sequence>
        );
      })}
      <Grain />
    </AbsoluteFill>
  );
};
