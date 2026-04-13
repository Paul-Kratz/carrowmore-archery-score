"use client";

import { Button, Card } from "@radix-ui/themes";
import { ArrowLeft, ArrowRight } from "lucide-react";

type StationNavigationCardProps = {
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentStation: number;
  onStationChange: (station: number) => void;
  stationScores: (number | null)[];
};

export function StationNavigationCard({
  canGoNext,
  canGoPrevious,
  currentStation,
  onStationChange,
  stationScores,
}: StationNavigationCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="1"
          onClick={() => onStationChange(currentStation - 1)}
          disabled={!canGoPrevious}
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </Button>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Station</div>
          <div className="text-3xl font-bold">{currentStation}</div>
        </div>
        <Button
          variant="ghost"
          size="1"
          onClick={() => onStationChange(currentStation + 1)}
          disabled={!canGoNext}
        >
          <ArrowRight className="w-6 h-6 text-primary" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1 justify-center">
        {Array.from({ length: 18 }, (_, index) => (
          <button
            key={index}
            onClick={() => onStationChange(index + 1)}
            className={`w-8 h-8 rounded text-sm font-medium ${
              index === currentStation - 1
                ? "bg-primary text-primary-foreground"
                : `${stationScores[index] !== null ? "bg-green-700/80 text-white" : "bg-muted"}`
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </Card>
  );
}
