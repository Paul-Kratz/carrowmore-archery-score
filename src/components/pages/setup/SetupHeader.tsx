"use client";

import { Target } from "lucide-react";

export function SetupHeader() {
  return (
    <header className="bg-background border-b">
      <div className="container max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6" />
            <h1 className="text-xl font-semibold">In the Forest</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
