"use client";

import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#21B2D1] hover:bg-[#1ba2be] text-white font-semibold shadow-sm",
  secondary: "bg-[#192230] hover:bg-[#1f2b3c] text-white/90 border border-white/10",
  ghost: "bg-transparent hover:bg-white/10 text-white/80",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#5B4EE6] focus:ring-offset-2 focus:ring-offset-[#0b0e11] disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  ),
);

Button.displayName = "Button";

