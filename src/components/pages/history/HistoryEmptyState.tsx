"use client";

import { TreePine } from "lucide-react";

type HistoryEmptyStateProps = {
  title: string;
  description: string;
  compact?: boolean;
};

export function HistoryEmptyState({
  title,
  description,
  compact = false,
}: HistoryEmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-border bg-[var(--card)]/80 text-center ${
        compact ? "px-4 py-10" : "px-4 py-12"
      }`}
    >
      <div
        className={`mx-auto mb-3 grid place-items-center rounded-full bg-[#edf4e9] text-[var(--deep-forest-green)] ${
          compact ? "h-12 w-12" : "h-16 w-16"
        }`}
      >
        <TreePine className={compact ? "h-7 w-7" : "h-9 w-9"} />
      </div>
      <h3
        className={`text-[var(--deep-forest-green)] ${
          compact ? "font-semibold mb-2" : "font-semibold text-lg mb-2"
        }`}
      >
        {title}
      </h3>
      <p className={`${compact ? "text-sm" : ""} text-muted-foreground`}>
        {description}
      </p>
    </div>
  );
}
