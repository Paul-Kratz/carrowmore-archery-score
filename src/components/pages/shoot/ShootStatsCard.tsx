"use client";

import { IDenormalizedParticipant } from "@/models";
import { Card } from "@radix-ui/themes";

type ShootStatsCardProps = {
  selectedParticipant: IDenormalizedParticipant | null;
};

export function ShootStatsCard({ selectedParticipant }: ShootStatsCardProps) {
  const completedCount = selectedParticipant
    ? selectedParticipant.scores.filter((s) => s.score !== null).length
    : 0;

  const average = (
    (selectedParticipant?.totalScore || 0) / Math.max(completedCount, 1)
  ).toFixed(1);

  return (
    <Card className="m-2 p-4 bg-card">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-(--deep-forest-green)">
            {selectedParticipant?.totalScore}
          </div>
          <div className="text-xs text-muted-foreground">Total Score</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-(--emerald-green)">
            {completedCount}
          </div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-(--warm-brown)">
            {average}
          </div>
          <div className="text-xs text-muted-foreground">Average</div>
        </div>
      </div>
    </Card>
  );
}
