import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-smooth disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        /** Sky primary — call-to-action */
        default:
          "bg-sky-400 text-slate-950 shadow-[0_6px_20px_rgba(56,189,248,0.25)] hover:-translate-y-0.5 hover:bg-sky-300 hover:shadow-[0_10px_28px_rgba(56,189,248,0.32)]",
        /** Elevated border — secondary action on dark bg */
        outline:
          "border border-slate-600/80 bg-slate-800/60 text-slate-100 hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-800",
        /** Transparent — tertiary / nav */
        ghost:
          "text-slate-300 hover:bg-slate-800/60 hover:text-slate-100",
        /** Subtle border — secondary action with less emphasis than outline */
        secondary:
          "border border-slate-700/70 bg-slate-900/70 text-slate-200 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-900",
        destructive:
          "border border-rose-500/40 bg-rose-500/15 text-rose-200 hover:-translate-y-0.5 hover:bg-rose-500/25",
        /** Violet accent — AI / special actions */
        accent:
          "border border-violet-400/40 bg-violet-500/15 text-violet-100 hover:-translate-y-0.5 hover:bg-violet-500/25",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-7 px-2.5 text-xs",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
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
