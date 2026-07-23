import type { ButtonHTMLAttributes } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-signal text-base-950 hover:bg-signal/90 border-transparent",
  secondary: "bg-base-700 text-ink-100 hover:bg-base-600 border-base-500",
  ghost: "bg-transparent text-ink-300 hover:text-ink-100 hover:bg-base-700 border-transparent",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center gap-2 rounded border px-3 py-1.5 font-body text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
