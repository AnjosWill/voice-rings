import { MutableRefObject, useCallback, useRef } from "react";
import {
  GifExportBundle,
  GlobalController,
  Ring,
  RingId,
  SpriteAtlasSize,
  SpriteSpec,
  prepareGifBundle,
  saveGifFromSprite,
  canvasToPngBlob,
  drawSpriteAtlas,
} from "../lib/core";

export interface UseSpriteArgs {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  spec: SpriteSpec;
}

export const useSprite = ({ canvasRef, spec }: UseSpriteArgs) => {
  const tileCtxRef = useRef<CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null>(null);

  const ensureTileContext = useCallback(() => {
    if (tileCtxRef.current) return tileCtxRef.current;
    if (typeof window === "undefined" || typeof document === "undefined") return null;
    if (typeof OffscreenCanvas !== "undefined") {
      const offscreen = new OffscreenCanvas(spec.cell, spec.cell);
      tileCtxRef.current = offscreen.getContext("2d") as OffscreenCanvasRenderingContext2D | null;
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = spec.cell;
      canvas.height = spec.cell;
      tileCtxRef.current = canvas.getContext("2d");
    }
    return tileCtxRef.current;
  }, [spec.cell]);

  const getContext = useCallback(() => canvasRef.current?.getContext("2d"), [canvasRef]);

  const renderSprite = useCallback(
    async (
      rings: Ring[],
      global: GlobalController,
      activeId: RingId | null,
      frameCount: number,
    ): Promise<SpriteAtlasSize | null> => {
      const ctx = getContext();
      const tileCtx = ensureTileContext();
      if (!ctx || !tileCtx) return null;
      return drawSpriteAtlas(ctx, rings, frameCount, {
        tileCtx,
        global,
        activeId,
        spec,
      });
    },
    [getContext, ensureTileContext, spec],
  );

  const exportPng = useCallback(async () => {
    if (!canvasRef.current) throw new Error("Canvas principal nao disponivel");
    return canvasToPngBlob(canvasRef.current);
  }, [canvasRef]);

  const prepareGif = useCallback(
    async (
      rings: Ring[],
      global: GlobalController,
      activeId: RingId | null,
      frameCount: number,
      fps: number,
    ): Promise<GifExportBundle> => {
      const ctx = getContext();
      const tileCtx = ensureTileContext();
      if (!ctx || !tileCtx) throw new Error("Contextos indisponiveis para gerar GIF");
      return prepareGifBundle({
        ctx,
        tileCtx,
        rings,
        frameCount,
        fps,
        global,
        activeId,
        spec,
      });
    },
    [getContext, ensureTileContext, spec],
  );

  const exportGif = useCallback((bundle: GifExportBundle) => saveGifFromSprite(bundle), []);

  return { renderSprite, exportPng, prepareGif, exportGif };
};
