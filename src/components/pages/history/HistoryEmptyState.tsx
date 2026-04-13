"use client";

import { Trophy } from "lucide-react";

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
    <div className={`text-center ${compact ? "py-12" : "py-12"}`}>
      <Trophy
        className={`${compact ? "w-12 h-12 mb-3" : "w-16 h-16 mb-4"} mx-auto text-muted-foreground`}
      />
      <h3 className={`${compact ? "font-semibold mb-2" : "font-semibold text-lg mb-2"}`}>
        {title}
      </h3>
      <p className={`${compact ? "text-sm" : ""} text-muted-foreground`}>
        {description}
      </p>
    </div>
  );
}
