"use client";

import { Button } from "@radix-ui/themes";
import { Home, Target } from "lucide-react";
import { ReactNode } from "react";

type ShootHeaderProps = {
  exitTrigger?: ReactNode;
};

export function ShootHeader({ exitTrigger }: ShootHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background border-b">
      <div className="container max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-semibold">In the Forest</h1>
            </div>
          </div>

          {exitTrigger ?? (
            <Button variant="ghost" size="1" className="p-4">
              <Home className="w-5 h-5" color="black" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
