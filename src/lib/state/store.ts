import { deepCopy } from "../core/math";
import {
  DEFAULT_SPEC,
  duplicateRing,
  effectiveRing,
  mkRing,
} from "../core/ring";
import type {
  GifExportBundle,
  GlobalController,
  GlobalControllerParams,
  Ring,
  RingId,
  SpriteSpec,
} from "../core/types";
import { computeBounds } from "../core/ring";

const DEFAULT_GLOBAL: GlobalController = {
  enabled: false,
  params: { osc: true, amp: true, freq: true, rot: true },
  dirMode: "keep",
  k: 0,
  kActive: false,
  snap: null,
};

interface ToastState {
  message: string;
  ok: boolean;
  visible: boolean;
  timestamp: number;
}

interface GifPreviewState {
  open: boolean;
  loading: boolean;
  normalize: boolean;
  bundle: GifExportBundle | null;
}

export interface AppState {
  rings: Ring[];
  activeRingId: RingId | null;
  nextRingId: RingId;
  global: GlobalController;
  fps: number;
  playing: boolean;
  spec: SpriteSpec;
  toast: ToastState;
  gifPreview: GifPreviewState;
  pipForced: boolean;
}

const createInitialState = (): AppState => {
  const firstRing = mkRing(1, "Anel 1");
  return {
    rings: [firstRing],
    activeRingId: firstRing.id,
    nextRingId: 2,
    global: deepCopy(DEFAULT_GLOBAL),
    fps: 24,
    playing: true,
    spec: DEFAULT_SPEC,
    toast: { message: "", ok: true, visible: false, timestamp: 0 },
    gifPreview: { open: false, loading: false, normalize: false, bundle: null },
    pipForced: false,
  };
};

type Listener = () => void;

type StateUpdater = (state: AppState) => AppState;

type Mutator<T extends unknown[]> = (...args: T) => void;

export interface AppActions {
  addRing: Mutator<[string?]>;
  duplicateRing: Mutator<[RingId?]>;
  deleteRing: Mutator<[RingId?]>;
  setActiveRing: Mutator<[RingId]>;
  updateRing: Mutator<[RingId, Partial<Ring>]>;
  setRingVisibility: Mutator<[RingId, boolean]>;
  setFps: Mutator<[number]>;
  setPlaying: Mutator<[boolean]>;
  togglePlaying: Mutator<[]>;
  setSpec: Mutator<[SpriteSpec]>;
  setGlobalEnabled: Mutator<[boolean]>;
  setGlobalParams: Mutator<[Partial<GlobalControllerParams>]>;
  setGlobalDirMode: Mutator<[GlobalController["dirMode"]]>;
  setGlobalKPercent: Mutator<[number]>;
  applyGlobal: Mutator<[]>;
  resetGlobal: Mutator<[]>;
  showToast: Mutator<[string, boolean]>;
  hideToast: Mutator<[]>;
  setGifPreviewOpen: Mutator<[boolean]>;
  setGifPreviewLoading: Mutator<[boolean]>;
  setGifPreviewNormalize: Mutator<[boolean]>;
  setGifPreviewBundle: Mutator<[GifExportBundle | null]>;
  setPipForced: Mutator<[boolean]>;
}

