import type { StyleId } from '@/styles/catalog';
import { PRODUCT_DEMOS } from './product';
import type { Demo } from './types';

export const DEMOS: Demo[] = [...PRODUCT_DEMOS];
export const demosOf = (id: StyleId) => DEMOS.filter((d) => d.styleId === id);
export const demoById = (id: string) => DEMOS.find((d) => d.id === id);
