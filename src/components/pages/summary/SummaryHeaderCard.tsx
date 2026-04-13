"use client";

import { IShootWithParticipants } from "@/models";
import { Badge, Card } from "@radix-ui/themes";
import { Calendar, Notebook, Users } from "lucide-react";
import { formatSummaryDate } from "./summaryUtils";

type SummaryHeaderCardProps = {
  currentUserId: string;
  shootInfo: IShootWithParticipants;
};

export function SummaryHeaderCard({
  currentUserId,
  shootInfo,
}: SummaryHeaderCardProps) {
  const createdAtTimestamp = new Date(shootInfo.createdAt).getTime();

  return (
    <Card className="p-6 space-y-2">
      <h2 className="text-2xl font-bold">
        {formatSummaryDate(createdAtTimestamp, false)}
      </h2>
      <Badge
        radius="large"
        color={shootInfo.mode === "red" ? "red" : "yellow"}
        variant="surface"
        size="3"
      >
        {shootInfo.mode}
      </Badge>
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Notebook className="w-3 h-3" />
          {shootInfo.notes ? shootInfo.notes : "No notes"}
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {shootInfo.participants.length} participant
          {shootInfo.participants.length !== 1 ? "s" : ""}
          {shootInfo.createdBy === currentUserId && " (tracked by you)"}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatSummaryDate(createdAtTimestamp, true)}
        </div>
      </div>
    </Card>
  );
}
