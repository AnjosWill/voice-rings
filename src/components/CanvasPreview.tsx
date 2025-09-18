"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { drawComposite } from "../lib/core";
import { useAnimation } from "../hooks/useAnimation";
import { useCanvasDevicePixel } from "../hooks/useCanvasDevicePixel";
import { useAppActions, useAppSelector } from "../hooks/useAppStore";
import { selectFrameCount } from "../lib/state/selectors";
import { Button } from "./Ui/Button";
import { Slider } from "./Ui/Slider";

export const CanvasPreview = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const miniRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const actions = useAppActions();
  const state = useAppSelector((s) => ({
    rings: s.rings,
    global: s.global,
    activeRingId: s.activeRingId,
    fps: s.fps,
    playing: s.playing,
    spec: s.spec,
    pipForced: s.pipForced,
  }));
  const { rings, global, activeRingId, fps, playing, spec, pipForced } = state;
  const frameCount = useAppSelector(selectFrameCount);

  const { frame, reset } = useAnimation({
    playing,
    fps,
    frameCount,
  });

  const [pipVisible, setPipVisible] = useState(false);

  useCanvasDevicePixel(canvasRef, { square: true });
  useCanvasDevicePixel(miniRef, { square: true });

  useEffect(() => {
    const ctxMain = canvasRef.current?.getContext("2d");
    if (!ctxMain) return;
    const ctxMini = miniRef.current?.getContext("2d");
    const contexts = ctxMini ? [ctxMain, ctxMini] : [ctxMain];
    contexts.forEach((ctx) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawComposite(ctx, rings, frame, frameCount, global, activeRingId, {
        spec,
      });
    });
  }, [rings, global, activeRingId, spec, frame, frameCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (pipForced) return;
        const [entry] = entries;
        const show = !entry.isIntersecting;
        setPipVisible(show);
        if (show) {
          const ctxMini = miniRef.current?.getContext("2d");
          if (ctxMini) {
            ctxMini.clearRect(
              0,
              0,
              ctxMini.canvas.width,
              ctxMini.canvas.height
            );
            drawComposite(
              ctxMini,
              rings,
              frame,
              frameCount,
              global,
              activeRingId,
              {
                spec,
              }
            );
          }
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [pipForced, rings, global, activeRingId, spec, frame, frameCount]);

  useEffect(() => {
    const onFocusIn = (ev: FocusEvent) => {
      if (
        window.matchMedia("(min-width: 960px), (min-aspect-ratio: 1/1)").matches
      ) {
        return;
      }
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-pip-zone="true"]')) {
        actions.setPipForced(false);
        setPipVisible(true);
      }
    };
    const onFocusOut = () => {
      actions.setPipForced(false);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [actions]);

  const togglePlaying = () => actions.togglePlaying();
  const handleFpsChange = (ev: ChangeEvent<HTMLInputElement>) => {
    actions.setFps(Number(ev.target.value));
    reset();
  };

  const pipClose = () => {
    actions.setPipForced(true);
    setPipVisible(false);
  };

  return (
    <section
      ref={containerRef}
      className="card flex min-w-full flex-col lg:flex-1 lg:basis-1/2 lg:min-h-[calc(96vh)] lg:max-h-[calc(96vh)] lg:max-w-[calc(96vh)] lg:overflow-hidden"
      id="playerCol"
    >
      <div className="head">
        <h2>Pré-visualização</h2>
      </div>
      <div className="body flex flex-2 flex-col gap-4 overflow-hidden">
        <div className="panel divided flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 items-center justify-center overflow-hidden">
            <div className="relative w-full h-full">
              <div className="relative mx-auto aspect-square min-w-full lg:min-w-[calc(70vh)] max-h-[calc(70vh)] lg:max-w-[calc(70vh)] rounded-2xl border border-white/10 bg-checker overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="h-full w-full rounded-xl"
                  aria-label="Player"
                />
              </div>
            </div>
          </div>
          <div className="ctrls flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <Slider
                id="fps"
                min={6}
                max={60}
                step={1}
                value={fps}
                onChange={handleFpsChange}
                label="FPS"
                valueDisplay={`${fps}`}
              />
            </div>
            <Button
              id="playPause"
              variant={playing ? "secondary" : "primary"}
              onClick={togglePlaying}
            >
              {playing ? "Pausar" : "Reproduzir"}
            </Button>
          </div>
        </div>
      </div>
      <div
        className={`pip pointer-events-auto fixed bottom-4 right-4 z-30
              w-fit max-w-[90vw] sm:max-w-[18rem]
              rounded-2xl border border-white/10 bg-[#0f141a] p-3 shadow-xl transition
              ${pipVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!pipVisible}
      >
        <div className="pip-inner flex w-fit flex-col items-center gap-3">
          <div className="relative mx-auto aspect-square w-fit max-w-[min(100%,30vh)] max-h-full rounded-2xl border border-white/10 bg-checker overflow-hidden">
            <canvas
              ref={miniRef}
              className="h-full w-full rounded-xl"
              aria-label="Mini Player"
            />
          </div>
          <Button
            id="pipClose"
            variant="ghost"
            onClick={pipClose}
            className="w-full"
          >
            Fechar</Button>
        </div>
      </div>
    </section>
  );
};
