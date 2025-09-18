"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Ui/Button";
import { useSprite } from "../hooks/useSprite";
import { useAppActions, useAppSelector } from "../hooks/useAppStore";
import { selectAtlasInfo, selectFrameCount, selectMetaSummary } from "../lib/state/selectors";

export const SpriteSheetPanel = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const actions = useAppActions();
  const atlasInfo = useAppSelector(selectAtlasInfo);
  const frameCount = useAppSelector(selectFrameCount);
  const metaSummary = useAppSelector(selectMetaSummary);
  const state = useAppSelector((s) => ({
    rings: s.rings,
    global: s.global,
    activeRingId: s.activeRingId,
    spec: s.spec,
    fps: s.fps,
  }));

  const { renderSprite, exportPng, prepareGif } = useSprite({
    canvasRef,
    spec: state.spec,
  });

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    renderSprite(state.rings, state.global, state.activeRingId, frameCount)
      .catch((error) => {
        if (!cancelled) {
          console.error(error);
          actions.showToast("Erro ao gerar sprite", false);
        }
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [renderSprite, state.rings, state.global, state.activeRingId, frameCount, actions]);

  const handleRender = async () => {
    try {
      setBusy(true);
      await renderSprite(state.rings, state.global, state.activeRingId, frameCount);
      actions.showToast("Sprite gerado", true);
    } catch (error) {
      console.error(error);
      actions.showToast("Erro ao gerar sprite", false);
    } finally {
      setBusy(false);
    }
  };

  const handleSavePng = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await exportPng();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `voice-rings_sprite_${atlasInfo.width}x${atlasInfo.height}_${frameCount}f.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      actions.showToast("PNG salvo", true);
    } catch (error) {
      console.error(error);
      actions.showToast("Erro ao salvar PNG", false);
    }
  };

  const handleGifPreview = async () => {
    try {
      actions.setGifPreviewOpen(true);
      actions.setGifPreviewLoading(true);
      actions.setGifPreviewNormalize(false);
      const bundle = await prepareGif(
        state.rings,
        state.global,
        state.activeRingId,
        frameCount,
        state.fps,
      );
      actions.setGifPreviewBundle(bundle);
      actions.setGifPreviewLoading(false);
    } catch (error) {
      console.error(error);
      actions.showToast("Erro ao preparar preview do GIF", false);
      actions.setGifPreviewLoading(false);
      actions.setGifPreviewOpen(false);
    }
  };

  return (
    <section className="card flex min-h-0 flex-col lg:flex-1 lg:basis-1/2 lg:max-h-[calc(54vh)] lg:overflow-hidden" id="spriteCol" data-pip-zone="true">
      <div className="head">
        <h2>Sprite Sheet</h2>
      </div>
      <div className="body flex flex-1 min-h-0 flex-col gap-4">
        <div className="flex-1 min-h-[220px] rounded-2xl border border-white/10 bg-checker p-2">
          <div className="max-h-full overflow-auto rounded-xl">
            <canvas
              ref={canvasRef}
              id="sheet"
              className="w-full rounded-xl"
              aria-label="Sprite Sheet"
            />
          </div>
        </div>
        <div className="text-xs text-white/60">{metaSummary} | Fundo transparente</div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleRender} disabled={busy}>
            {busy ? "Gerando..." : "Gerar Sprite"}
          </Button>
          <Button variant="secondary" onClick={handleSavePng} disabled={busy}>
            Baixar PNG
          </Button>
          <Button variant="primary" onClick={handleGifPreview} disabled={busy}>
            Preview GIF
          </Button>
        </div>
      </div>
    </section>
  );
};
