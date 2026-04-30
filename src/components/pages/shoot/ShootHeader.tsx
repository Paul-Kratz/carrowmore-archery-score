"use client";

import { Button } from "@radix-ui/themes";
import { Home, TreePine } from "lucide-react";
import { ReactNode } from "react";

type ShootHeaderProps = {
  exitTrigger?: ReactNode;
};

export function ShootHeader({ exitTrigger }: ShootHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[var(--club-red)] text-primary-foreground border-b-4 border-[var(--club-gold)] shadow-lg">
      <div className="container max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--club-gold)] bg-[var(--club-red-dark)]">
              <TreePine className="w-6 h-6 text-[var(--club-gold)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold">In the Forest</h1>
              <p className="text-xs text-[#dbe8bf]">Score round</p>
            </div>
          </div>

          {exitTrigger ?? (
            <Button variant="ghost" size="1" className="p-4 text-primary-foreground">
              <Home className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
