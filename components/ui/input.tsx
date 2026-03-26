import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva("input-base", {
  variants: {
    variant: {
      default: "",
      error:
        "border-rose-500/70 focus:border-rose-500 focus-visible:ring-rose-400/50",
      success:
        "border-emerald-500/70 focus:border-emerald-500 focus-visible:ring-emerald-400/50",
      warning:
        "border-amber-500/70 focus:border-amber-500 focus-visible:ring-amber-400/50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ variant }), className)}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };

type FormFieldProps = {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({ label, error, success, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label className="form-label">{label}</label>
      ) : null}
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-rose-400">{error}</p>
      ) : success ? (
        <p className="flex items-center gap-1 text-xs text-emerald-400">{success}</p>
      ) : hint ? (
        <p className="form-hint">{hint}</p>
      ) : null}
    </div>
  );
}
