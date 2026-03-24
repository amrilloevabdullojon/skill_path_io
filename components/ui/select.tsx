import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  containerClassName?: string;
  label?: string;
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, containerClassName, label, children, ...props }, ref) => {
    return (
      <label className={cn("block space-y-1.5", containerClassName)}>
        {label ? <span className="text-xs text-slate-400">{label}</span> : null}
        <span className="relative block">
          <select ref={ref} className={cn("select-base appearance-none pr-9", className)} {...props}>
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        </span>
      </label>
    );
  },
);

Select.displayName = "Select";

export { Select };
