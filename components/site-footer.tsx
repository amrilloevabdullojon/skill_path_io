import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer relative z-10">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-3 px-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>SkillPath Academy Local Edition</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/tracks" className="site-footer-link">Tracks</Link>
          <Link href="/dashboard" className="site-footer-link">Dashboard</Link>
          <Link href="/missions" className="site-footer-link">Missions</Link>
          <Link href="/planner" className="site-footer-link">Planner</Link>
          <Link href="/interview" className="site-footer-link">Interview</Link>
          <Link href="/career" className="site-footer-link">Career</Link>
          <Link href="/admin" className="site-footer-link">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
