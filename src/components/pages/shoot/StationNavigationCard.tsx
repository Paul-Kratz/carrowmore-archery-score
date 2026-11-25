"use client";

import { Select } from "@radix-ui/themes";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { scorebookStyles, scorebookTheme } from "@/components/shared/scorebookTheme";

type StationNavigationCardProps = {
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentStation: number;
  disabled?: boolean;
  onStationChange: (station: number) => void;
  participantCount: number;
  stationCompletionCounts: number[];
  totalStations: number;
};

export function StationNavigationCard({
  canGoNext,
  canGoPrevious,
  currentStation,
  disabled = false,
  onStationChange,
  participantCount,
  stationCompletionCounts,
  totalStations,
}: StationNavigationCardProps) {
  const arrowClass = "flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-input bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-35";
  return (
    <nav aria-label="Station navigation" className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <button type="button" className={arrowClass} aria-label="Previous station" onClick={() => onStationChange(currentStation - 1)} disabled={!canGoPrevious || disabled}>
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <Select.Root value={String(currentStation)} disabled={disabled} onValueChange={(value) => onStationChange(Number(value))} size="3">
            <Select.Trigger aria-label="Choose station" variant="surface" className="min-h-12! w-full! justify-between! border! border-input! bg-card! text-foreground! shadow-none!">
              <span><span className="sr-only min-[360px]:not-sr-only">Station </span>{currentStation} of {totalStations}</span>
            </Select.Trigger>
            <Select.Content highContrast position="popper" side="top" align="center" style={scorebookTheme} className={`${scorebookStyles.menu} max-h-[min(22rem,var(--radix-select-content-available-height))]! min-w-[var(--radix-select-trigger-width)]!`}>
              {Array.from({ length: totalStations }, (_, index) => (
                <Select.Item key={index} value={String(index + 1)} className="min-h-11! text-sm!">
                  Station {index + 1} · {stationCompletionCounts[index] ?? 0}/{participantCount} scored
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
        <button type="button" className={arrowClass} aria-label="Next station" onClick={() => onStationChange(currentStation + 1)} disabled={!canGoNext || disabled}>
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}
