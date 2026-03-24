import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

const cases = [
  {
    id: "case-qa",
    title: "Bug investigation: checkout issue",
    track: "QA",
    description: "Investigate inconsistent checkout behavior, document bug report, and suggest severity.",
    href: "/simulation/bug-tracker",
  },
  {
    id: "case-ba",
    title: "Business requirement decomposition",
    track: "BA",
    description: "Transform stakeholder request into user story and acceptance criteria.",
    href: "/simulation/ba",
  },
  {
    id: "case-da",
    title: "Retention analytics project",
    track: "DA",
    description: "Write SQL query and provide insight on retention trend.",
    href: "/sandbox/sql",
  },
];

export default function CasesPage() {
  return (
    <section className="page-shell">
      <PageHeader
        kicker="Real World Cases"
        title="Practice with realistic scenarios"
        description="Case library combines QA, BA, and DA tasks with simulation-based learning."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {cases.map((item) => (
          <article key={item.id} className="surface-panel surface-panel-hover p-4">
            <p className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              {item.track}
            </p>
            <h2 className="mt-3 text-lg font-semibold text-slate-100">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{item.description}</p>
            <Link
              href={item.href}
              className="btn-secondary mt-4 inline-flex"
            >
              Open case simulation
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
