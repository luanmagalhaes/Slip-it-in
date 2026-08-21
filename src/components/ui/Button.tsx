"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "mint";
type ButtonSize = "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "gradient-primary text-cream shadow-[inset_0_2px_0_rgba(255,255,255,0.28),0_6px_0_var(--color-violet-800),0_14px_24px_-14px_var(--color-shadow-deep)]",
  secondary:
    "bg-violet-800 text-cream ring-2 ring-inset ring-violet-400/35 shadow-[inset_0_2px_0_rgba(255,255,255,0.14),0_5px_0_var(--color-violet-950)]",
  ghost: "bg-violet-900/50 text-violet-300 ring-2 ring-inset ring-violet-400/25",
  danger:
    "bg-pink-hot text-ink shadow-[inset_0_2px_0_rgba(255,255,255,0.4),0_6px_0_#b85c81,0_14px_24px_-14px_var(--color-shadow-deep)]",
  mint: "gradient-mint text-ink shadow-[inset_0_2px_0_rgba(255,255,255,0.55),0_6px_0_var(--color-mint-deep),0_14px_24px_-14px_var(--color-shadow-deep)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-5 py-3 text-[0.95rem]",
  lg: "px-6 py-[1.15rem] text-lg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`font-game tap-shrink gpu rounded-[var(--radius-bubble)] active:translate-y-[4px] active:scale-[0.985] active:shadow-[inset_0_2px_0_rgba(255,255,255,0.2)] disabled:opacity-40 disabled:active:translate-y-0 disabled:active:scale-100 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
