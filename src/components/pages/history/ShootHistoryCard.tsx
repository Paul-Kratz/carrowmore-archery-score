"use client";

import { CLUBS } from "@/constants";
import { Shoot } from "@/models";
import { ChevronRight } from "lucide-react";
import { formatHistoryDate } from "./historyUtils";

type ShootHistoryCardProps = {
  onOpenSummary: (shootId: string) => void;
  shoot: Shoot;
  showUserScore?: boolean;
};

export function ShootHistoryCard({
  onOpenSummary,
  shoot,
  showUserScore = false,
}: ShootHistoryCardProps) {
  const userParticipant = showUserScore ? shoot.currentUserParticipant : null;
  const metricLabel = userParticipant ? "Your score" : "Top score";
  const metricValue =
    userParticipant?.totalScore ?? shoot.topScorer?.totalScore ?? "—";
  const clubName = CLUBS[shoot.clubId]?.name ?? shoot.clubId;
  const date = formatHistoryDate(shoot.createdAt.getTime());

  return (
    <article className="border-b border-border pb-1">
      <div>
        <button
          type="button"
          onClick={() => onOpenSummary(shoot.id)}
          aria-label={`Open shoot from ${date} at ${clubName}, ${metricLabel.toLowerCase()} ${metricValue}`}
          className="block min-h-11 w-full min-w-0 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <span className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3">
            <span className="min-w-0">
              <span className="block text-base font-semibold">{clubName}</span>
              {shoot.notes?.trim() && (
                <span className="mt-1 flex min-w-0 items-baseline gap-1 text-sm text-muted-foreground">
                  <span className="shrink-0 font-medium">Notes:</span>
                  <span className="min-w-0 truncate">{shoot.notes}</span>
                </span>
              )}
            </span>
            <span className="flex items-center gap-2 text-right">
              <span>
                <span className="block text-xs text-muted-foreground">
                  {metricLabel}
                </span>
                <span className="block text-2xl leading-tight font-semibold tabular-nums">
                  {metricValue}
                </span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className="h-4 w-4 text-muted-foreground"
              />
            </span>
          </span>
        </button>
        <div className="flex min-h-8 items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {shoot.participants.length}{" "}
            {shoot.participants.length === 1 ? "archer" : "archers"}
          </span>
        </div>
      </div>
    </article>
  );
}
