import type { StyleId } from '@/styles/catalog';
import { DOODLE_DEMOS } from './doodle';
import { INFOGRAPHIC_DEMOS } from './infographic';
import { PRODUCT_DEMOS } from './product';
import type { Demo } from './types';

export const DEMOS: Demo[] = [...PRODUCT_DEMOS, ...INFOGRAPHIC_DEMOS, ...DOODLE_DEMOS];
export const demosOf = (id: StyleId) => DEMOS.filter((d) => d.styleId === id);
export const demoById = (id: string) => DEMOS.find((d) => d.id === id);
