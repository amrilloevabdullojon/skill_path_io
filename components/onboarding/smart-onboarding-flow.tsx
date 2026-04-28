"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Target, Settings2, BriefcaseBusiness, Compass, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { buildStarterRoadmap, starterTrackByProfession } from "@/lib/personalization/onboarding-presets";
import { OnboardingProfile, TrackTag, UserKnowledgeLevel } from "@/types/personalization";

const levels: Array<{ value: UserKnowledgeLevel; label: string; desc: string }> = [
  { value: "BEGINNER", label: "Новичок", desc: "Никогда раньше не работал в IT" },
  { value: "FOUNDATION", label: "База", desc: "Знаю теорию, но нет реальной практики" },
  { value: "INTERMEDIATE", label: "Продвинутый", desc: "Уже работаю или имею хороший опыт" },
];

const tracks: Array<{ id: TrackTag; title: string; icon: React.ReactNode; color: string }> = [
  { id: "QA", title: "QA Инженер", icon: <Target className="h-5 w-5" />, color: "text-indigo-400 border-indigo-400 bg-indigo-500/10" },
  { id: "BA", title: "Бизнес-Аналитик", icon: <BriefcaseBusiness className="h-5 w-5" />, color: "text-violet-400 border-violet-400 bg-violet-500/10" },
  { id: "DA", title: "Data Аналитик", icon: <Settings2 className="h-5 w-5" />, color: "text-emerald-400 border-emerald-400 bg-emerald-500/10" },
];

const interestOptions = [
  "API Testing",
  "Баг-репорты",
  "User Stories",
  "SQL",
  "Графики и Дашборды",
  "Автоматизация",
  "Риски",
  "Работа с Заказчиком",
];

