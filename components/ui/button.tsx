import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-smooth disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_10px_26px_rgba(56,189,248,0.28)] hover:-translate-y-0.5 hover:bg-sky-300",
        outline:
          "border border-slate-700 bg-slate-900/85 text-slate-100 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-800/90",
        ghost: "text-slate-200 hover:bg-slate-800/70",
        secondary:
          "border border-slate-700 bg-slate-900/80 text-slate-100 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-800/90",
        destructive:
          "border border-rose-500/40 bg-rose-500/20 text-rose-100 hover:-translate-y-0.5 hover:bg-rose-500/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
