"use client";

import { Mode } from "@/models";
import { Card, RadioGroup } from "@radix-ui/themes";

type ModeSelectorCardProps = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export function ModeSelectorCard({
  mode,
  onModeChange,
}: ModeSelectorCardProps) {
  return (
    <Card className="p-6">
      <p className="font-semibold mb-4">Select Mode</p>
      <RadioGroup.Root
        value={mode}
        onValueChange={(value) => onModeChange(value as Mode)}
        color={mode === "red" ? "red" : "yellow"}
      >
        <div className="grid grid-cols-2 gap-4">
          <label
            htmlFor="red"
            className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              mode === "red"
                ? "border-red-500 bg-red-500/10"
                : "border-border hover:border-red-500/50"
            }`}
          >
            <RadioGroup.Item value={Mode.red} id="red" />
            <div className="flex-1 ml-2">
              <div className="font-semibold">Red Mode</div>
            </div>
          </label>

          <label
            htmlFor="yellow"
            className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              mode === "yellow"
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-border hover:border-yellow-500/50"
            }`}
          >
            <RadioGroup.Item value={Mode.yellow} id="yellow" />
            <div className="flex-1 ml-2">
              <div className="font-semibold">Yellow Mode</div>
            </div>
          </label>
        </div>
      </RadioGroup.Root>
    </Card>
  );
}
