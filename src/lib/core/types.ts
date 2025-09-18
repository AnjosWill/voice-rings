/** Identifier for a ring instance. */
export type RingId = number;

/** Tunable parameters that define a single animated ring. */
export interface Ring {
  id: RingId;
  name: string;
  visible: boolean;
  baseRadius: number;
  expandPct: number;
  lineWidthBase: number;
  ampScale: number;
  freqScale: number;
  ripple1Amp: number;
  ripple1Freq: number;
  ripple2Amp: number;
  ripple2Freq: number;
  rotateBase: number;
  rotateSign: 1 | -1;
  alpha: number;
  colorA: string;
  colorB: string;
}

/** Oscillation flags toggled by the global controller. */
export interface GlobalControllerParams {
  osc: boolean;
  amp: boolean;
  freq: boolean;
  rot: boolean;
}

/** Shared global modulation state applied to rings. */
export interface GlobalController {
  enabled: boolean;
  params: GlobalControllerParams;
  dirMode: "keep" | "cw" | "ccw";
  k: number;
  kActive: boolean;
  snap: Ring[] | null;
}

/** Range data describing the extrema for a parameter family. */
export interface BoundsRange {
  min: number;
  max: number;
  range: number;
}

/** Derived limits for each controllable ring parameter. */
export interface RingBounds {
  osc: BoundsRange;
  amp: BoundsRange;
  freq: BoundsRange;
  rot: BoundsRange;
}

/** Sprite-sheet layout metadata. */
export interface SpriteSpec {
  cell: number;
  gutter: number;
  padding: number;
  maxCols: number;
  maxRows: number;
}

/** Computed atlas size and frame arrangement. */
export interface SpriteAtlasSize {
  width: number;
  height: number;
  cols: number;
  rows: number;
}

/** Coordinates for a frame in the sprite atlas. */
export interface FrameCoordinates {
  x: number;
  y: number;
}

/** Prepared palette lookup for indexed colour conversions. */
export interface PaletteInfo {
  pal: Uint8Array;
  nearestIndex: (r: number, g: number, b: number, a: number, x: number, y: number) => number;
  colorCount: number;
}

/** Indexed data for a single animation frame. */
export interface GifFrameData {
  indexed: Uint8Array;
  raw: ImageData;
  normalized: ImageData | null;
}

/** Bundle used to export a GIF out of generated frames. */
export interface GifExportBundle {
  FR: number;
  delayCs: number;
  cell: number;
  pal: Uint8Array;
  colorCount: number;
  frames: GifFrameData[];
}

