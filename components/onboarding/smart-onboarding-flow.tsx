"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Target } from "lucide-react";

import { buildStarterRoadmap, starterTrackByProfession } from "@/lib/personalization/onboarding-presets";
import { OnboardingProfile, TrackTag, UserKnowledgeLevel } from "@/types/personalization";

const levels: Array<{ value: UserKnowledgeLevel; label: string }> = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "FOUNDATION", label: "Foundation" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const tracks: TrackTag[] = ["QA", "BA", "DA"];

const interestOptions = [
  "API Testing",
  "Bug Reporting",
  "User Stories",
  "SQL",
  "Dashboards",
  "Automation",
  "Stakeholder Communication",
];

export function SmartOnboardingFlow({ initialProfile }: { initialProfile: OnboardingProfile }) {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const starterTrack = useMemo(() => starterTrackByProfession(profile.profession), [profile.profession]);
  const roadmap = useMemo(() => buildStarterRoadmap(profile.profession), [profile.profession]);

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
        throw new Error("Could not save onboarding profile");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Onboarding save failed");
    } finally {
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

  return (
    <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <article className="surface-elevated space-y-5 p-5 sm:p-6">
        <header className="space-y-2">
          <p className="kicker">Smart Onboarding</p>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Build your personal learning plan</h1>
          <p className="text-sm text-muted-foreground">
            Tell us your goal and weekly capacity. SkillPath will adapt roadmap, missions, and recommendations.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-muted-foreground">
            Target profession
            <select
              value={profile.profession}
              onChange={(event) =>
                setProfile((prev) => ({
                  ...prev,
                  profession: event.target.value as TrackTag,
                }))
              }
              className="select-base"
            >
              {tracks.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-muted-foreground">
            Current level
            <select
              value={profile.currentLevel}
              onChange={(event) =>
                setProfile((prev) => ({
                  ...prev,
                  currentLevel: event.target.value as UserKnowledgeLevel,
                }))
              }
              className="select-base"
            >
              {levels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-muted-foreground md:col-span-2">
            Main goal
            <input
              value={profile.goal}
              onChange={(event) => setProfile((prev) => ({ ...prev, goal: event.target.value }))}
              className="input-base"
              placeholder="Become Junior QA in 3 months"
            />
          </label>

          <label className="space-y-2 text-sm text-muted-foreground">
            Hours per week
            <input
              type="number"
              min={1}
              max={30}
              value={profile.hoursPerWeek}
              onChange={(event) =>
                setProfile((prev) => ({
                  ...prev,
                  hoursPerWeek: Number(event.target.value),
                }))
              }
              className="input-base"
            />
          </label>

          <label className="space-y-2 text-sm text-muted-foreground">
            Target timeline (months)
            <input
              type="number"
              min={1}
              max={18}
              value={profile.targetMonths}
              onChange={(event) =>
                setProfile((prev) => ({
                  ...prev,
                  targetMonths: Number(event.target.value),
                }))
              }
              className="input-base"
            />
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Skills of interest</p>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((option) => {
              const active = profile.interests.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleInterest(option)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-sky-400/40 bg-sky-500/15 text-sky-200"
                      : "border-border bg-card/80 text-muted-foreground hover:border-border/70"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {errorText ? <p className="state-error">{errorText}</p> : null}

        <button type="button" onClick={saveProfile} className="btn-primary inline-flex items-center gap-2" disabled={isSaving}>
          {isSaving ? "Saving plan..." : "Save and open dashboard"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </article>

      <aside className="surface-elevated space-y-4 p-5 sm:p-6">
        <p className="kicker">Personal Start Plan</p>
        <div className="surface-subtle space-y-2 p-4">
          <p className="text-sm font-semibold text-foreground">Recommended starter track</p>
          <p className="inline-flex items-center gap-2 text-sm text-sky-200">
            <Sparkles className="h-4 w-4" />
            {starterTrack}
          </p>
        </div>

        <div className="surface-subtle space-y-3 p-4">
          <p className="text-sm font-semibold text-foreground">Roadmap preview</p>
          <ol className="space-y-2 text-sm text-muted-foreground">
            {roadmap.map((item, index) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card text-[11px] text-muted-foreground">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="surface-subtle p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
            <Target className="h-4 w-4" />
            Goal horizon: {profile.targetMonths} months
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Weekly load target: {profile.hoursPerWeek}h/week. Adaptive engine will adjust pace using your quiz, mission, and simulation performance.
          </p>
        </div>
      </aside>
    </section>
  );
}
