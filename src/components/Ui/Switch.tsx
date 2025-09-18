"use client";

import { forwardRef } from "react";

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, label, className = "", ...props }, ref) => {
    const toggle = () => onCheckedChange?.(!checked);
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={toggle}
        className={`flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#5B4EE6] focus:ring-offset-2 focus:ring-offset-[#0b0e11] ${className}`}
        {...props}
      >
        <span
          className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${checked ? "bg-[#21B2D1]" : "bg-white/15"}`}
        >
          <span
            className={`absolute left-1 h-3.5 w-3.5 transform rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-0"}`}
          />
        </span>
        {label && <span className="text-white/70">{label}</span>}
      </button>
    );
  },
);

Switch.displayName = "Switch";

