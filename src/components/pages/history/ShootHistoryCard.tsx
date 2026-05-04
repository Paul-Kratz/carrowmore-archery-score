"use client";

import { GuestBadge } from "@/components/shared/GuestBadge";
import { IShootWithParticipants } from "@/models";
import { Button } from "@radix-ui/themes";
import { ChevronRight, Notebook, Trash2 } from "lucide-react";
import {
  formatHistoryDate,
  getShootCompletionStats,
  getTopScorer,
  getUserScore,
  getUserStanding,
  truncateString,
} from "./historyUtils";

type ShootHistoryCardProps = {
  currentUserId: string;
  onDelete: (shootId: string) => void;
  onOpenSummary: (shootId: string) => void;
  relationLabel?: string;
  shoot: IShootWithParticipants;
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
  const topScorer = getTopScorer(shoot);
  const userScore = showUserScore ? getUserScore(shoot, currentUserId) : null;
  const userStanding = showUserScore
    ? getUserStanding(shoot, currentUserId)
    : null;
  const completionStats = getShootCompletionStats(shoot);
  const modeColor = shoot.mode === "red" ? "#9f1418" : "#b8871a";
  const primaryMetric = userScore
    ? {
        label: "Your score",
        value: `${userScore.score}`,
        subtext: userStanding
          ? `Rank ${userStanding.rank}/${userStanding.participantCount}`
          : `${userScore.completed}/18 stations`,
      }
    : topScorer
      ? {
          label: "Top score",
          value: `${topScorer.score}`,
          subtext: topScorer.name,
        }
      : {
          label: "Top score",
          value: "-",
          subtext: "No scores",
        };

  return (
    <article className="w-full overflow-hidden rounded-xl border border-border p-0 border-l-6 border-l-(--club-gold-dark) shadow-sm transition-colors">
      <div className="px-4 py-3">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {relationLabel && (
                <>
                  <span>{relationLabel}</span>
                  <span aria-hidden="true">-</span>
                </>
              )}
              <span>
                {formatHistoryDate(new Date(shoot.createdAt).getTime())}
              </span>
              <span aria-hidden="true">-</span>
              <span className="inline-flex items-center gap-1 uppercase">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: modeColor }}
                />
                {shoot.mode}
              </span>
            </div>
            <h3 className="truncate text-base font-semibold leading-tight text-(--club-red-dark)">
              {primaryMetric.label}
            </h3>
          </div>
          <button
            type="button"
            className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card/70 hover:text-(--club-red-dark)"
            onClick={() => onOpenSummary(shoot.id)}
            aria-label={`Open shoot from ${formatHistoryDate(
              new Date(shoot.createdAt).getTime(),
            )}`}
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-3xl font-bold leading-none text-(--club-red-dark)">
              {primaryMetric.value}
            </div>
            <div className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
              <span className="truncate">{primaryMetric.subtext}</span>
              {topScorer?.isGuest && !showUserScore && <GuestBadge />}
            </div>
          </div>

          <div className="shrink-0 text-right text-xs leading-5 text-muted-foreground">
            <div>
              {completionStats.participantCount} archer
              {completionStats.participantCount !== 1 ? "s" : ""}
            </div>
            <div>{completionStats.completedStations}/18 stations</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {completionStats.guestCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <GuestBadge />
              {completionStats.guestCount} guest
              {completionStats.guestCount !== 1 ? "s" : ""}
            </span>
          )}
          <span className="inline-flex min-w-0 items-center gap-1">
            <Notebook className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {shoot.notes ? truncateString(shoot.notes, 48) : "No notes"}
            </span>
          </span>
        </div>

        {shoot.createdBy === currentUserId && (
          <Button
            variant="ghost"
            color="red"
            onClick={() => onDelete(shoot.id)}
            aria-label="Delete shoot"
            className="h-8 w-8 shrink-0 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </article>
  );
}
