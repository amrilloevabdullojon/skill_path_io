"use client";

import { useState } from "react";
import { NotebookPen, Plus } from "lucide-react";

import { UserNote } from "@/types/personalization";

type ApiNote = {
  id: string;
  title: string;
  content: string;
  moduleRef: string;
  lessonRef: string;
  createdAt: string;
};

function mapTrack(moduleRef: string): UserNote["track"] {
  const normalized = moduleRef.toLowerCase();
  if (normalized.includes("ba") || normalized.includes("business")) {
    return "BA";
  }
  if (normalized.includes("da") || normalized.includes("data") || normalized.includes("sql")) {
    return "DA";
  }
  return "QA";
}

function toUserNote(note: ApiNote): UserNote {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    track: mapTrack(note.moduleRef),
    lessonRef: note.lessonRef || note.moduleRef || "General note",
    createdAt: note.createdAt,
  };
}

export function NotesBoard({ initialNotes }: { initialNotes: UserNote[] }) {
  const [notes, setNotes] = useState<UserNote[]>(initialNotes);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addNote() {
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          lessonRef: "Manual note",
          track: "QA",
        }),
      });
      if (!response.ok) {
        throw new Error("Unable to save note.");
      }

      const payload = (await response.json()) as { note?: ApiNote };
      if (payload.note) {
        setNotes((prev) => [toUserNote(payload.note as ApiNote), ...prev]);
      }
      setTitle("");
      setContent("");
    } catch {
      setError("Unable to save note right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeNote(id: string) {
    setNotes((prev) => prev.filter((item) => item.id !== id));
    setError(null);

    try {
      const response = await fetch(`/api/notes?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Unable to remove note.");
      }
    } catch {
      setError("Unable to remove note right now.");
    }
  }

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Notes</p>
        <h1 className="page-title">Personal learning notes</h1>
        <p className="section-description">Save key ideas, shortcuts, and reminders for quick review later.</p>
      </header>

      <article className="surface-elevated space-y-3 p-4">
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="input-base" placeholder="Note title" />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="textarea-base min-h-[120px]"
          placeholder="Write your note..."
        />
        <button type="button" onClick={addNote} disabled={isSubmitting} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Add note"}
        </button>
        {error ? <p className="text-xs text-rose-300">{error}</p> : null}
      </article>

      <div className="grid gap-4 xl:grid-cols-2">
        {notes.map((note) => (
          <article key={note.id} className="surface-elevated space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{note.title}</p>
              <button type="button" onClick={() => removeNote(note.id)} className="text-xs text-muted-foreground hover:text-foreground">
                Remove
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{note.content}</p>
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <NotebookPen className="h-3.5 w-3.5" />
              {note.lessonRef}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
