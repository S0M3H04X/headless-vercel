/**
 * sdf.ts
 * Signed Distance Functions ported from play.core
 */

import { dot2, length2, mulN, sub2, Vec2 } from './vec';

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function map(v: number, i_min: number, i_max: number, o_min: number, o_max: number): number {
  return o_min + (o_max - o_min) * ((v - i_min) / (i_max - i_min));
}

export function sdSegment(p: Vec2, a: Vec2, b: Vec2, thickness: number): number {
  const pa = sub2(p, a);
  const ba = sub2(b, a);
  const h = clamp(dot2(pa, ba) / dot2(ba, ba), 0.0, 1.0);
  return length2(sub2(pa, mulN(ba, h))) - thickness;
}