export interface AppStore {
  getState: () => AppState;
  subscribe: (listener: Listener) => () => void;
  actions: AppActions;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const withState = (
  state: AppState,
  mutate: (draft: AppState) => void,
): AppState => {
  const draft = deepCopy(state);
  mutate(draft);
  return draft;
};

export const createStore = (initial?: Partial<AppState>): AppStore => {
  let state = initial ? { ...createInitialState(), ...initial } : createInitialState();
  const listeners = new Set<Listener>();

  const setState = (updater: StateUpdater) => {
    state = updater(state);
    listeners.forEach((listener) => listener());
  };

  const actions: AppActions = {
    addRing: (name) => {
      setState((prev) =>
        withState(prev, (draft) => {
          const ring = mkRing(draft.nextRingId, name ?? `Anel ${draft.nextRingId}`);
          draft.nextRingId += 1;
          draft.rings.push(ring);
          draft.activeRingId = ring.id;
        }),
      );
    },
    duplicateRing: (ringId) => {
      setState((prev) =>
        withState(prev, (draft) => {
          const sourceId = ringId ?? draft.activeRingId;
          if (!sourceId) return;
          const source = draft.rings.find((ring) => ring.id === sourceId);
          if (!source) return;
          const duplicated = duplicateRing(source, draft.nextRingId);
          draft.nextRingId += 1;
          draft.rings.push(duplicated);
          draft.activeRingId = duplicated.id;
        }),
      );
    },
    deleteRing: (ringId) => {
      setState((prev) =>
        withState(prev, (draft) => {
          if (draft.rings.length <= 1) return;
          const targetId = ringId ?? draft.activeRingId;
          if (!targetId) return;
          const index = draft.rings.findIndex((ring) => ring.id === targetId);
          if (index < 0) return;
          draft.rings.splice(index, 1);
          const fallback = draft.rings[Math.max(0, index - 1)];
          draft.activeRingId = fallback ? fallback.id : draft.rings[0]?.id ?? null;
        }),
      );
    },
    setActiveRing: (ringId) => {
      setState((prev) =>
        withState(prev, (draft) => {
          if (draft.rings.some((ring) => ring.id === ringId)) {
            draft.activeRingId = ringId;
          }
        }),
      );
    },
    updateRing: (ringId, patch) => {
      setState((prev) =>
        withState(prev, (draft) => {
          const target = draft.rings.find((ring) => ring.id === ringId);
          if (!target) return;
          Object.assign(target, patch);
        }),
      );
    },
    setRingVisibility: (ringId, visible) => {
      actions.updateRing(ringId, { visible });
    },
    setFps: (fpsValue) => {
      const next = clamp(Math.round(fpsValue), 6, 60);
      setState((prev) => withState(prev, (draft) => void (draft.fps = next)));
    },
    setPlaying: (playing) => {
      setState((prev) => withState(prev, (draft) => void (draft.playing = playing)));
    },
    togglePlaying: () => {
      setState((prev) => withState(prev, (draft) => void (draft.playing = !draft.playing)));
    },
    setSpec: (spec) => {
      setState((prev) => withState(prev, (draft) => void (draft.spec = spec)));
    },
    setGlobalEnabled: (enabled) => {
      setState((prev) =>
        withState(prev, (draft) => {
          draft.global.enabled = enabled;
          draft.global.snap = null;
          draft.global.k = 0;
          draft.global.kActive = false;
        }),
      );
    },
    setGlobalParams: (params) => {
      setState((prev) =>
        withState(prev, (draft) => {
          draft.global.params = { ...draft.global.params, ...params };
        }),
      );
    },
    setGlobalDirMode: (mode) => {
      setState((prev) =>
        withState(prev, (draft) => {
          draft.global.dirMode = mode;
        }),
      );
    },
    setGlobalKPercent: (percent) => {
      setState((prev) =>
        withState(prev, (draft) => {
          const value = clamp(percent, -100, 100) / 100;
          const wasActive = draft.global.kActive;
          draft.global.k = value;
          draft.global.kActive = Math.abs(percent) > 0;
          if (draft.global.kActive && !wasActive) {
            draft.global.snap = deepCopy(draft.rings);
          }
          if (!draft.global.kActive && wasActive) {
            draft.global.snap = null;
          }
        }),
      );
    },
    applyGlobal: () => {
      setState((prev) =>
        withState(prev, (draft) => {
          const bounds = computeBounds(draft.rings);
          if (draft.global.enabled) {
            draft.rings = draft.rings.map((ring) => {
              const eff = effectiveRing(ring, bounds, draft.global, draft.activeRingId);
              const merged: Ring = { ...ring, ...eff };
              if (draft.global.dirMode === "cw") merged.rotateSign = 1;
              else if (draft.global.dirMode === "ccw") merged.rotateSign = -1;
              return merged;
            });
          } else if (draft.activeRingId) {
            const ring = draft.rings.find((r) => r.id === draft.activeRingId);
            if (ring) {
              const eff = effectiveRing(ring, bounds, draft.global, draft.activeRingId);
              Object.assign(ring, eff);
            }
          }
          draft.global.k = 0;
          draft.global.kActive = false;
          draft.global.snap = null;
        }),
      );
    },
    resetGlobal: () => {
      setState((prev) =>
        withState(prev, (draft) => {
          if (draft.global.snap) {
            draft.rings = deepCopy(draft.global.snap);
          }
          draft.global.k = 0;
          draft.global.kActive = false;
          draft.global.snap = null;
        }),
      );
    },
    showToast: (message, ok) => {
      setState((prev) =>
        withState(prev, (draft) => {
          draft.toast = {
            message,
            ok,
            visible: true,
            timestamp: Date.now(),
          };
        }),
      );
    },
    hideToast: () => {
      setState((prev) =>
        withState(prev, (draft) => {
          draft.toast.visible = false;
        }),
      );
    },
    setGifPreviewOpen: (open) => {
      setState((prev) =>
        withState(prev, (draft) => {
          draft.gifPreview.open = open;
          if (!open) {
            draft.gifPreview.loading = false;
            draft.gifPreview.normalize = false;
            draft.gifPreview.bundle = null;
          }
        }),
      );
    },
    setGifPreviewLoading: (loading) => {
      setState((prev) =>
        withState(prev, (draft) => {
          draft.gifPreview.loading = loading;
        }),
      );
    },
    setGifPreviewNormalize: (normalize) => {
      setState((prev) =>
        withState(prev, (draft) => {
          draft.gifPreview.normalize = normalize;
        }),
      );
    },
    setGifPreviewBundle: (bundle) => {
      setState((prev) =>
        withState(prev, (draft) => {
          draft.gifPreview.bundle = bundle;
        }),
      );
    },
    setPipForced: (forced) => {
      setState((prev) =>
        withState(prev, (draft) => {
          draft.pipForced = forced;
        }),
      );
    },
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    actions,
  };
};

export const appStore = createStore();
