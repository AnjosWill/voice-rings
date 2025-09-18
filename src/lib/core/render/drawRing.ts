import { clamp, TWO_PI } from "../math";
import type { Ring, SpriteSpec } from "../types";
import { hexToRGBA } from "../palette";
import { DEFAULT_SPEC } from "../ring";

export const drawRing = (
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  totalFrames: number,
  ring: Ring,
  spec: SpriteSpec = DEFAULT_SPEC,
): void => {
  const tNorm = (frameIndex % totalFrames) / totalFrames;
  const breathe = Math.sin(tNorm * TWO_PI);
  const size = Math.min(ctx.canvas.width, ctx.canvas.height);
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  const scale = size / spec.cell;
  const baseRadius = ring.baseRadius * scale;
  const radius = baseRadius * (1 + ring.expandPct * breathe);
  const k1 = Math.max(0, Math.round(ring.rotateBase * 8));
  const k2 = Math.max(0, Math.round((k1 * 11) / 6));
  const phase1 = TWO_PI * (k1 * (frameIndex / totalFrames)) * ring.rotateSign;
  const phase2 = TWO_PI * (k2 * (frameIndex / totalFrames)) * ring.rotateSign;
  const amp1 = ring.ripple1Amp * ring.ampScale * scale;
  const amp2 = ring.ripple2Amp * ring.ampScale * scale;
  const freq1 = ring.ripple1Freq * ring.freqScale;
  const freq2 = ring.ripple2Freq * ring.freqScale;
  const thickness = clamp(ring.lineWidthBase, 2, 4) * scale;
  const steps = Math.min(4096, Math.max(1024, Math.round(1024 * ring.freqScale)));
  const dA = (Math.PI * 2) / steps;
  const startAngle = 0;
  const radius0 =
    radius +
    amp1 * Math.sin(startAngle * freq1 + phase1) +
    amp2 * Math.sin(startAngle * freq2 + phase2 + 0.7);
  const x0 = radius0 * Math.cos(startAngle);
  const y0 = radius0 * Math.sin(startAngle);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  for (let step = 1; step < steps; step++) {
    const angle = startAngle + step * dA;
    const currentRadius =
      radius +
      amp1 * Math.sin(angle * freq1 + phase1) +
      amp2 * Math.sin(angle * freq2 + phase2 + 0.7);
    ctx.lineTo(currentRadius * Math.cos(angle), currentRadius * Math.sin(angle));
  }
  ctx.lineTo(x0, y0);
  const gradient = ctx.createLinearGradient(-cx, -cy, cx, cy);
  gradient.addColorStop(0, hexToRGBA(ring.colorA, ring.alpha));
  gradient.addColorStop(1, hexToRGBA(ring.colorB, ring.alpha));
  ctx.lineWidth = Math.max(1, thickness);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.strokeStyle = gradient;
  ctx.stroke();
  ctx.restore();
};

