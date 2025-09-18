"use client";

import { forwardRef } from "react";

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: React.ReactNode;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className = "", label, valueDisplay, id, ...props }, ref) => (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-white/80">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <span>{label}</span>
          {valueDisplay && <span className="text-white/60 text-xs">{valueDisplay}</span>}
        </div>
      )}
      <input
        ref={ref}
        id={id}
        type="range"
        className={`h-1.5 w-full appearance-none rounded-full bg-white/10 accent-[#21B2D1] focus:outline-none focus:ring-2 focus:ring-[#5B4EE6] focus:ring-offset-2 focus:ring-offset-[#0b0e11] ${className}`}
        {...props}
      />
    </label>
  ),
);

Slider.displayName = "Slider";

