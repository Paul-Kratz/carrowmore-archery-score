"use client";

import { IShootParticipantWithScores } from "@/models";
import { GuestBadge } from "@/components/shared/GuestBadge";
import { CLUBS } from "@/constants";

type StationBreakdownCardProps = {
  participants: IShootParticipantWithScores[];
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
    <article className="forest-chart-panel overflow-hidden rounded-xl border border-border p-3 shadow-sm">
      <div className="space-y-3">
        {participants.map((participant) => {
          const completedStations = participant.roundScores.filter(
            (score) => score !== null,
          ).length;

          return (
            <section
              key={participant.id}
              className="rounded-lg border border-border/70 bg-card/75 p-3"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-bold text-(--deep-forest-green)">
                    <span className="truncate">
                      {participant.userInfo.name}
                    </span>
                    {participant.userInfo.isGuest && <GuestBadge />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {completedStations} / {CLUBS[clubId].totalStations} stations
                    scored
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
                {participant.roundScores.map((score, index) => {
                  const tone = getStationScoreTone(score);

                  return (
                    <div
                      key={index}
                      aria-label={`${participant.userInfo.name} station ${
                        index + 1
                      } score ${score ?? "not scored"}`}
                      className={`min-h-12 overflow-hidden rounded-md border text-center ${tone.className}`}
                    >
                      <div className={`h-1 w-full ${tone.accent}`} />
                      <div className="px-1 py-1">
                        <div className="text-[10px] font-bold leading-tight text-muted-foreground">
                          {index + 1}
                        </div>
                        <div className="text-sm font-bold leading-tight">
                          {score ?? "-"}
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