export function SmartOnboardingFlow({ initialProfile }: { initialProfile: OnboardingProfile }) {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const starterTrack = useMemo(() => starterTrackByProfession(profile.profession), [profile.profession]);
  const roadmap = useMemo(() => buildStarterRoadmap(profile.profession), [profile.profession]);

  const completionPercent = Math.round((step / totalSteps) * 100);

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

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Ошибка сохранения");
      setIsSaving(false);
    }
  }

  function toggleInterest(value: string) {
    setProfile((prev) => {
      const exists = prev.interests.includes(value);
      return {
        ...prev,
        interests: exists ? prev.interests.filter((item) => item !== value) : [...prev.interests, value],
      };
    });
  }

  const nextStep = () => {
    if (step < totalSteps) setStep(s => s + 1);
  };
  
  const prevStep = () => {
    if (step > 1) setStep(s => s - 1);
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] min-h-[600px]">
      {/* LEFT: WIZARD AREA */}
      <article className="surface-elevated flex flex-col justify-between overflow-hidden relative border border-border/50 shadow-xl p-0">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <header className="p-6 sm:p-8 pb-0 z-10">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-400" />
              <p className="kicker !mb-0 text-indigo-400">Умный Онбординг</p>
            </div>
            <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Пропустить пока →
            </Link>
          </div>

          <div className="pt-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
              <span>Шаг {step} из {totalSteps}</span>
              <span className="text-indigo-400">{completionPercent}%</span>
            </div>
            <div className="progress-track h-1.5 bg-muted/50 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-8 flex-grow relative z-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Выберите направление</h1>
                  <p className="text-muted-foreground text-sm">Какая карьерная цель вас интересует?</p>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-3">
                  {tracks.map((track) => {
                     const isSelected = profile.profession === track.id;
                     return (
                       <button
                         key={track.id}
                         onClick={() => setProfile((prev) => ({ ...prev, profession: track.id }))}
                         className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 ${isSelected ? `shadow-lg ${track.color}` : 'border-border/60 bg-card hover:border-indigo-500/30'}`}
                       >
                         {track.icon}
                         <span className="font-bold">{track.title}</span>
                       </button>
                     )
                  })}
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                  <p className="text-muted-foreground text-sm font-semibold">Ваш текущий уровень</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {levels.map((level) => {
                       const isSelected = profile.currentLevel === level.value;
                       return (
                         <button
                           key={level.value}
                           onClick={() => setProfile((prev) => ({ ...prev, currentLevel: level.value }))}
                           className={`flex flex-col items-start text-left gap-1 p-4 rounded-xl border transition-all ${isSelected ? 'border-indigo-400 bg-indigo-500/10' : 'border-border/60 bg-card hover:border-border'}`}
                         >
                           <span className={`font-bold ${isSelected ? 'text-indigo-300' : 'text-foreground'}`}>{level.label}</span>
                           <span className="text-[11px] text-muted-foreground leading-tight">{level.desc}</span>
                         </button>
                       )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Ваш ритм обучения</h1>
                  <p className="text-muted-foreground text-sm">ИИ-движок адаптивной системы подстроит нагрузку под вас.</p>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-foreground">Главная цель</span>
                  <input
                    value={profile.goal}
                    onChange={(event) => setProfile((prev) => ({ ...prev, goal: event.target.value }))}
                    className="input-base bg-card/50 px-4 py-3 text-lg"
                    placeholder="Например: Стать Junior QA через 3 месяца"
                  />
                </label>

                <div className="grid gap-6 sm:grid-cols-2 pt-2">
                  <div className="space-y-2">
                    <span className="text-sm font-bold text-foreground">Часов в неделю</span>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/50">
                      <input
                        type="range"
                        min={1}
                        max={40}
                        value={profile.hoursPerWeek}
                        onChange={(e) => setProfile({ ...profile, hoursPerWeek: Number(e.target.value) })}
                        className="w-full accent-indigo-400 cursor-pointer"
                      />
                      <span className="ml-4 font-bold text-indigo-400 w-8 text-right">{profile.hoursPerWeek}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-bold text-foreground">Горизонт (месяцы)</span>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/50">
                      <input
                        type="range"
                        min={1}
                        max={18}
                        value={profile.targetMonths}
                        onChange={(e) => setProfile({ ...profile, targetMonths: Number(e.target.value) })}
                        className="w-full accent-indigo-400 cursor-pointer"
                      />
                      <span className="ml-4 font-bold text-indigo-400 w-8 text-right">{profile.targetMonths}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Какие навыки вас интересуют?</h1>
                  <p className="text-muted-foreground text-sm">Выберите теги, и мы добавим больше профильных симуляций.</p>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-4">
                  {interestOptions.map((option) => {
                    const active = profile.interests.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleInterest(option)}
                        className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                          active
                            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25 scale-105"
                            : "bg-surface-subtle border border-border/60 text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {errorText ? (
                  <div className="mt-4 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200">
                    {errorText}
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wizard Footer Controls */}
        <footer className="p-6 sm:p-8 pt-4 flex items-center justify-between border-t border-border/30 bg-card/30 z-10">
           {step > 1 ? (
             <button onClick={prevStep} className="btn-secondary rounded-xl text-muted-foreground hover:text-foreground">
               Назад
             </button>
           ) : <div />}
           
           {step < totalSteps ? (
             <button onClick={nextStep} className="btn-primary flex items-center gap-2 rounded-xl">
               Далее <ArrowRight className="h-4 w-4" />
             </button>
           ) : (
             <button onClick={saveProfile} disabled={isSaving} className="btn-primary flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-500 shadow-lg shadow-indigo-500/25 border-none">
               {isSaving ? (
                 <><Loader2 className="h-4 w-4 animate-spin" /> Формируем профиль...</>
               ) : (
                 <><Sparkles className="h-4 w-4" /> Запустить Levio</>
               )}
             </button>
           )}
        </footer>
      </article>

      {/* RIGHT: ADAPTIVE PREVIEW PANEL */}
      <aside className="surface-elevated space-y-6 p-6 sm:p-8 bg-gradient-to-b from-card to-background border border-border/50">
        <header>
           <p className="kicker">Персональный План</p>
           <h3 className="text-xl font-bold text-foreground">Динамический тренажер</h3>
        </header>

        <div className="relative group">
           <div className="absolute inset-0 bg-indigo-500/5 rounded-xl transition-colors group-hover:bg-indigo-500/10" />
           <div className="relative p-5 space-y-3">
             <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Направление</p>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
                 <Sparkles className="h-5 w-5" />
               </div>
               <p className="text-lg font-bold text-foreground">{starterTrack}</p>
             </div>
           </div>
        </div>

        <div className="space-y-4 pt-2">
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Стартовый Roadmap</p>
          <div className="pl-2">
            <div className="space-y-4 border-l-2 border-muted/50 pl-6 relative">
              <AnimatePresence mode="popLayout">
                {roadmap.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    <span className="absolute -left-[35px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 ring-4 ring-card" />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-emerald-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Цель: {profile.targetMonths} мес.</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 max-w-[200px]">
                Нагрузка <strong className="text-emerald-400">{profile.hoursPerWeek}ч/нед</strong>. ИИ будет адаптировать темп в зависимости от ваших успехов в миссиях.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
