"use client";

import { Mode } from "@/models";
import { Card, RadioGroup } from "@radix-ui/themes";
import { CircleDot, Map } from "lucide-react";

type ModeSelectorCardProps = {
  disabled?: boolean;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  availableModes: Mode[];
};

export function ModeSelectorCard({
  disabled = false,
  mode,
  onModeChange,
  availableModes,
}: ModeSelectorCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-(--club-red-dark) rounded-sm px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-(--club-gold)" />
          <h2 className="text-base font-bold">Choose trail</h2>
        </div>
      </div>
      <RadioGroup.Root
        value={mode}
        onValueChange={(value) => onModeChange(value as Mode)}
        disabled={disabled}
      >
        <div className="grid grid-cols-2 gap-3 p-4">
          {availableModes.map((availableMode) => (
            <label
              key={availableMode}
              htmlFor={availableMode}
              className={`min-h-28 cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                mode === availableMode
                  ? "border-(--club-red-dark) bg-[#dbe8d1] shadow-sm"
                  : "border-border bg-card hover:border-(--club-red-dark)"
              }`}
            >
              <div className="flex h-full flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <RadioGroup.Item value={availableMode} id={availableMode} />
                  <CircleDot className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-lg font-bold capitalize">
                    {availableMode}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Route markers
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </RadioGroup.Root>
    </Card>
  );
}
