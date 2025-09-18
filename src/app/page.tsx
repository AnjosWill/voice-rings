"use client";

import React, {
  useCallback,
  useEffect,  
  useRef,
  useState,
} from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import clsx from "clsx";
import { CanvasPreview } from "../components/CanvasPreview";
import { SpriteSheetPanel } from "../components/SpriteSheetPanel";
import { LayersPanel } from "../components/LayersPanel";
import { RingControls } from "../components/RingControls";
import { GlobalControls } from "../components/GlobalControls";
import { CutsModal } from "../components/CutsModal";
import { Icon } from "../components/Ui/Icon";
import type { WindowWithRepeatPatch } from "../types/window";
import { useAppActions, useAppSelector } from "../hooks/useAppStore";

const MIN_COLUMN_WIDTH = 220;
const MAX_COLUMN_WIDTH = 480;
const DEFAULT_COLUMN_WIDTH = 320;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => "touches" in event;

const isReactTouchEvent = (event: ReactMouseEvent | ReactTouchEvent): event is ReactTouchEvent => "touches" in event;

const panelToggleButton = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#0f141a]/80 text-white/70 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#5B4EE6] focus:ring-offset-2 focus:ring-offset-[#0b0e11]";

const Toast = () => {
  const toast = useAppSelector((state) => state.toast);
  const actions = useAppActions();

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => actions.hideToast(), 1600);
    return () => clearTimeout(timer);
  }, [toast.visible, actions]);

  if (!toast.visible) return null;
  return (
    <div
      id="toast"
      className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition ${
        toast.ok ? "bg-[#1f3d4f]/90 text-white" : "bg-red-500/90 text-white"
      }`}
    >
      {toast.message}
    </div>
  );
};

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => setIsDesktop(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
};

export default function Home() {
  const isDesktop = useIsDesktop();
  const repeatPatchedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || repeatPatchedRef.current) return;
    const win = window as WindowWithRepeatPatch;
    if (win.__repeatPatched) {
      repeatPatchedRef.current = true;
      return;
    }
    const originalRepeat = String.prototype.repeat;
    String.prototype.repeat = function repeatPatched(count: number) {
      if (count < 0) {
        console.error("String.repeat called with", count, this.toString());
        console.error(new Error().stack);
        count = 0;
      }
      return originalRepeat.call(this, count);
    };
    win.__repeatPatched = true;
    repeatPatchedRef.current = true;
  }, []);

  const [leftWidth, setLeftWidth] = useState(DEFAULT_COLUMN_WIDTH);
  const [rightWidth, setRightWidth] = useState(DEFAULT_COLUMN_WIDTH);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [dragging, setDragging] = useState<"left" | "right" | null>(null);

  const leftStoredWidth = useRef(DEFAULT_COLUMN_WIDTH);
  const rightStoredWidth = useRef(DEFAULT_COLUMN_WIDTH);
  const dragSnapshot = useRef({ side: "left" as "left" | "right", startX: 0, startWidth: DEFAULT_COLUMN_WIDTH });

  useEffect(() => {
    if (!isDesktop) {
      setLeftCollapsed(false);
      setRightCollapsed(false);
      setDragging(null);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (!leftCollapsed) {
      leftStoredWidth.current = leftWidth;
    }
  }, [leftCollapsed, leftWidth]);

  useEffect(() => {
    if (!rightCollapsed) {
      rightStoredWidth.current = rightWidth;
    }
  }, [rightCollapsed, rightWidth]);

  const toggleLeft = useCallback(() => {
    if (!isDesktop) return;
    setLeftCollapsed((prev) => {
      if (prev) {
        setLeftWidth(clamp(leftStoredWidth.current, MIN_COLUMN_WIDTH, MAX_COLUMN_WIDTH));
        return false;
      }
      leftStoredWidth.current = leftWidth;
      return true;
    });
  }, [isDesktop, leftWidth]);

  const toggleRight = useCallback(() => {
    if (!isDesktop) return;
    setRightCollapsed((prev) => {
      if (prev) {
        setRightWidth(clamp(rightStoredWidth.current, MIN_COLUMN_WIDTH, MAX_COLUMN_WIDTH));
        return false;
      }
      rightStoredWidth.current = rightWidth;
      return true;
    });
  }, [isDesktop, rightWidth]);

  const startResize = useCallback(
    (side: "left" | "right") => (event: ReactMouseEvent | ReactTouchEvent) => {
      if (!isDesktop) return;
      const point = isReactTouchEvent(event) ? event.touches[0] : event;
      dragSnapshot.current = {
        side,
        startX: point.clientX,
        startWidth: side === "left" ? leftWidth : rightWidth,
      };
      if (side === "left" && leftCollapsed) {
        setLeftCollapsed(false);
        setLeftWidth(clamp(leftStoredWidth.current, MIN_COLUMN_WIDTH, MAX_COLUMN_WIDTH));
      }
      if (side === "right" && rightCollapsed) {
        setRightCollapsed(false);
        setRightWidth(clamp(rightStoredWidth.current, MIN_COLUMN_WIDTH, MAX_COLUMN_WIDTH));
      }
      setDragging(side);
      event.preventDefault();
    },
    [isDesktop, leftCollapsed, leftWidth, rightCollapsed, rightWidth],
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (event: MouseEvent | TouchEvent) => {
      const point = isTouchEvent(event) ? event.touches[0] : event;
      const delta = point.clientX - dragSnapshot.current.startX;
      if (dragSnapshot.current.side === "left") {
        setLeftWidth(clamp(dragSnapshot.current.startWidth + delta, MIN_COLUMN_WIDTH, MAX_COLUMN_WIDTH));
      } else {
        setRightWidth(clamp(dragSnapshot.current.startWidth - delta, MIN_COLUMN_WIDTH, MAX_COLUMN_WIDTH));
      }
      event.preventDefault();
    };

    const handleUp = () => setDragging(null);

    document.addEventListener("mousemove", handleMove, { passive: false });
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [dragging]);

  const leftStyle: CSSProperties | undefined = isDesktop
    ? {
        width: leftCollapsed ? 0 : leftWidth,
        flexBasis: leftCollapsed ? 0 : leftWidth,
        minWidth: leftCollapsed ? 0 : MIN_COLUMN_WIDTH,
        flexShrink: 0,
      }
    : undefined;

  const rightStyle: CSSProperties | undefined = isDesktop
    ? {
        width: rightCollapsed ? 0 : rightWidth,
        flexBasis: rightCollapsed ? 0 : rightWidth,
        minWidth: rightCollapsed ? 0 : MIN_COLUMN_WIDTH,
        flexShrink: 0,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[#110e0b] text-white flex flex-col">
      <main className="flex-1 h-full overflow-hidden p-4 md:p-5 lg:p-4">
        <div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0">
          {isDesktop && (
            <div className="hidden lg:flex w-fit flex-col items-start justify-start lg:-ml-2">
              <button
                type="button"
                className={panelToggleButton}
                onClick={toggleLeft}
                title={leftCollapsed ? "Expandir painel esquerdo" : "Recolher painel esquerdo"}
                aria-label={leftCollapsed ? "Expandir painel esquerdo" : "Recolher painel esquerdo"}
              >
                <Icon name={leftCollapsed ? "chevron_right" : "chevron_left"} />
              </button>
            </div>
          )}
          <div className="flex h-full min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-0">
            <aside
              style={leftStyle}
              className={clsx(
                "order-2 flex min-h-0 w-full flex-col gap-4 px-2 lg:px-4 lg:overflow-hidden",
                isDesktop && "transition-[width,opacity] duration-200 ease-out",
                leftCollapsed && isDesktop && "pointer-events-none opacity-0",
              )}
            >
              <div className="flex h-full min-h-0 flex-col gap-4 lg:gap-2">
                <GlobalControls />
                <RingControls />
              </div>
            </aside>

            {isDesktop && (
              <div
                className={clsx(
                  "hidden lg:block h-full flex-shrink-0 cursor-col-resize transition-colors",
                  leftCollapsed ? "w-2 bg-white/30" : "w-3 bg-white/10 hover:bg-white/20",
                )}
                onMouseDown={startResize("left")}
                onTouchStart={startResize("left")}
                aria-label="Redimensionar painel esquerdo"
              />
            )}

            <section className="relative order-1 flex min-w-0 flex-1 h-full flex-col overflow-hidden lg:order-2">
              <CanvasPreview />
            </section>

            {isDesktop && (
              <div
                className={clsx(
                  "hidden lg:block h-full flex-shrink-0 cursor-col-resize transition-colors",
                  rightCollapsed ? "w-0 bg-white/30" : "w-0 bg-white/10 hover:bg-white/20",
                )}
                onMouseDown={startResize("right")}
                onTouchStart={startResize("right")}
                aria-label="Redimensionar painel direito"
              />
            )}

            <aside
              style={rightStyle}
              className={clsx(
                "order-2 flex min-h-0 w-full flex-col gap-4 px-2 lg:px-4 lg:overflow-hidden",
                isDesktop && "transition-[width,opacity] duration-200 ease-out",
                rightCollapsed && isDesktop && "pointer-events-none opacity-0",
              )}
            >
              <div className="flex h-full min-h-0 flex-col gap-4 lg:gap-2">
                <LayersPanel />
                <SpriteSheetPanel />
              </div>
            </aside>
          </div>

          {isDesktop && (
            <div className="hidden lg:flex w-fit flex-col items-end justify-start lg:-mr-2">
              <button
                type="button"
                className={panelToggleButton}
                onClick={toggleRight}
                title={rightCollapsed ? "Expandir painel direito" : "Recolher painel direito"}
                aria-label={rightCollapsed ? "Expandir painel direito" : "Recolher painel direito"}
              >
                <Icon name={rightCollapsed ? "chevron_left" : "chevron_right"} />
              </button>
            </div>
          )}
        </div>
      </main>
      <CutsModal />
      <Toast />
    </div>
  );
}
