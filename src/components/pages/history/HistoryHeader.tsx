"use client";

import { Button } from "@radix-ui/themes";
import { ArrowLeft } from "lucide-react";

type HistoryHeaderProps = {
  onBack: () => void;
};

export function HistoryHeader({ onBack }: HistoryHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[var(--club-red)] text-primary-foreground border-b-4 border-[var(--club-gold)] shadow-lg">
      <div className="container max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-primary-foreground"
            size="4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
          </Button>
          <h1 className="text-xl font-bold">Shoot History</h1>
        </div>
      </div>
    </header>
  );
}
