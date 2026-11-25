"use client";

import { TreePine } from "lucide-react";
import { oswald } from "@/fonts/oswald";
import type { ReactNode } from "react";

export function ScorebookHeader({ rightSlot }: { rightSlot?: ReactNode }) {
  return (
    <header className="bg-(--deep-forest-green) text-primary-foreground">
      <div className="mx-auto flex min-h-16 max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-2 sm:px-8">
        <p className={`${oswald.className} flex min-w-0 items-center gap-2.5 text-xl font-normal`}>
          <TreePine aria-hidden="true" className="h-6 w-6 shrink-0 text-(--sage-green)" />
          In the Forest
        </p>
        {rightSlot && <div className="ml-auto flex shrink-0 items-center">{rightSlot}</div>}
      </div>
    </header>
  );
}
