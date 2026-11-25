"use client";

import { CLUBS } from "@/constants";
import { Shoot } from "@/models";
import { ChevronRight, Trash2 } from "lucide-react";
import { formatHistoryDate } from "./historyUtils";

type ShootHistoryCardProps = {
  currentUserId: string;
  onDelete: (shootId: string) => void;
  onOpenSummary: (shootId: string) => void;
  relationLabel?: string;
  shoot: Shoot;
  showUserScore?: boolean;
};

export function ShootHistoryCard({
  currentUserId,
  onDelete,
  onOpenSummary,
  relationLabel,
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
    <article className="border-b border-border py-4 first:border-t">
      <div>
        <button
          type="button"
          onClick={() => onOpenSummary(shoot.id)}
          aria-label={`Open shoot from ${date} at ${clubName}, ${metricLabel.toLowerCase()} ${metricValue}`}
          className="w-full min-w-0 rounded-sm py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <span className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2">
            <span className="min-w-0">
              <time
                dateTime={shoot.createdAt.toISOString()}
                className="block text-sm text-muted-foreground"
              >
                {date}
              </time>
              <span className="mt-1 block text-base font-semibold">
                {clubName}
              </span>
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
            <span className="col-span-2 flex flex-wrap gap-x-3 gap-y-1 text-xs leading-5 text-muted-foreground">
              <span>
                {shoot.completedStationCount}/{shoot.totalStations} stations
              </span>
              <span>
                {shoot.participants.length} archer
                {shoot.participants.length !== 1 ? "s" : ""}
                {shoot.guestCount > 0
                  ? ` · ${shoot.guestCount} guest${shoot.guestCount !== 1 ? "s" : ""}`
                  : ""}
              </span>
            </span>
          </span>
          {shoot.notes?.trim() && (
            <span className="mt-2 line-clamp-2 block text-sm text-muted-foreground truncate">
              {shoot.notes}
            </span>
          )}
        </button>
        {(relationLabel || shoot.isCreatedBy(currentUserId)) && (
          <div className="mt-1 flex  items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {relationLabel}
            </span>
            {shoot.isCreatedBy(currentUserId) && (
              <button
                type="button"
                onClick={() => onDelete(shoot.id)}
                aria-label={`Delete shoot from ${date} at ${clubName}`}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-sm px-2 text-xs text-muted-foreground hover:bg-card hover:text-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
