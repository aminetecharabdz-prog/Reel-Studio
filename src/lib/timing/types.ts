import type { DesignDNA } from '../schema/dna';
import type { BgTreatment, CaptionSettings, EndCard, PrimitiveId, SceneContent } from '../schema/plan';
import type { TransitionId } from '../schema/dna';
import type { DigitStyle } from '../text/digits';

export type FrameWord = { id: string; text: string; start: number; end: number; keyword: boolean };

export type CaptionLine = { id: string; from: number; to: number; words: FrameWord[]; keywordId: string | null };

export type ResolvedImage = { src: string; alt?: string } | null;

export type CompiledScene = {
  id: string;
  index: number;
  from: number; // absolute frame
  duration: number;
  primitive: PrimitiveId;
  variant: number;
  content: SceneContent;
  /** word id → frames relative to the scene start */
  anchors: Record<string, { start: number; end: number }>;
  words: FrameWord[]; // words spoken during this scene, relative frames
  emphasis: number[]; // relative frames
  transition: TransitionId;
  bgIndex: number;
  bg: BgTreatment;
  /** hero image (content.hero.image) resolved to a url */
  heroImage: ResolvedImage;
  images: ResolvedImage[]; // content.image / content.images resolved to urls
  speaker?: 'full' | 'split-top' | 'split-bottom' | 'pip' | 'hidden';
  zooms: number[]; // relative frames (mode C punch-ins)
  isHook: boolean;
  isEndCard: boolean;
};

export type SfxKind = 'whoosh' | 'pop' | 'tick' | 'impact' | 'riser' | 'ding' | 'click' | 'swipe';
export type SfxEvent = { frame: number; kind: SfxKind; src: string; volume: number };

export type VideoSegment = { src: string; from: number; duration: number; trimBefore: number };

export type CompiledReel = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  mode: 'A' | 'B' | 'C';
  dna: DesignDNA;
  scenes: CompiledScene[];
  captions: CaptionLine[];
  captionSettings: CaptionSettings;
  digits: DigitStyle;
  voice: { src: string; volume: number } | null;
  video: VideoSegment[]; // mode C speaker footage
  music: { src: string; gain: number[]; baseVolume: number } | null;
  sfx: SfxEvent[];
  endCard: EndCard | null;
  brandLogo: string | null;
  safeZone: 'none' | 'instagram' | 'tiktok' | 'youtube';
  showSafeZone: boolean;
};
