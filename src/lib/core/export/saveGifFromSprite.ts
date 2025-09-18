import type { GifExportBundle } from "../types";
import { GifWriter } from "../gif/gif-writer";

export interface SaveGifOptions {
  onYield?: (frameIndex: number, totalFrames: number) => void | Promise<void>;
  yieldEvery?: number;
}

export const saveGifFromSprite = async (
  bundle: GifExportBundle,
  options: SaveGifOptions = {},
): Promise<Uint8Array> => {
  const writer = GifWriter(bundle.cell, bundle.cell, bundle.pal);
  const total = bundle.frames.length;
  const every = options.yieldEvery ?? 6;
  for (let i = 0; i < total; i++) {
    writer.addFrameIndexed(bundle.frames[i].indexed, bundle.delayCs, 0, 2);
    if (options.onYield && i % every === 0) {
      await options.onYield(i, total);
    }
  }
  return writer.end();
};

