"use client";

import { useEffect, useMemo, useRef } from "react";
import { ensureNormalizedFrame, formatGifMeta, saveGifFromSprite } from "../lib/core";
import { useAppActions, useAppSelector } from "../hooks/useAppStore";
import { Button } from "./Ui/Button";

export const CutsModal = () => {
  const actions = useAppActions();
  const { open, loading, normalize, bundle } = useAppSelector((state) => state.gifPreview);

  const frameRefs = useRef<HTMLCanvasElement[]>([]);
  frameRefs.current = [];

  useEffect(() => {
    if (!bundle) return;
    bundle.frames.forEach((frame, index) => {
      const canvas = frameRefs.current[index];
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const image = normalize
        ? ensureNormalizedFrame(frame, bundle.pal, bundle.cell)
        : frame.raw;
      ctx.putImageData(image, 0, 0);
    });
  }, [bundle, normalize]);

  const close = () => {
    actions.setGifPreviewOpen(false);
    actions.setGifPreviewBundle(null);
    actions.setGifPreviewNormalize(false);
    actions.setGifPreviewLoading(false);
  };

  const saveGif = async () => {
    if (!bundle) return;
    try {
      actions.setGifPreviewLoading(true);
      const data = await saveGifFromSprite(bundle);
      const blob = new Blob([data], { type: "image/gif" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const delay = bundle.delayCs;
      link.href = url;
      link.download = `voice-rings_${bundle.FR}f_${delay}cs.gif`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      actions.showToast("GIF salvo", true);
      close();
    } catch (error) {
      console.error(error);
      actions.showToast("Erro ao salvar GIF", false);
      actions.setGifPreviewLoading(false);
    }
  };

  const footerText = useMemo(() => (bundle ? formatGifMeta(bundle) : ""), [bundle]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="max-h-[90vh] w-full max-w-[640px] overflow-hidden rounded-2xl border border-white/10 bg-[#10161f] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 text-white/80">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">Preview do GIF</h3>
          <Button variant="ghost" onClick={close}>
            Fechar
          </Button>
        </div>
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto px-5 py-4">
          {loading && <div className="text-sm text-white/60">Processando...</div>}
          {!loading && bundle && (
            <div className="grid grid-cols-2 gap-4">
              {bundle.frames.map((frame, index) => (
                <div key={index} className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-checker p-3">
                  <canvas
                    ref={(el) => {
                      if (el) {
                        el.width = bundle.cell;
                        el.height = bundle.cell;
                        frameRefs.current[index] = el;
                      }
                    }}
                    className="h-32 w-32 rounded-lg"
                  />
                  <span className="text-xs text-white/60">Frame {index + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 border-t border-white/5 px-5 py-4 text-sm text-white/70">
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={normalize}
              disabled={!bundle}
              onChange={(ev) => actions.setGifPreviewNormalize(ev.target.checked)}
            />
            Normalizar cores
          </label>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={saveGif} disabled={loading || !bundle}>
              Salvar GIF
            </Button>
            <Button variant="secondary" onClick={close}>
              Cancelar
            </Button>
          </div>
          <div className="text-xs text-white/50">
            {bundle ? footerText : "Gerando informacoes..."}
          </div>
        </div>
      </div>
    </div>
  );
};

