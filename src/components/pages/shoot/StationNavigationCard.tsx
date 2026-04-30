"use client";

import { Button, Card } from "@radix-ui/themes";
import { ArrowLeft, ArrowRight } from "lucide-react";

type StationNavigationCardProps = {
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentStation: number;
  disabled?: boolean;
  onStationChange: (station: number) => void;
  participantCount: number;
  stationCompletionCounts: number[];
};

export function StationNavigationCard({
  canGoNext,
  canGoPrevious,
  currentStation,
  disabled = false,
  onStationChange,
  participantCount,
  stationCompletionCounts,
}: StationNavigationCardProps) {
  const currentCompletion = stationCompletionCounts[currentStation - 1] ?? 0;

  return (
    <Card className="max-w-full overflow-hidden rounded-none border-x-0 border-b-0 bg-[var(--card)] px-2 py-1.5 pb-[calc(env(safe-area-inset-bottom)+0.375rem)]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="1"
          onClick={() => onStationChange(currentStation - 1)}
          disabled={!canGoPrevious || disabled}
        >
          <ArrowLeft className="w-6 h-6 text-[var(--club-red)]" />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <div className="text-xs text-muted-foreground">Station</div>
          <div className="text-xl font-bold leading-none text-[var(--club-red-dark)]">
            {currentStation}/18
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {currentCompletion}/{participantCount} archers scored
          </div>
        </div>
        <Button
          variant="ghost"
          size="1"
          onClick={() => onStationChange(currentStation + 1)}
          disabled={!canGoNext || disabled}
        >
          <ArrowRight className="w-6 h-6 text-[var(--club-red)]" />
        </Button>
      </div>

      <div className="flex max-w-full min-w-0 gap-1 overflow-x-auto px-1 pb-0.5">
        {Array.from({ length: 18 }, (_, index) => (
          <button
            key={index}
            onClick={() => onStationChange(index + 1)}
            disabled={disabled}
            className={`h-6 min-w-6 shrink-0 rounded text-[11px] font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
              index === currentStation - 1
                ? "bg-[var(--club-red)] text-primary-foreground ring-2 ring-[var(--club-gold)]"
                : `${
                    stationCompletionCounts[index] === participantCount &&
                    participantCount > 0
                      ? "bg-[var(--forest)] text-white"
                      : stationCompletionCounts[index] > 0
                        ? "bg-[var(--club-gold)] text-[var(--ink)]"
                        : "bg-muted text-[var(--ink)]"
                  }`
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </Card>
  );
}
