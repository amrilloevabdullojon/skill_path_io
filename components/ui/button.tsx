import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-fast ease-smooth disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        /** Sky primary — call-to-action */
        default: "btn-primary-base",
        /** Elevated border — secondary action on dark bg */
        outline: "btn-outline-base",
        /** Transparent — tertiary / nav */
        ghost: "btn-ghost-base",
        /** Subtle border — secondary action */
        secondary: "btn-secondary-base",
        destructive: "btn-destructive-base",
        /** Violet accent — AI / special actions */
        accent: "btn-accent-base",
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
