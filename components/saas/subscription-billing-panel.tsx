"use client";

import { useState } from "react";
import { Check, Lock, Download, CreditCard, AlertTriangle } from "lucide-react";

import { MeterUsageCheck, SubscriptionPlan, SubscriptionPlanId } from "@/types/saas";

type SubscriptionBillingPanelProps = {
  currentPlanId: SubscriptionPlanId;
  plans: SubscriptionPlan[];
  usage: MeterUsageCheck[];
};

function formatLimit(value: number | null) {
  if (value === null || !Number.isFinite(value) || value > 1000000) {
    return "Безлимит";
  }
  return String(value);
}

export function SubscriptionBillingPanel({ currentPlanId, plans, usage }: SubscriptionBillingPanelProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  const allFeatures = Array.from(
    new Set(plans.flatMap((plan) => plan.featureBundle.features)),
  );

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 surface-hero border border-indigo-500/20 bg-card/40 backdrop-blur-md p-6 sm:p-8 rounded-[24px]">
        <div className="space-y-2 relative z-10">
          <p className="kicker text-indigo-400 font-semibold tracking-widest uppercase">Подписка B2B</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Управление тарифом и оплата</h1>
          <p className="text-sm text-foreground/70 max-w-2xl">
            Тарифные планы для индивидуального обучения и команд. Управляйте расходами, загружайте акты и следите за лимитами.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
          <button className="btn-secondary whitespace-nowrap inline-flex items-center gap-2 rounded-full border-indigo-500/30 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10">
            <CreditCard className="w-4 h-4" />
            Реквизиты
          </button>
          <button className="btn-secondary whitespace-nowrap inline-flex items-center gap-2 rounded-full border-indigo-500/30 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10">
            <Download className="w-4 h-4" />
            Акты / Счета
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center sm:justify-end gap-3 mb-2">
          <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Ежемесячно</span>
          <button
            type="button"
            role="switch"
            aria-label="Переключатель тарификации: ежемесячно или ежегодно"
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-indigo-500"
            aria-checked={isAnnual}
          >
            <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAnnual ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-semibold flex items-center gap-1 transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Ежегодно <span className="text-[10px] text-emerald-400 border border-emerald-400/30 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">-20%</span>
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const price = isAnnual ? plan.annualPriceUsd : plan.monthlyPriceUsd;
            
            return (
              <article
                key={plan.id}
                className={`relative overflow-hidden surface-elevated border bg-card/60 backdrop-blur-md space-y-4 p-6 rounded-[24px] transition-all hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)] ${
                  isCurrent ? "border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] bg-gradient-to-br from-indigo-900/10 to-indigo-900/10" : "border-border/50"
                }`}
              >
                {isCurrent && <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-indigo-500/10 blur-[50px] pointer-events-none rounded-full" />}
                
                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div>
                    <p className="text-lg font-bold text-foreground">{plan.name}</p>
                    <p className="text-xs text-foreground/70">{plan.description}</p>
                  </div>
                  {isCurrent ? (
                    <span className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-indigo-300">
                      Текущий
                    </span>
                  ) : null}
                </div>
                
                <div className="relative z-10 pt-2 pb-2">
                  <div className="flex items-end gap-1">
                    <p className="text-4xl font-extrabold text-foreground">${price}</p>
                    <span className="text-sm text-foreground/60 mb-1">/ мес.</span>
                  </div>
                  {!isAnnual && plan.annualPriceUsd > 0 && (
                    <p className="text-[11px] text-emerald-400/80 mt-1">При оплате за год: ${plan.annualPriceUsd}/мес</p>
                  )}
                  {isAnnual && (
                    <p className="text-[11px] text-emerald-400/80 mt-1">Экономия 20%</p>
                  )}
                </div>

                <ul className="space-y-3 relative z-10 pt-4 border-t border-border/40">
                  {plan.featureBundle.features.slice(0, 6).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                {!isCurrent && (
                  <button className="w-full btn-secondary mt-6 relative z-10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-400 transition-colors">
                    Перейти на {plan.name}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <section className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md space-y-5 p-6 rounded-[24px]">
        <h2 className="text-xl font-bold text-foreground">Использование лимитов</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {usage.map((item) => {
            const isUnlimited = item.limit === null;
            const percentage = isUnlimited ? 0 : Math.min(Math.max((item.used / (item.limit as number)) * 100, 0), 100);
            const isWarning = percentage >= 80;
            const isReached = item.reached;

            return (
              <article 
                key={item.meter} 
                className={`relative rounded-xl border p-5 transition-all ${
                  isReached ? "border-rose-500/40 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
                  : isWarning ? "border-amber-500/40 bg-amber-500/5" 
                  : "border-border/40 bg-card/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-xs uppercase tracking-widest font-semibold text-foreground/60">{item.meter}</p>
                  {isReached && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-foreground leading-none">{item.used}</span>
                  <span className="text-sm text-foreground/60 ml-1">/ {formatLimit(item.limit)}</span>
                </div>

                {!isUnlimited && (
                  <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isReached ? "bg-rose-500" : isWarning ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2 text-[11px] font-medium uppercase tracking-wider">
                  <span className="text-foreground/50">Период: {item.window}</span>
                  <span className={`${isReached ? "text-rose-400" : isWarning ? "text-amber-400" : "text-emerald-400"}`}>
                    {isReached ? "Лимит исчерпан" : isUnlimited ? "Безлимит" : `Осталось: ${item.remaining}`}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md space-y-5 p-6 sm:p-8 rounded-[24px] overflow-hidden">
        <h2 className="text-xl font-bold text-foreground">Сравнение возможностей</h2>
        <div className="table-shell border-t border-border/30 pt-4 overflow-x-auto">
          <table className="table-base min-w-[840px] border-collapse w-full">
            <thead className="table-head border-b border-border/40">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold tracking-wider text-foreground/60">Функция</th>
                {plans.map((plan) => (
                  <th key={plan.id} className={`px-4 py-4 text-center font-bold relative ${plan.id === currentPlanId ? "text-indigo-300 bg-indigo-500/5 rounded-t-xl" : "text-foreground"}`}>
                    {plan.name}
                    {plan.id === currentPlanId && <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-400" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((feature, idx) => (
                <tr key={feature} className={`table-row transition-colors hover:bg-white/5 border-b border-border/20 ${idx === allFeatures.length - 1 ? 'border-none' : ''}`}>
                  <td className="px-4 py-4 text-sm text-foreground/80 font-medium">{feature}</td>
                  {plans.map((plan) => {
                    const enabled = plan.featureBundle.features.includes(feature);
                    const isCurrent = plan.id === currentPlanId;
                    return (
                      <td key={`${feature}-${plan.id}`} className={`px-4 py-4 text-center ${isCurrent ? "bg-indigo-500/5" : ""}`}>
                        {enabled ? (
                          <div className="mx-auto w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          </div>
                        ) : (
                          <Lock className="mx-auto h-3.5 w-3.5 text-foreground/30" />
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
    </section>
  );
}
