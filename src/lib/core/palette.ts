import type { PaletteInfo, Ring } from "./types";

export const hexToRGBA = (hex: string, alpha = 1): string => {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

export const hexToRGB = (hex: string): [number, number, number] => {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

export const buildPalette = (rings: Ring[], maxColors = 255): PaletteInfo => {
  const perRing = Math.max(16, Math.floor(240 / Math.max(1, rings.length)));
  const colors: Array<[number, number, number]> = [];
  rings.forEach((ring) => {
    const colorA = hexToRGB(ring.colorA);
    const colorB = hexToRGB(ring.colorB);
    for (let i = 0; i < perRing; i++) {
      const t = perRing === 1 ? 0 : i / (perRing - 1);
      colors.push([
        (colorA[0] + (colorB[0] - colorA[0]) * t) | 0,
        (colorA[1] + (colorB[1] - colorA[1]) * t) | 0,
        (colorA[2] + (colorB[2] - colorA[2]) * t) | 0,
      ]);
    }
  });
  while (colors.length > maxColors) colors.pop();
  const pal = new Uint8Array(256 * 3);
  pal[0] = 0;
  pal[1] = 0;
  pal[2] = 0;
  colors.forEach((rgb, index) => {
    const offset = (1 + index) * 3;
    pal[offset] = rgb[0];
    pal[offset + 1] = rgb[1];
    pal[offset + 2] = rgb[2];
  });
  const used = colors.length + 1;
  const nearestIndex = (
    r: number,
    g: number,
    b: number,
    a: number,
  ): number => {
    if (a < 16) return 0;
    let best = 1;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 1; i < used; i++) {
      const offset = i * 3;
      const dr = r - pal[offset];
      const dg = g - pal[offset + 1];
      const db = b - pal[offset + 2];
      const distance = dr * dr + dg * dg + db * db;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
        if (distance === 0) break;
      }
    }
    return best;
  };
  return { pal, nearestIndex, colorCount: colors.length };
};
