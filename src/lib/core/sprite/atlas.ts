import type {
  FrameCoordinates,
  GlobalController,
  Ring,
  RingId,
  SpriteAtlasSize,
  SpriteSpec,
} from "../types";
import { DEFAULT_SPEC } from "../ring";
import { drawRing } from "../render/drawRing";
import { computeBounds, effectiveRing } from "../ring";

export interface GridOptions {
  cols?: number;
}

export const gridFor = (
  frames: number,
  spec: SpriteSpec = DEFAULT_SPEC,
  options: GridOptions = {},
): { cols: number; rows: number } => {
  if (frames <= 0) return { cols: 0, rows: 0 };
  const cols = Math.max(1, options.cols ?? Math.min(spec.maxCols, frames));
  const rows = Math.max(1, Math.ceil(frames / cols));
  return { cols, rows };
};

export const atlasSize = (
  frames: number,
  spec: SpriteSpec = DEFAULT_SPEC,
  options: GridOptions = {},
): SpriteAtlasSize => {
  const { cols, rows } = gridFor(frames, spec, options);
  const width = spec.padding * 2 + cols * spec.cell + (cols - 1) * spec.gutter;
  const height = spec.padding * 2 + rows * spec.cell + (rows - 1) * spec.gutter;
  return { width, height, cols, rows };
};

export const frameXY = (
  index: number,
  frames: number,
  spec: SpriteSpec = DEFAULT_SPEC,
  options: GridOptions = {},
): FrameCoordinates => {
  const { cols } = gridFor(frames, spec, options);
  if (cols === 0) return { x: spec.padding, y: spec.padding };
  const column = index % cols;
  const row = Math.floor(index / cols);
  const x = spec.padding + column * (spec.cell + spec.gutter);
  const y = spec.padding + row * (spec.cell + spec.gutter);
  return { x, y };
};

export interface DrawSpriteAtlasOptions extends GridOptions {
  spec?: SpriteSpec;
  tileCtx: CanvasRenderingContext2D;
  global: GlobalController;
  activeId: RingId | null;
  onYield?: (frameIndex: number, totalFrames: number) => void | Promise<void>;
  yieldEvery?: number;
}

export const drawSpriteAtlas = async (
  ctx: CanvasRenderingContext2D,
  rings: Ring[],
  frames: number,
  options: DrawSpriteAtlasOptions,
): Promise<SpriteAtlasSize> => {
  const spec = options.spec ?? DEFAULT_SPEC;
  const atlas = atlasSize(frames, spec, options);
  if (ctx.canvas.width !== atlas.width) ctx.canvas.width = atlas.width;
  if (ctx.canvas.height !== atlas.height) ctx.canvas.height = atlas.height;
  ctx.clearRect(0, 0, atlas.width, atlas.height);
  const bounds = computeBounds(rings);
  const tileCtx = options.tileCtx;
  const yieldEvery = options.yieldEvery ?? 6;
  for (let i = 0; i < frames; i++) {
    tileCtx.clearRect(0, 0, spec.cell, spec.cell);
    rings.forEach((ring) => {
      if (!ring.visible) return;
      const effective = effectiveRing(ring, bounds, options.global, options.activeId);
      drawRing(tileCtx, i, frames, effective, spec);
    });
    const position = frameXY(i, frames, spec, { cols: atlas.cols });
    ctx.drawImage(tileCtx.canvas, position.x, position.y);
    if (options.onYield && i % yieldEvery === 0) {
      await options.onYield(i, frames);
    }
  }
  return atlas;
};

