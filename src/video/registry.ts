import type { FC } from 'react';
import type { PrimitiveId } from '@/lib/schema/plan';
import * as T from './primitives/text';
import * as D from './primitives/data';
import * as M from './primitives/media';
import * as G from './primitives/graphic';
import * as S from './primitives/structure';
import * as A from './primitives/ad';
import * as C from './primitives/compose';

export const PRIMITIVE_COMPONENTS: Record<PrimitiveId, FC> = {
  'kinetic-headline': T.KineticHeadline,
  'word-build': T.WordBuild,
  'highlight-sweep': T.HighlightSweep,
  'big-number': T.BigNumber,
  'quote-card': T.QuoteCard,
  typewriter: T.Typewriter,
  'split-flap': T.SplitFlap,
  'stacked-list': T.StackedList,
  'question-hook': T.QuestionHook,
  'bar-chart': D.BarChart,
  'line-chart': D.LineChart,
  'donut-chart': D.DonutChart,
  'progress-ring': D.ProgressRing,
  versus: D.Versus,
  timeline: D.Timeline,
  steps: D.Steps,
  checklist: D.Checklist,
  rating: D.Rating,
  'algeria-map': D.AlgeriaMap,
  'icon-array': D.IconArray,
  'image-card': M.ImageCard,
  'ken-burns': M.KenBurns,
  'phone-mockup': M.PhoneMockup,
  'laptop-mockup': M.LaptopMockup,
  'before-after': M.BeforeAfter,
  collage: M.Collage,
  'polaroid-stack': M.PolaroidStack,
  'product-hero': M.ProductHero,
  'icon-burst': G.IconBurst,
  'icon-grid': G.IconGrid,
  'illustration-scene': G.IllustrationScene,
  'sticker-pop': G.StickerPop,
  'callout-arrows': G.CalloutArrows,
  'highlighter-circle': G.HighlighterCircle,
  'shape-morph': G.ShapeMorph,
  gauge: G.Gauge,
  'do-dont': G.DoDont,
  'warning-alert': G.WarningAlert,
  'title-card': S.TitleCard,
  'chapter-divider': S.ChapterDivider,
  cta: S.CTA,
  'end-card': S.EndCard,
  'logo-sting': S.LogoSting,
  'price-tag': A.PriceTag,
  'delivery-badge': A.DeliveryBadge,
  'cod-badge': A.CodBadge,
  urgency: A.Urgency,
  'offer-ribbon': A.OfferRibbon,
  'feature-callouts': A.FeatureCallouts,
  'hero-scene': C.HeroScene,
};
