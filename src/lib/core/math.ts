export const TWO_PI = Math.PI * 2;

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const toFixed = (value: number, digits: number): number =>
  Number.parseFloat(value.toFixed(digits));

export const deepCopy = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

export const roundTo = (value: number, precision: number): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

