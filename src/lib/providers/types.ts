import type { Transcript } from '../schema/transcript';
import type { DesignDNA } from '../schema/dna';
import type { Plan } from '../schema/plan';

export interface Transcriber {
  id: string;
  transcribe(file: Blob, opts: { vocabulary?: string; language?: string; durationMs?: number; projectId?: string }): Promise<Transcript>;
}

export type DirectorRequest = {
  transcript: Transcript;
  mode: 'A' | 'B' | 'C';
  topicHint: string;
  idea: string;
  business: string;
  visualStyle: string;
  artDirection: string;
  pacing: string;
  brandColors: string[];
  product?: { name: string; price?: number; oldPrice?: number; currency: string; offer: string; deliveryWilayas?: number; cod: boolean; phone: string };
  userImages: Array<{ index: number; note: string }>;
  avoid: Array<{ mood: string; easing: string; sequence: string[] }>;
  seed: number;
  projectId?: string;
  referenceImage?: { base64: string; mime: string };
  /** an image-generation key is configured: the director may ask for generated hero images */
  imageGen?: boolean;
};

export interface Director {
  id: string;
  direct(req: DirectorRequest): Promise<{ dna: DesignDNA; plan: Plan }>;
}

export interface ImageGenerator {
  id: string;
  /** refs: reference images (style sheet / character / product photo) for a consistent look across scenes */
  generate(prompt: string, opts: { aspect: '1:1' | '9:16' | '4:5'; projectId?: string; refs?: Blob[] }): Promise<Blob>;
}

export interface TTS {
  id: string;
  speak(script: string, opts: { voiceId?: string; projectId?: string }): Promise<{ audio: Blob; transcript: Transcript }>;
}
