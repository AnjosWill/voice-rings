import { clamp, deepCopy, TWO_PI } from "./math";
import type { GlobalController, Ring, RingBounds, RingId, SpriteSpec } from "./types";

export const DEFAULT_SPEC: SpriteSpec = {
  cell: 320,
  gutter: 16,
  padding: 16,
  maxCols: 6,
  maxRows: 4,
};

export const mkRing = (id: RingId, name = "Anel"): Ring => ({
  id,
  name,
  visible: true,
  baseRadius: 120,
  expandPct: 0.04,
  lineWidthBase: 3,
  ampScale: 1,
  freqScale: 1,
  ripple1Amp: 2,
  ripple1Freq: 6,
  ripple2Amp: 1.2,
  ripple2Freq: 11,
  rotateBase: 0.35,
  rotateSign: 1,
  alpha: 0.82,
  colorA: "#21B2D1",
  colorB: "#5B4EE6",
});

export const duplicateRing = (source: Ring, id: RingId, name?: string): Ring => ({
  ...deepCopy(source),
  id,
  name: name ?? `${source.name} (cópia)`,
});

export const computeBounds = (rings: Ring[]): RingBounds => {
  const base = {
    min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY,
    range: 0,
  };
  const bounds: RingBounds = {
    osc: { ...base },
    amp: { ...base },
    freq: { ...base },
    rot: { ...base },
  };
  if (rings.length === 0) {
    return {
      osc: { min: 0, max: 0, range: 0 },
      amp: { min: 0, max: 0, range: 0 },
      freq: { min: 0, max: 0, range: 0 },
      rot: { min: 0, max: 0, range: 0 },
    };
  }
  rings.forEach((ring) => {
    bounds.osc.min = Math.min(bounds.osc.min, ring.expandPct);
    bounds.osc.max = Math.max(bounds.osc.max, ring.expandPct);
    bounds.amp.min = Math.min(bounds.amp.min, ring.ampScale);
    bounds.amp.max = Math.max(bounds.amp.max, ring.ampScale);
    bounds.freq.min = Math.min(bounds.freq.min, ring.freqScale);
    bounds.freq.max = Math.max(bounds.freq.max, ring.freqScale);
    bounds.rot.min = Math.min(bounds.rot.min, ring.rotateBase);
    bounds.rot.max = Math.max(bounds.rot.max, ring.rotateBase);
  });
  (Object.values(bounds) as RingBounds[keyof RingBounds][]).forEach((item) => {
    item.range = item.max - item.min;
  });
  return bounds;
};

const applyScale = (base: number, k: number, min: number, max: number): number =>
  clamp(base * (1 + k), min, max);

export const effectiveRing = (
  ring: Ring,
  bounds: RingBounds,
  global: GlobalController,
  activeId: RingId | null,
): Ring => {
  if (!global.enabled && !global.kActive) return ring;
  const affect = global.enabled || ring.id === activeId;
  if (!affect) return ring;
  const clone: Ring = { ...ring };
  const k = global.k;
  if (global.enabled) {
    if (global.params.osc) {
      clone.expandPct = applyScale(ring.expandPct, k, bounds.osc.min, bounds.osc.max);
    }
    if (global.params.amp) {
      clone.ampScale = applyScale(ring.ampScale, k, bounds.amp.min, bounds.amp.max);
    }
    if (global.params.freq) {
      clone.freqScale = applyScale(ring.freqScale, k, bounds.freq.min, bounds.freq.max);
    }
    if (global.params.rot) {
      clone.rotateBase = applyScale(ring.rotateBase, k, bounds.rot.min, bounds.rot.max);
    }
    if (global.dirMode === "cw") clone.rotateSign = 1;
    else if (global.dirMode === "ccw") clone.rotateSign = -1;
  } else {
    if (global.params.osc) clone.expandPct = applyScale(ring.expandPct, k, 0, 0.08);
    if (global.params.amp) clone.ampScale = applyScale(ring.ampScale, k, 0, 3);
    if (global.params.freq) clone.freqScale = applyScale(ring.freqScale, k, 0.5, 2);
    if (global.params.rot) clone.rotateBase = applyScale(ring.rotateBase, k, 0, 1);
  }
  return clone;
};

export const displayRing = (
  ring: Ring,
  rings: Ring[],
  global: GlobalController,
  activeId: RingId | null,
): Ring => effectiveRing(ring, computeBounds(rings), global, activeId);

export const breathingPhase = (frameIndex: number, totalFrames: number): number =>
  Math.sin(((frameIndex % totalFrames) / totalFrames) * TWO_PI);

