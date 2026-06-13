"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import { buildStarterRoadmap, starterTrackByProfession } from "@/lib/personalization/onboarding-presets";
import type { OnboardingProfile, TrackTag, UserKnowledgeLevel } from "@/types/personalization";
import { useBrowserStorageItem } from "@/hooks/use-browser-storage";
import { cn } from "@/lib/utils";

const SKILL_TEST_KEY = "levio:skill-test:result";

type SkillTestResult = {
  goalKey: "qa" | "ba" | "da" | "explore" | null;
  scorePercent: number;
  level: "exploring" | "novice" | "growing" | "ready";
  takenAt?: string;
};

type StepKey = "diagnosis" | "goal" | "plan";

const steps: Array<{ key: StepKey; label: string }> = [
  { key: "diagnosis", label: "Диагноз" },
  { key: "goal", label: "Цель" },
  { key: "plan", label: "Первый шаг" },
];

const goalToTrack: Record<NonNullable<SkillTestResult["goalKey"]>, TrackTag | null> = {
  qa: "QA",
  ba: "BA",
  da: "DA",
  explore: null,
};

const trackSlug: Record<TrackTag, string> = {
  QA: "qa-engineer",
  BA: "business-analyst",
  DA: "data-analyst",
};

const levelToKnowledge: Record<SkillTestResult["level"], UserKnowledgeLevel> = {
  exploring: "BEGINNER",
  novice: "BEGINNER",
  growing: "FOUNDATION",
  ready: "INTERMEDIATE",
};

const levelOptions: Array<{ value: UserKnowledgeLevel; label: string; note: string }> = [
  { value: "BEGINNER", label: "Новичок", note: "Нужна база и спокойный старт." },
  { value: "FOUNDATION", label: "База", note: "Теория есть, нужна рабочая практика." },
  { value: "INTERMEDIATE", label: "Практик", note: "Можно быстрее идти к миссиям." },
];

const trackOptions: Array<{ id: TrackTag; title: string; text: string; tone: string }> = [
  {
    id: "QA",
    title: "QA Инженер",
    text: "Тестирование, баг-репорты, API, качество продукта.",
    tone: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
  },
  {
    id: "BA",
    title: "Business Analyst",
    text: "Требования, user stories, интервью, процессы.",
    tone: "border-orange-400/35 bg-orange-500/10 text-orange-200",
  },
  {
    id: "DA",
    title: "Data Analyst",
    text: "SQL, метрики, дашборды, анализ данных.",
    tone: "border-violet-400/35 bg-violet-500/10 text-violet-200",
  },
];

const interestOptions = [
  "Testing",
  "API",
  "Bug Reporting",
  "User Stories",
  "Requirements",
  "SQL",
  "Analytics",
  "Communication",
];

const trackReason: Record<TrackTag, string> = {
  QA: "Подходит, если вам ближе качество продукта, проверка сценариев, баг-репорты и понятный вход в IT через практику.",
  BA: "Подходит, если вам интересны требования, коммуникация, процессы, user stories и перевод бизнес-задач в понятные решения.",
  DA: "Подходит, если вам ближе данные, SQL, метрики, дашборды и поиск ответов через анализ фактов.",
};

const levelReason: Record<UserKnowledgeLevel, string> = {
  BEGINNER: "Начинаем с фундамента: термины, роли, базовые сценарии и короткие задания без перегруза.",
  FOUNDATION: "База уже есть, поэтому быстрее переходим к рабочим упражнениям и проверке понимания.",
  INTERMEDIATE: "Можно не задерживаться на вводных блоках и раньше подключать практические миссии.",
  ADVANCED: "Фокус стоит сместить на сложные симуляции, портфолио и проверку готовности к собеседованиям.",
};

function parseSkillTestResult(raw: string | null): SkillTestResult | null {
  try {
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SkillTestResult>;
    if (typeof parsed.scorePercent !== "number") return null;
    return {
      goalKey: parsed.goalKey ?? null,
      scorePercent: parsed.scorePercent,
      level: parsed.level ?? "novice",
      takenAt: parsed.takenAt,
    };
  } catch {
    return null;
  }
}

function levelLabel(level: UserKnowledgeLevel) {
  if (level === "INTERMEDIATE") return "Практик";
  if (level === "ADVANCED") return "Продвинутый";
  if (level === "FOUNDATION") return "База";
  return "Новичок";
}

