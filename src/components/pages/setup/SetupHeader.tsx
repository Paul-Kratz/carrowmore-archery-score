"use client";

import { Leaf, TreePine } from "lucide-react";

export function SetupHeader() {
  return (
    <header className="bg-[linear-gradient(135deg,var(--club-red-dark),var(--club-red))] text-primary-foreground border-b border-[var(--club-gold)]/60 shadow-lg">
      <div className="container max-w-2xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-[var(--club-gold)]/80 bg-white/10 shadow-inner">
              <TreePine className="w-6 h-6 text-[var(--club-gold)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">In the Forest</h1>
              <p className="text-xs font-medium text-[#dbe8bf]">
                Carrowmore Archers
              </p>
            </div>
          </div>
          <Leaf className="h-5 w-5 text-[var(--club-gold)]/80" />
        </div>
      </div>
    </header>
  );
}
