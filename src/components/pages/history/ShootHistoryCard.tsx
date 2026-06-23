"use client";

import { GuestBadge } from "@/components/shared/GuestBadge";
import { CLUBS, getPegColorHex } from "@/constants";
import { getParticipantPegColorSummary } from "@/helpers/pegColors";
import { Shoot } from "@/models";
import { Badge, Button } from "@radix-ui/themes";
import {
  BowArrow,
  ChevronRight,
  Notebook,
  NotebookPen,
  Trash2,
} from "lucide-react";
import {
  formatHistoryDate,
  truncateString,
} from "./historyUtils";

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
  const topScorer = shoot.topScorer;
  const userParticipant = showUserScore ? shoot.currentUserParticipant : null;

  const clubName = CLUBS[shoot.clubId || "carrowmore"]?.name ?? shoot.clubId;
  const { pegColors } = getParticipantPegColorSummary(shoot.participants);
  const primaryMetric = userParticipant
    ? {
        label: "Your score",
        value: `${userParticipant.totalScore}`,
      }
    : topScorer
      ? {
          label: "Top score",
          value: `${topScorer.totalScore}`,
        }
      : {
          label: "Top score",
          value: "-",
        };

  return (
    <article className="w-full overflow-hidden rounded-xl border border-border p-0 border-l-6 border-l-(--olive-green) shadow-sm transition-colors">
      <div className="px-4 py-3">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>
                {formatHistoryDate(new Date(shoot.createdAt).getTime())}
              </span>
              <span aria-hidden="true">|</span>

              {relationLabel && (
                <>
                  <BowArrow className="w-4" />
                  {relationLabel === "Shot & tracked" && (
                    <NotebookPen className="w-4" />
                  )}
                  <span aria-hidden="true">|</span>
                </>
              )}

              <span className="inline-flex items-center gap-1">
                {pegColors.slice(0, 3).map((pegColor) => (
                  <span
                    key={pegColor}
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: getPegColorHex(pegColor) }}
                  />
                ))}
              </span>
              <span aria-hidden="true">|</span>
              <Badge color="gray">{clubName}</Badge>
            </div>
          </div>
          <button
            type="button"
            className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card/70 hover:text-(--deep-forest-green)"
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
            <h3 className="truncate text-base font-semibold leading-tight text-(--deep-forest-green) mb-2">
              {primaryMetric.label}
            </h3>
            <div className="text-3xl font-bold leading-none text-(--deep-forest-green)">
              {primaryMetric.value}
            </div>

            <div className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
              {topScorer?.isGuest && !userParticipant && <GuestBadge />}
            </div>
          </div>

          <div className="shrink-0 text-right text-xs leading-5 text-muted-foreground">
            <div>
              {shoot.participants.length} archer
              {shoot.participants.length !== 1 ? "s" : ""}
            </div>
            <div>
              {shoot.completedStationCount}/{shoot.totalStations} stations
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {shoot.guestCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <GuestBadge />
              {shoot.guestCount} guest
              {shoot.guestCount !== 1 ? "s" : ""}
            </span>
          )}
          <span className="inline-flex min-w-0 items-center gap-1">
            <Notebook className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {shoot.notes ? truncateString(shoot.notes, 48) : "No notes"}
            </span>
          </span>
        </div>

        {shoot.isCreatedBy(currentUserId) && (
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
