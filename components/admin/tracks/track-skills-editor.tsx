"use client";

import { useState } from "react";

type TrackSkillsEditorProps = {
  /** Hidden input name submitted to the server action (e.g. "skills_raw" or "outcomes_raw") */
  name: string;
  label: string;
  placeholder: string;
  initialValues: string[];
};

const MAX_ITEMS = 20;

export function TrackSkillsEditor({
  name,
  label,
  placeholder,
  initialValues,
}: TrackSkillsEditorProps) {
  const [values, setValues] = useState<string[]>(
    initialValues.length > 0 ? initialValues : [""],
  );

  function handleChange(index: number, value: string) {
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleBlur(index: number) {
    setValues((prev) => {
      const next = [...prev];
      next[index] = next[index].trim();
      return next;
    });
  }

  function handleRemove(index: number) {
    setValues((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [""] : next;
    });
  }

  function handleAdd() {
    if (values.length >= MAX_ITEMS) return;
    setValues((prev) => [...prev, ""]);
  }

  // Produce a single newline-joined hidden input that matches what
  // updateTrackAction expects (skills_raw / outcomes_raw).
  const joined = values
    .map((v) => v.trim())
    .filter(Boolean)
    .join("\n");

  return (
    <div className="space-y-2">
      <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>

      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              placeholder={placeholder}
              maxLength={200}
              onChange={(e) => handleChange(index, e.target.value)}
              onBlur={() => handleBlur(index)}
              className="input-base flex-1"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="btn-secondary px-2 py-1 text-xs text-rose-400"
              aria-label={`Remove ${label} item`}
            >
              &times; Remove
            </button>
          </div>
        ))}
      </div>

      {values.length < MAX_ITEMS && (
        <button
          type="button"
          onClick={handleAdd}
          className="btn-secondary mt-2 text-sm text-sky-400"
        >
          ＋ Add
        </button>
      )}

      {/* Single hidden input with newline-separated values — matches actions.ts */}
      <input type="hidden" name={name} value={joined} />
    </div>
  );
}
