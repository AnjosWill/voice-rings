"use client";

export interface IconProps {
  name: string;
  className?: string;
  title?: string;
}

export const Icon = ({ name, className = "", title }: IconProps) => (
  <span
    className={`material-symbols-rounded ${className}`.trim()}
    aria-hidden={title ? undefined : true}
    title={title}
  >
    {name}
  </span>
);
