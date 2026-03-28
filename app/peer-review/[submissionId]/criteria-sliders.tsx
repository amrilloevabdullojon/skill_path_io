"use client";

import { useState } from "react";

interface SliderProps {
  name: string;
  label: string;
  description: string;
}

function CriterionSlider({ name, label, description }: SliderProps) {
  const [value, setValue] = useState(50);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <span className="text-sm font-mono text-muted-foreground w-10 text-right">
          {value}
        </span>
      </div>
      <input
        type="range"
        id={name}
        name={name}
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
        className="w-full accent-primary"
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function CriteriaSliders() {
  return (
    <>
      <CriterionSlider
        name="clarity"
        label="Clarity"
        description="How clearly is the answer written and organized?"
      />
      <CriterionSlider
        name="accuracy"
        label="Accuracy"
        description="How accurate and correct is the content?"
      />
      <CriterionSlider
        name="completeness"
        label="Completeness"
        description="Does the answer fully address the mission objectives?"
      />
    </>
  );
}
