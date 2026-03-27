"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

const NAV_GROUPS: { label: string; hrefs: string[] }[] = [
  {
    label: "Content",
    hrefs: [
      "/admin/dashboard",
      "/admin/courses",
      "/admin/modules",
      "/admin/lessons",
      "/admin/quizzes",
      "/admin/assignments",
      "/admin/simulations",
      "/admin/cases",
      "/admin/templates",
      "/admin/media",
      "/admin/tracks",
    ],
  },
  {
    label: "People",
    hrefs: ["/admin/users", "/admin/permissions", "/admin/certificates"],
  },
  {
    label: "System",
    hrefs: ["/admin/analytics", "/admin/audit-log", "/admin/settings"],
  },
];

export function AdminNavBar({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-x-5 gap-y-2">
      {NAV_GROUPS.map((group) => {
        const groupLinks = links.filter((l) => group.hrefs.includes(l.href));
        if (groupLinks.length === 0) return null;
        return (
          <div key={group.label} className="flex items-center gap-2">
            <span className="admin-nav-group-label">{group.label}</span>
            <div className="flex flex-wrap gap-1">
              {groupLinks.map((link) => {
                const active =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "admin-nav-link",
                      active && "admin-nav-link-active",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
