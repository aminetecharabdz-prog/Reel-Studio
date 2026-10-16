import type { StyleId } from '@/styles/catalog';
import { DOODLE_DEMOS } from './doodle';
import { INFOGRAPHIC_DEMOS } from './infographic';
import { PLOTTER_DEMOS } from './plotter';
import { PRODUCT_DEMOS } from './product';
import { WHITEBOARD_DEMOS } from './whiteboard';
import type { Demo } from './types';

export const DEMOS: Demo[] = [...PRODUCT_DEMOS, ...INFOGRAPHIC_DEMOS, ...DOODLE_DEMOS, ...WHITEBOARD_DEMOS, ...PLOTTER_DEMOS];
export const demosOf = (id: StyleId) => DEMOS.filter((d) => d.styleId === id);
export const demoById = (id: string) => DEMOS.find((d) => d.id === id);
