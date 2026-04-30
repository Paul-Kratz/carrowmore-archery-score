"use client";

import { IShootParticipantWithScores } from "@/models";
import { Badge, Card, Table } from "@radix-ui/themes";
import { GuestBadge } from "@/components/shared/GuestBadge";
import { POSSIBLE_SCORES, getColourForScore, getScoreCounts } from "./summaryUtils";

type ParticipantSummaryCardProps = {
  currentUserId: string;
  participant: IShootParticipantWithScores;
};

export function ParticipantSummaryCard({
  currentUserId,
  participant,
}: ParticipantSummaryCardProps) {
  const counts = getScoreCounts(participant.roundScores);

  return (
    <Card className="p-4">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-3">
            <span className="font-bold">{participant.userInfo.name}</span>
            {participant.userInfo.isGuest && <GuestBadge />}
            {participant.userInfo.id === currentUserId &&
              !participant.userInfo.isGuest && (
              <Badge size="2" color="green" variant="surface">
                You
              </Badge>
              )}
          </div>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              {participant.roundScores.length} / 18 stations | Avg:{" "}
              {(participant.totalScore / participant.roundScores.length).toFixed(2)}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <h3 className="font-bold text-[var(--club-red-dark)]">
            {participant.totalScore}
          </h3>
          <p className="text-sm text-muted-foreground">points</p>
        </div>
      </div>

      <hr className="my-4" />

      <Table.Root>
        <Table.Header>
          <Table.Row>
            {POSSIBLE_SCORES.map((score) => (
              <Table.ColumnHeaderCell key={score}>{score}</Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            {POSSIBLE_SCORES.map((score) => {
              const count = counts.get(score) || 0;

              return (
                <Table.Cell
                  key={score}
                  className={count > 0 ? getColourForScore(score) : "text-gray-300"}
                >
                  {count}
                </Table.Cell>
              );
            })}
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </Card>
  );
}
