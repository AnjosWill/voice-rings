import { atlasSize } from "../core/sprite/atlas";
import type { AppState } from "./store";

export const selectActiveRing = (state: AppState) =>
  state.rings.find((ring) => ring.id === state.activeRingId) ?? null;

export const selectFrameCount = (state: AppState) => Math.max(6, Math.round(state.fps));

export const selectAtlasInfo = (state: AppState) => {
  const frameCount = selectFrameCount(state);
  const atlas = atlasSize(frameCount, state.spec);
  return { ...atlas, frameCount };
};

export const selectMetaSummary = (state: AppState): string => {
  const { width, height, frameCount } = selectAtlasInfo(state);
  return `${width}x${height} | ${frameCount}f @ ${state.fps} fps | ${state.rings.length} anel(is)`;
};

export const selectGlobalKPercent = (state: AppState) => Math.round(state.global.k * 100);

