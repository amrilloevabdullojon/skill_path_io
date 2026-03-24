import { CourseStatus } from "@/types/builder/course-builder";
import { cn } from "@/lib/utils";

type StudioStatusBadgeProps = {
  status: CourseStatus;
  className?: string;
};

const statusStyle: Record<CourseStatus, string> = {
  DRAFT: "border-slate-600 bg-slate-700/60 text-slate-100",
  IN_REVIEW: "border-amber-400/35 bg-amber-500/15 text-amber-200",
  PUBLISHED: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
  ARCHIVED: "border-slate-500/35 bg-slate-700/50 text-slate-300",
};

export function StudioStatusBadge({ status, className }: StudioStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        statusStyle[status],
        className,
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
