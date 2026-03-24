import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/55 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-3 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>SkillPath Academy Local Edition</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/tracks" className="transition-colors hover:text-slate-200">
            Tracks
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-slate-200">
            Dashboard
          </Link>
          <Link href="/missions" className="transition-colors hover:text-slate-200">
            Missions
          </Link>
          <Link href="/planner" className="transition-colors hover:text-slate-200">
            Planner
          </Link>
          <Link href="/interview" className="transition-colors hover:text-slate-200">
            Interview
          </Link>
          <Link href="/career" className="transition-colors hover:text-slate-200">
            Career
          </Link>
          <Link href="/admin" className="transition-colors hover:text-slate-200">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
