"use client";

import { ShootParticipant } from "@/models";
import { GuestBadge } from "@/components/shared/GuestBadge";
import { getClubScoreValues } from "./summaryUtils";
import { CLUBS, getPegColorHex, getPegColorLabel } from "@/constants";

const getScoreCountTone = (score: number) => {
  if (score >= 16)
    return "border-[#b9c899] bg-[#eef3df] text-(--deep-forest-green)";
  if (score >= 10)
    return "border-[#cad8a9] bg-[#f2f5e8] text-(--deep-forest-green)";
  if (score >= 4) return "border-[#d7c69f] bg-[#f7efd9] text-(--warm-brown)";
  return "border-[#d9b2aa] bg-[#f5e3dd] text-[#7d2d25]";
};

type ParticipantSummaryCardProps = {
  participant: ShootParticipant;
  clubId: string;
};

export function ParticipantSummaryCard({
  participant,
  clubId,
}: ParticipantSummaryCardProps) {
  const clubData = CLUBS[clubId];
  const clubScoreValues = getClubScoreValues(clubId);
  const counts = participant.getScoreCounts(clubScoreValues);
  const averageScore = participant.averageScore.toFixed(2);

  return (
    <article className="w-full overflow-hidden rounded-xl border border-border bg-card/95 p-0 shadow-sm">
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="truncate font-bold text-(--deep-forest-green)">
                {participant.getParticipantLabel()}
              </span>
              {!!participant.guestName && <GuestBadge />}
              {participant.isCurrentUser && (
                <span className="rounded-full border border-border bg-[#dfe7c7] px-2 py-0.5 text-xs font-bold text-(--deep-forest-green)">
                  You
                </span>
              )}
              {participant.pegColor && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-xs font-bold text-(--deep-forest-green)">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: getPegColorHex(participant.pegColor),
                    }}
                  />
                  {getPegColorLabel(participant.pegColor)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>
                {participant.completedStationCount} / {clubData.totalStations}{" "}
                stations
              </span>
              <span>Avg {averageScore}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-3xl font-bold leading-none text-(--deep-forest-green)">
              {participant.totalScore}
            </div>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        </div>

        <div
          aria-label="Score totals"
          className="overflow-hidden rounded-lg border border-border/70 bg-[#fbf7e8]/80"
        >
          <div className="grid grid-cols-[1fr_auto] border-b border-border/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            <span>Score</span>
            <span>Times</span>
          </div>
          {clubScoreValues.map((score) => {
            const count = counts.get(score) || 0;
            const countLabel = count === 1 ? "time" : "times";

            return (
              <div
                key={score}
                aria-label={`Score ${score} count ${count}`}
                className={`grid grid-cols-[minmax(0,1fr)_minmax(92px,auto)] items-center gap-3 border-b px-3 py-2.5 last:border-b-0 ${getScoreCountTone(score)}`}
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    Score
                  </div>
                  <div className="font-bold leading-tight">{score} points</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    Times scored
                  </div>
                  <div className="text-lg font-bold leading-tight">
                    {count} {countLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
