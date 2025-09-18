import { useCallback, useEffect, useRef, useState } from "react";

interface UseAnimationOptions {
  playing: boolean;
  fps: number;
  frameCount: number;
}

export const useAnimation = ({ playing, fps, frameCount }: UseAnimationOptions) => {
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef(0);
  const accRef = useRef(0);

  const cancel = () => {
    if (rafRef.current !== undefined) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
  };

  const tick = useCallback(
    (time: number) => {
      if (!playing) return;
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      accRef.current += dt;
      const frameDuration = 1000 / Math.max(1, fps);
      let next = frameRef.current;
      let changed = false;
      const total = Math.max(1, frameCount);
      while (accRef.current >= frameDuration) {
        accRef.current -= frameDuration;
        next = (next + 1) % total;
        changed = true;
      }
      if (changed) {
        frameRef.current = next;
        setFrame(next);
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [playing, fps, frameCount],
  );

  useEffect(() => {
    cancel();
    if (!playing) {
      lastTimeRef.current = 0;
      accRef.current = 0;
      return () => cancel();
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancel();
  }, [playing, tick]);

  const reset = useCallback(() => {
    lastTimeRef.current = 0;
    accRef.current = 0;
    frameRef.current = 0;
    setFrame(0);
  }, []);

  useEffect(() => {
    const total = Math.max(1, frameCount);
    frameRef.current = frameRef.current % total;
    setFrame(frameRef.current);
  }, [frameCount]);

  return { frame, setFrame, reset };
};

