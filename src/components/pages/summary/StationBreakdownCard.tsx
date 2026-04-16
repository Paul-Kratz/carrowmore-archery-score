"use client";

import { IShootParticipantWithScores } from "@/models";
import { GuestBadge } from "@/components/shared/GuestBadge";
import { Card, Table } from "@radix-ui/themes";
import { getColourForScore } from "./summaryUtils";

type StationBreakdownCardProps = {
  participants: IShootParticipantWithScores[];
};

export function StationBreakdownCard({
  participants,
}: StationBreakdownCardProps) {
  return (
    <Card className="p-6 space-y-4">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            {Array.from({ length: 18 }, (_, index) => (
              <Table.ColumnHeaderCell key={index}>{index + 1}</Table.ColumnHeaderCell>
            ))}
            <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {participants.map((participant) => (
            <Table.Row key={participant.id}>
              <Table.Cell className="font-bold">
                <div className="flex items-center gap-2">
                  <span>{participant.userInfo.name}</span>
                  {participant.userInfo.isGuest && <GuestBadge />}
                </div>
              </Table.Cell>
              {participant.roundScores.map((score, index) => (
                <Table.Cell key={index} className={getColourForScore(score)}>
                  {score}
                </Table.Cell>
              ))}
              <Table.Cell className="font-bold">{participant.totalScore}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Card>
  );
}
