"use client";

import { TreePine } from "lucide-react";
import type { ReactNode } from "react";

type HistoryEmptyStateProps = {
  title: string;
  description: string;
  compact?: boolean;
  action?: ReactNode;
};

export function HistoryEmptyState({ title, description, compact = false, action }: HistoryEmptyStateProps) {
  return (
    <div className={`text-center ${compact ? "px-4 py-10" : "px-4 py-14"}`}>
      <TreePine aria-hidden="true" className="mx-auto mb-4 h-9 w-9 text-(--olive-green)" />
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
