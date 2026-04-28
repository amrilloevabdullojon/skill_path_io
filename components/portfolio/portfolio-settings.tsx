"use client";

import { useState } from "react";
import { Copy, ExternalLink, Globe, Lock } from "lucide-react";

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

  const publicUrl = typeof window !== "undefined" && slug ? `${window.location.origin}/p/${slug}` : `/p/${slug || "your-slug"}`;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicSlug: slug || null, isPublic }),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Failed to update settings");
      }

      setMessage({ text: "Настройки портфолио обновлены!", error: false });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Failed to update settings", error: true });
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (typeof window !== "undefined" && slug) {
      navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
      setMessage({ text: "Ссылка скопирована в буфер обмена!", error: false });
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div className="surface-elevated space-y-4 p-5 sm:p-6 mb-8">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Globe className="h-4 w-4 text-indigo-400" /> Настройки видимости
        </h2>
        <p className="text-sm text-muted-foreground">
          Сделайте свое портфолио публичным и делитесь успехами с рекрутерами.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Пользовательский URL</label>
            <div className="flex rounded-lg border border-border bg-card focus-within:ring-2 focus-within:ring-indigo-500/20">
              <span className="flex items-center px-3 text-sm text-muted-foreground border-r border-border bg-muted/30">
                skillpath.io/p/
              </span>
              <input
                type="text"
                pattern="[a-zA-Z0-9-]+"
                title="Only letters, numbers, and hyphens"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="alex-qa"
                className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 text-foreground"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Только английские буквы, цифры и дефис.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Видимость</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border text-sm transition-colors ${
                  !isPublic
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                }`}
              >
                <Lock className="h-4 w-4 mb-1" />
                Скрыто
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border text-sm transition-colors ${
                  isPublic
                    ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                }`}
              >
                <Globe className="h-4 w-4 mb-1" />
                Публично
              </button>
            </div>
          </div>
        </div>

        {isPublic && slug && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <a
              href={`/p/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-emerald-300 flex items-center gap-2 hover:underline truncate"
            >
              {publicUrl} <ExternalLink className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25 transition-colors flex items-center gap-1.5"
            >
              <Copy className="h-3 w-3" /> Копировать
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          {message && (
            <p className={`text-sm ${message.error ? "text-rose-400" : "text-emerald-400"}`}>
              {message.text}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
