"use client";

import { Button } from "@radix-ui/themes";
import { ArrowLeft } from "lucide-react";

type HistoryHeaderProps = {
  onBack: () => void;
};

export function HistoryHeader({ onBack }: HistoryHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background border-b">
      <div className="container max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" className="text-black" size="4">
            <ArrowLeft className="w-5 h-5 mr-1 text-black" />
          </Button>
          <h1 className="text-xl font-semibold">Shoot History</h1>
        </div>
      </div>
    </header>
  );
}
