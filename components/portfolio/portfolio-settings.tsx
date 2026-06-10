"use client";

import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Globe, Lock, Loader2 } from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function PortfolioSettings({
  initialSlug,
  initialIsPublic,
}: {
  initialSlug: string;
  initialIsPublic: boolean;
}) {
  const [slug, setSlug] = useState(initialSlug);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const { toast } = useToast();

  const publicUrl =
    typeof window !== "undefined" && slug ? `${window.location.origin}/p/${slug}` : `/p/${slug || "your-slug"}`;

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicSlug: slug || null, isPublic }),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Не удалось сохранить настройки");
      }

      const text = isPublic ? "Публичная ссылка обновлена." : "Портфолио скрыто.";
      setMessage({ text, error: false });
      toast.success("Настройки сохранены", text);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Не удалось сохранить настройки";
      setMessage({ text, error: true });
      toast.error("Ошибка сохранения", text);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!slug || typeof window === "undefined") return;

    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setMessage({ text: "Ссылка скопирована.", error: false });
    toast.success("Ссылка скопирована", url);
  }

  return (
    <section className="surface-elevated mb-5 p-4 sm:p-5">
      <form onSubmit={handleSave} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Public/share режим</h2>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-semibold",
                isPublic
                  ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                  : "border-amber-400/35 bg-amber-500/10 text-amber-200",
              )}
            >
              {isPublic ? "публично" : "скрыто"}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Публичный адрес</span>
              <div className="flex rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/20">
                <span className="flex items-center border-r border-border bg-muted/30 px-3 text-sm text-muted-foreground">
                  /p/
                </span>
                <input
                  type="text"
                  pattern="[a-zA-Z0-9-]+"
                  title="Only letters, numbers, and hyphens"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="alex-qa"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </div>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                aria-pressed={!isPublic}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                  !isPublic ? "border-amber-400/40 bg-amber-500/10 text-amber-200" : "border-border bg-background text-muted-foreground",
                )}
              >
                <Lock className="h-4 w-4" />
                Скрыто
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                aria-pressed={isPublic}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                  isPublic ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-border bg-background text-muted-foreground",
                )}
              >
                <Globe className="h-4 w-4" />
                Public
              </button>
            </div>
          </div>

          {isPublic && slug ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/5 px-3 py-2">
              <a href={`/p/${slug}`} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-2 text-sm text-emerald-200 hover:underline">
                <span className="truncate">{publicUrl}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
              <button type="button" onClick={handleCopy} className="btn-secondary ml-auto inline-flex items-center gap-2 px-3 py-1.5 text-xs">
                <Copy className="h-3.5 w-3.5" />
                Копировать
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Сохранить
          </button>
          {message ? (
            <p className={cn("text-sm", message.error ? "text-rose-400" : "text-emerald-400")}>{message.text}</p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
