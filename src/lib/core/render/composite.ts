import type { GlobalController, Ring, RingId, SpriteSpec } from "../types";
import { computeBounds, effectiveRing } from "../ring";
import { drawRing } from "./drawRing";

export interface CompositeOptions {
  spec?: SpriteSpec;
}

export const drawComposite = (
  contexts: CanvasRenderingContext2D | CanvasRenderingContext2D[],
  rings: Ring[],
  frameIndex: number,
  totalFrames: number,
  global: GlobalController,
  activeId: RingId | null,
  options: CompositeOptions = {},
): void => {
  const ctxArray = Array.isArray(contexts) ? contexts : [contexts];
  const spec = options.spec;
  const bounds = computeBounds(rings);
  rings.forEach((ring) => {
    if (!ring.visible) return;
    const effective = effectiveRing(ring, bounds, global, activeId);
    ctxArray.forEach((ctx) => drawRing(ctx, frameIndex, totalFrames, effective, spec));
  });
};

