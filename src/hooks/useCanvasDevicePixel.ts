import { MutableRefObject, useEffect, useState } from "react";

interface UseCanvasDevicePixelOptions {
  size?: number;
  minDpr?: number;
  maxDpr?: number;
  square?: boolean;
}

const clampSize = (value: number, fallback: number): number =>
  Number.isFinite(value) && value > 0 ? value : fallback;

export const useCanvasDevicePixel = <T extends HTMLCanvasElement | null>(
  ref: MutableRefObject<T>,
  options: UseCanvasDevicePixelOptions = {},
) => {
  const [devicePixelSize, setDevicePixelSize] = useState({ width: 0, height: 0, dpr: 1 });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const minDpr = options.minDpr ?? 1;
    const maxDpr = options.maxDpr ?? 3;

    const resolveCssSize = () => {
      if (typeof options.size === "number") {
        return { width: options.size, height: options.size };
      }
      const container = canvas.parentElement;
      const containerRect = container?.getBoundingClientRect();
      if (containerRect && containerRect.width > 0 && containerRect.height > 0) {
        return { width: containerRect.width, height: containerRect.height };
      }
      const canvasRect = canvas.getBoundingClientRect();
      if (canvasRect.width > 0 && canvasRect.height > 0) {
        return { width: canvasRect.width, height: canvasRect.height };
      }
      return {
        width: canvas.clientWidth || canvas.width,
        height: canvas.clientHeight || canvas.height,
      };
    };

    const sync = () => {
      const dpr = Math.max(minDpr, Math.min(maxDpr, window.devicePixelRatio || 1));
      let { width: cssWidth, height: cssHeight } = resolveCssSize();
      cssWidth = clampSize(cssWidth, canvas.clientWidth || canvas.width || 1);
      cssHeight = clampSize(cssHeight, canvas.clientHeight || canvas.height || 1);
      if (options.square) {
        const size = Math.max(1, Math.min(cssWidth, cssHeight));
        cssWidth = size;
        cssHeight = size;
      }
      const width = Math.max(1, Math.round(cssWidth * dpr));
      const height = Math.max(1, Math.round(cssHeight * dpr));
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      setDevicePixelSize({ width, height, dpr });
    };

    sync();
    const handleResize = () => sync();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      const target = canvas.parentElement ?? canvas;
      if (target) {
        resizeObserver = new ResizeObserver(() => sync());
        resizeObserver.observe(target);
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      resizeObserver?.disconnect();
    };
  }, [ref, options.size, options.minDpr, options.maxDpr, options.square]);

  return devicePixelSize;
};
