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
};

export interface Director {
  id: string;
  direct(req: DirectorRequest): Promise<{ dna: DesignDNA; plan: Plan }>;
}

export interface ImageGenerator {
  id: string;
  generate(prompt: string, opts: { aspect: '1:1' | '9:16' | '4:5'; projectId?: string }): Promise<Blob>;
}

export interface TTS {
  id: string;
  speak(script: string, opts: { voiceId?: string; projectId?: string }): Promise<{ audio: Blob; transcript: Transcript }>;
}
