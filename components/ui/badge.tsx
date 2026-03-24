import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-sky-400/40 bg-sky-500/15 text-sky-200",
        secondary: "border-slate-700 bg-slate-800/80 text-slate-200",
        outline: "border-slate-600 text-slate-200",
        success: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
        warning: "border-orange-400/40 bg-orange-500/15 text-orange-200",
        danger: "border-rose-400/40 bg-rose-500/15 text-rose-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
