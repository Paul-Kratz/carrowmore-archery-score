"use client";

import { ShootParticipant } from "@/models";
import { GuestBadge } from "@/components/shared/GuestBadge";
import { CLUBS } from "@/constants";

type StationBreakdownCardProps = {
  participants: ShootParticipant[];
  clubId: string;
};

const getStationScoreTone = (score: number | null) => {
  if (score === null) {
    return {
      accent: "bg-border",
      className: "border-border/50 bg-card/55 text-muted-foreground",
    };
  }

  if (score >= 16) {
    return {
      accent: "bg-(--olive-green)",
      className: "border-[#b9c899] bg-[#eef3df]/85 text-(--deep-forest-green)",
    };
  }

  if (score >= 10) {
    return {
      accent: "bg-(--sage-green)",
      className: "border-[#cad8a9] bg-[#f2f5e8]/85 text-(--deep-forest-green)",
    };
  }

  if (score >= 4) {
    return {
      accent: "bg-(--warm-brown)",
      className: "border-[#d7c69f] bg-[#f7efd9]/85 text-(--warm-brown)",
    };
  }

  return {
    accent: "bg-[#a25a4d]",
    className: "border-[#d9b2aa] bg-[#f5e3dd]/85 text-[#7d2d25]",
  };
};

export function StationBreakdownCard({
  participants,
  clubId,
}: StationBreakdownCardProps) {
  return (
    <article className="bg-card/95 overflow-hidden rounded-xl border border-border p-3 shadow-sm">
      <div className="space-y-3">
        {participants.map((participant) => {
          const participantLabel = participant.getParticipantLabel();

          return (
            <section
              key={participant.id}
              className="rounded-lg border border-border/70 bg-card/75 p-3"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-bold text-(--deep-forest-green)">
                    <span className="truncate">{participantLabel}</span>
                    {!!participant.guestName && <GuestBadge />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {participant.completedStationCount} /{" "}
                    {CLUBS[clubId].totalStations} stations scored
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xl font-bold leading-none text-(--deep-forest-green)">
                    {participant.totalScore}
                  </div>
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Total
                  </div>
                </div>
              </div>

              <div
                className="grid grid-cols-6 gap-1.5"
                aria-label="Station scores"
              >
                {participant.scores.map((scoreData) => {
                  const tone = getStationScoreTone(scoreData.score);

                  return (
                    <div
                      key={scoreData.id || scoreData.roundNumber}
                      aria-label={`${participantLabel} station ${scoreData.roundNumber} score ${
                        scoreData.score ?? "not scored"
                      }`}
                      className={`min-h-12 overflow-hidden rounded-md border text-center ${tone.className}`}
                    >
                      <div className={`h-1 w-full ${tone.accent}`} />
                      <div className="px-1 py-1">
                        <div className="text-[10px] font-bold leading-tight text-muted-foreground">
                          {scoreData.roundNumber}
                        </div>
                        <div className="text-sm font-bold leading-tight">
                          {scoreData.score ?? "-"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </article>
  );
}
