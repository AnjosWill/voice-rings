import { deepCopy } from "../math";
import { buildPalette } from "../palette";
import { frameXY, drawSpriteAtlas } from "../sprite/atlas";
import type { Any2DContext } from "../../core/types";
import type {
  GifExportBundle,
  GifFrameData,
  GlobalController,
  Ring,
  RingId,
  SpriteSpec,
} from "../types";

export interface PrepareGifBundleOptions {
  ctx: CanvasRenderingContext2D;
  tileCtx: Any2DContext;
  rings: Ring[];
  frameCount: number;
  fps: number;
  global: GlobalController;
  activeId: RingId | null;
  spec: SpriteSpec;
  onYield?: (frameIndex: number, totalFrames: number) => void | Promise<void>;
}

export const prepareGifBundle = async (
  options: PrepareGifBundleOptions,
): Promise<GifExportBundle> => {
  const ringsSnap = deepCopy(options.rings);
  const atlas = await drawSpriteAtlas(options.ctx, ringsSnap, options.frameCount, {
    tileCtx: options.tileCtx,
    global: options.global,
    activeId: options.activeId,
    spec: options.spec,
    onYield: options.onYield,
  });
  const palette = buildPalette(ringsSnap);
  const frames: GifFrameData[] = [];
  for (let i = 0; i < options.frameCount; i++) {
    const { x, y } = frameXY(i, options.frameCount, options.spec, { cols: atlas.cols });
    const raw = options.ctx.getImageData(x, y, options.spec.cell, options.spec.cell);
    const src = raw.data;
    const indexed = new Uint8Array(options.spec.cell * options.spec.cell);
    for (let idx = 0, p = 0; idx < indexed.length; idx++, p += 4) {
      const alpha = src[p + 3];
      if (alpha < 24) {
        indexed[idx] = 0;
        continue;
      }
      const px = idx % options.spec.cell;
      const py = Math.floor(idx / options.spec.cell);
      indexed[idx] = palette.nearestIndex(src[p], src[p + 1], src[p + 2], 255, px, py);
    }
    frames.push({ indexed, raw, normalized: null });
    if (options.onYield && i % 6 === 0) await options.onYield(i, options.frameCount);
  }
  const delayCs = Math.max(1, Math.round(1000 / options.fps / 10));
  return {
    FR: options.frameCount,
    delayCs,
    cell: options.spec.cell,
    pal: palette.pal,
    colorCount: palette.colorCount,
    frames,
  };
};

export const ensureNormalizedFrame = (
  frame: GifFrameData,
  palette: Uint8Array,
  cell: number,
): ImageData => {
  if (frame.normalized) return frame.normalized;
  const normalized = new ImageData(cell, cell);
  const dest = normalized.data;
  for (let i = 0, p = 0; i < frame.indexed.length; i++, p += 4) {
    const idx = frame.indexed[i];
    if (idx === 0) {
      dest[p] = 0;
      dest[p + 1] = 0;
      dest[p + 2] = 0;
      dest[p + 3] = 0;
      continue;
    }
    const paletteIndex = idx * 3;
    dest[p] = palette[paletteIndex];
    dest[p + 1] = palette[paletteIndex + 1];
    dest[p + 2] = palette[paletteIndex + 2];
    dest[p + 3] = 255;
  }
  frame.normalized = normalized;
  return normalized;
};

export const formatGifMeta = (bundle: GifExportBundle): string => {
  const approxMs = bundle.delayCs * 10;
  return `${bundle.FR} frames | ${bundle.delayCs} cs por frame (~${approxMs} ms) | Paleta ${bundle.colorCount} cores`;
};