function firstAction(profile: OnboardingProfile) {
  if (profile.currentLevel === "INTERMEDIATE" || profile.currentLevel === "ADVANCED") {
    return "Начните с первой практической миссии и сохраните результат в портфолио.";
  }
  if (profile.currentLevel === "FOUNDATION") {
    return "Пройдите первый модуль и сразу закрепите его короткой практикой.";
  }
  return "Начните с вводного модуля: он даст словарь, роли и базовые рабочие сценарии.";
}

function decisionLabel(skillTest: SkillTestResult | null) {
  if (!skillTest) return "Профиль настраивается вручную";
  if (skillTest.goalKey === "explore" || !skillTest.goalKey) return "Мягкий старт без жёсткого выбора";
  return "Маршрут собран по диагностике";
}

export function SmartOnboardingFlow({ initialProfile }: { initialProfile: OnboardingProfile }) {
  const router = useRouter();
  const rawSkillTest = useBrowserStorageItem("session", SKILL_TEST_KEY);
  const skillTest = useMemo(() => parseSkillTestResult(rawSkillTest), [rawSkillTest]);
  const recommendedProfile = useMemo(() => {
    const track = skillTest?.goalKey ? goalToTrack[skillTest.goalKey] : null;
    if (!skillTest || !track) return initialProfile;

    return {
      ...initialProfile,
      profession: track,
      currentLevel: levelToKnowledge[skillTest.level],
    };
  }, [initialProfile, skillTest]);
  const [editedProfile, setEditedProfile] = useState<OnboardingProfile | null>(null);
  const profile = editedProfile ?? recommendedProfile;
  const [stepIndex, setStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const activeStep = steps[stepIndex].key;
  const starterTrack = useMemo(() => starterTrackByProfession(profile.profession), [profile.profession]);
  const roadmap = useMemo(() => buildStarterRoadmap(profile.profession), [profile.profession]);
  const recommendedHref = `/tracks/${trackSlug[profile.profession]}`;
  const completionPercent = Math.round(((stepIndex + 1) / steps.length) * 100);
  const nextActions = [
    firstAction(profile),
    "После первого модуля пройдите короткую проверку, чтобы платформа точнее подстроила темп.",
    "Сохраните результат практики в портфолио: так обучение будет выглядеть как реальный прогресс, а не список уроков.",
  ];

  function updateProfile(patch: Partial<OnboardingProfile>) {
    setEditedProfile((current) => ({ ...(current ?? profile), ...patch }));
  }

  function toggleInterest(value: string) {
    setEditedProfile((current) => {
      const baseProfile = current ?? profile;
      const exists = baseProfile.interests.includes(value);
      return {
        ...baseProfile,
        interests: exists ? baseProfile.interests.filter((item) => item !== value) : [...baseProfile.interests, value],
      };
    });
  }

  async function saveProfile() {
    setIsSaving(true);
    setErrorText(null);

    try {
      const response = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("Не удалось сохранить профиль");
      }

      window.sessionStorage.removeItem(SKILL_TEST_KEY);
      router.push(recommendedHref);
      router.refresh();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Ошибка сохранения");
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <main className="surface-elevated overflow-hidden p-5 sm:p-6">
        <header className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="kicker">Стартовый профиль</p>
              <h1 className="page-title leading-tight">Настроим Levio под ваш первый шаг</h1>
            </div>
            <Link href="/dashboard" className="btn-secondary px-3 py-2 text-xs">
              Пропустить
            </Link>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>{steps[stepIndex].label}</span>
              <span>{completionPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {steps.map((step, index) => (
              <button
                key={step.key}
                type="button"
                onClick={() => setStepIndex(index)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-xs font-semibold transition",
                  index === stepIndex ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background/60 text-muted-foreground",
                )}
              >
                {index + 1}. {step.label}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-6 min-h-[430px]">
          {activeStep === "diagnosis" ? (
            <div className="space-y-5">
              {skillTest ? (
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-emerald-200">
                        <BadgeCheck className="h-4 w-4" />
                        {decisionLabel(skillTest)}
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Мы уже перенесли результат skill-test в профиль. Ниже можно поправить выбор, если цель изменилась.
                      </p>
                    </div>
                    <div className="rounded-lg border border-emerald-400/25 bg-background/60 px-3 py-2 text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Оценка</p>
                      <p className="text-2xl font-semibold text-foreground">{skillTest.scorePercent}%</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <SummaryCard icon={BriefcaseBusiness} label="Рекомендация" value={starterTrack} />
                    <SummaryCard icon={Target} label="Уровень старта" value={levelLabel(profile.currentLevel)} />
                  </div>
                  <div className="mt-3 rounded-lg border border-emerald-400/20 bg-background/60 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      Первое действие
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">{firstAction(profile)}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-background/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Нет результата диагностики
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Можно пройти быстрый skill-test или настроить профиль вручную. Тест лучше, потому что сразу объяснит направление и уровень старта.
                      </p>
                    </div>
                    <Link href="/skill-test" className="btn-secondary gap-2">
                      Пройти тест
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Почему выбран такой старт
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <p className="text-sm leading-relaxed text-muted-foreground">{trackReason[profile.profession]}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{levelReason[profile.currentLevel]}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Направление</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  {trackOptions.map((track) => {
                    const active = profile.profession === track.id;
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => updateProfile({ profession: track.id })}
                        className={cn(
                          "rounded-lg border p-4 text-left transition",
                          active ? track.tone : "border-border bg-background/60 hover:border-primary/40",
                        )}
                      >
                        <p className="font-semibold">{track.title}</p>
                        <p className="mt-2 text-xs leading-relaxed opacity-80">{track.text}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Текущий уровень</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  {levelOptions.map((level) => {
                    const active = profile.currentLevel === level.value;
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => updateProfile({ currentLevel: level.value })}
                        className={cn(
                          "rounded-lg border p-4 text-left transition",
                          active ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background/60 text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        <p className="font-semibold">{level.label}</p>
                        <p className="mt-2 text-xs leading-relaxed">{level.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {activeStep === "goal" ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Цель и нагрузка</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Это задаёт темп плана, но не запирает вас в жёстком расписании.
                </p>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-foreground">Главная цель</span>
                <input
                  value={profile.goal}
                  onChange={(event) => updateProfile({ goal: event.target.value })}
                  className="input-base"
                  placeholder="Например: выйти на Junior QA за 3 месяца"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <RangeCard
                  label="Часов в неделю"
                  value={profile.hoursPerWeek}
                  min={1}
                  max={30}
                  suffix="ч"
                  onChange={(value) => updateProfile({ hoursPerWeek: value })}
                />
                <RangeCard
                  label="Горизонт"
                  value={profile.targetMonths}
                  min={1}
                  max={18}
                  suffix="мес"
                  onChange={(value) => updateProfile({ targetMonths: value })}
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Интересы</h3>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => {
                    const active = profile.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm transition",
                          active ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background/60 text-muted-foreground",
                        )}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {activeStep === "plan" ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Ваш первый учебный маршрут</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  После сохранения мы откроем рекомендованный трек и начнём с ближайшего понятного шага.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <SummaryCard icon={BriefcaseBusiness} label="Трек" value={starterTrack} />
                <SummaryCard icon={Target} label="Уровень" value={levelLabel(profile.currentLevel)} />
                <SummaryCard icon={ClipboardList} label="Темп" value={`${profile.hoursPerWeek}ч / ${profile.targetMonths}мес`} />
              </div>

              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Первый шаг
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{firstAction(profile)}</p>
              </div>

              <div className="space-y-3">
                {nextActions.map((item, index) => (
                  <div key={item} className="flex gap-3 rounded-lg border border-border bg-background/60 p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {index === 0 ? "Откроется первым после онбординга." : "Помогает не потерять контекст после старта."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {errorText ? (
                <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {errorText}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <footer className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
            disabled={stepIndex === 0}
            className="btn-secondary gap-2 disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>

          {stepIndex < steps.length - 1 ? (
            <button type="button" onClick={() => setStepIndex((current) => current + 1)} className="btn-primary gap-2">
              Далее
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={saveProfile} disabled={isSaving} className="btn-primary gap-2 disabled:opacity-50">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Сохранить и начать
            </button>
          )}
        </footer>
      </main>

      <aside className="surface-elevated h-fit space-y-5 p-5">
        <div>
          <p className="kicker">Live preview</p>
          <h2 className="text-lg font-semibold text-foreground">{starterTrack}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {profile.goal || "Цель появится здесь после заполнения."}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-background/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Стартовая нагрузка</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{profile.hoursPerWeek}ч/нед</p>
          <p className="mt-1 text-sm text-muted-foreground">Горизонт: {profile.targetMonths} мес.</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Что будет дальше</p>
          {roadmap.slice(0, 4).map((item, index) => (
            <div key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[10px] font-semibold text-primary">
                {index + 1}
              </span>
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>

        <Link href={recommendedHref} className="btn-secondary w-full justify-center gap-2">
          Посмотреть трек
          <ArrowRight className="h-4 w-4" />
        </Link>
      </aside>
    </section>
  );
}

function RangeCard({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-sm font-semibold text-primary">
          {value} {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 w-full accent-primary"
      />
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
