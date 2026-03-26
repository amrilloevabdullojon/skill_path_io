import { Check, Lock } from "lucide-react";

import { MeterUsageCheck, SubscriptionPlan, SubscriptionPlanId } from "@/types/saas";

type SubscriptionBillingPanelProps = {
  currentPlanId: SubscriptionPlanId;
  plans: SubscriptionPlan[];
  usage: MeterUsageCheck[];
};

function formatLimit(value: number | null) {
  if (value === null || !Number.isFinite(value) || value > 1000000) {
    return "Unlimited";
  }
  return String(value);
}

export function SubscriptionBillingPanel({ currentPlanId, plans, usage }: SubscriptionBillingPanelProps) {
  const allFeatures = Array.from(
    new Set(plans.flatMap((plan) => plan.featureBundle.features)),
  );

  return (
    <section className="space-y-6">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Subscription</p>
        <h1 className="page-title">Billing and plan entitlements</h1>
        <p className="section-description">
          Plans are provider-agnostic. Payment provider wiring can be added without changing product gates.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          return (
            <article
              key={plan.id}
              className={`surface-elevated space-y-3 p-4 ${
                isCurrent ? "border-sky-400/45 shadow-[0_0_0_1px_rgba(56,189,248,0.28)]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>
                {isCurrent ? (
                  <span className="rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-200">
                    Current
                  </span>
                ) : null}
              </div>
              <p className="text-2xl font-semibold text-foreground">${plan.monthlyPriceUsd}</p>
              <p className="text-xs text-muted-foreground">Monthly (annual: ${plan.annualPriceUsd})</p>
              <ul className="space-y-1">
                {plan.featureBundle.features.slice(0, 6).map((feature) => (
                  <li key={feature} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <section className="surface-elevated space-y-4 p-5">
        <h2 className="section-title">Feature matrix</h2>
        <div className="table-shell">
          <table className="table-base min-w-[840px]">
            <thead className="table-head">
              <tr>
                <th className="px-3 py-3">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="px-3 py-3 text-center">{plan.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((feature) => (
                <tr key={feature} className="table-row">
                  <td className="px-3 py-3 text-muted-foreground">{feature}</td>
                  {plans.map((plan) => {
                    const enabled = plan.featureBundle.features.includes(feature);
                    return (
                      <td key={`${feature}-${plan.id}`} className="px-3 py-3 text-center">
                        {enabled ? (
                          <Check className="mx-auto h-4 w-4 text-emerald-300" />
                        ) : (
                          <Lock className="mx-auto h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface-elevated space-y-4 p-5">
        <h2 className="section-title">Usage limits</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {usage.map((item) => (
            <article key={item.meter} className="surface-subtle space-y-2 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.meter}</p>
              <p className="text-lg font-semibold text-foreground">
                {item.used} / {formatLimit(item.limit)}
              </p>
              <p className="text-xs text-muted-foreground">Window: {item.window}</p>
              <p className={`text-xs ${item.reached ? "text-rose-300" : "text-emerald-300"}`}>
                {item.reached ? "Limit reached" : `Remaining: ${item.remaining === null ? "Unlimited" : item.remaining}`}
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
