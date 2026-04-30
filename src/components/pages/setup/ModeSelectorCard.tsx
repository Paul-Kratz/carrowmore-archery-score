"use client";

import { Mode } from "@/models";
import { Card, RadioGroup } from "@radix-ui/themes";
import { CircleDot, Map } from "lucide-react";

type ModeSelectorCardProps = {
  disabled?: boolean;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export function ModeSelectorCard({
  disabled = false,
  mode,
  onModeChange,
}: ModeSelectorCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-[var(--club-red-dark)] px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-[var(--club-gold)]" />
          <h2 className="text-base font-bold">Choose trail</h2>
        </div>
      </div>
      <RadioGroup.Root
        value={mode}
        onValueChange={(value) => onModeChange(value as Mode)}
        disabled={disabled}
      >
        <div className="grid grid-cols-2 gap-3 p-4">
          <label
            htmlFor="red"
            className={`min-h-28 cursor-pointer rounded-xl border-2 p-4 transition-colors ${
              mode === "red"
                ? "border-[var(--club-red-dark)] bg-[#dbe8d1] shadow-sm"
                : "border-border bg-[var(--card)] hover:border-[var(--club-red-dark)]"
            }`}
          >
            <div className="flex h-full flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <RadioGroup.Item value={Mode.red} id="red" />
                <CircleDot className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-lg font-bold">Red</div>
                <div className="text-xs text-muted-foreground">Route markers</div>
              </div>
            </div>
          </label>

          <label
            htmlFor="yellow"
            className={`min-h-28 cursor-pointer rounded-xl border-2 p-4 transition-colors ${
              mode === "yellow"
                ? "border-[var(--club-red-dark)] bg-[#dbe8d1] shadow-sm"
                : "border-border bg-[var(--card)] hover:border-[var(--club-red-dark)]"
            }`}
          >
            <div className="flex h-full flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <RadioGroup.Item value={Mode.yellow} id="yellow" />
                <CircleDot className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-lg font-bold">Yellow</div>
                <div className="text-xs text-muted-foreground">Route markers</div>
              </div>
            </div>
          </label>
        </div>
      </RadioGroup.Root>
    </Card>
  );
}
