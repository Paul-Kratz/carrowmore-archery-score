"use client";

import { IShootParticipantWithScores } from "@/models";
import { Card } from "@radix-ui/themes";

type ShootStatsCardProps = {
  selectedParticipant: IShootParticipantWithScores | null;
};

export function ShootStatsCard({ selectedParticipant }: ShootStatsCardProps) {
  const completedCount = selectedParticipant
    ? selectedParticipant.roundScores.filter((score) => score !== null).length
    : 0;

  const average = (
    (selectedParticipant?.totalScore || 0) / Math.max(completedCount, 1)
  ).toFixed(1);

  return (
    <Card className="m-2 p-4 bg-muted/50">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{selectedParticipant?.totalScore}</div>
          <div className="text-xs text-muted-foreground">Total Score</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{completedCount}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{average}</div>
          <div className="text-xs text-muted-foreground">Average</div>
        </div>
      </div>
    </Card>
  );
}
