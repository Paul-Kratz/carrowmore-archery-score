"use client";

import { CLUBS, getPegColorHex } from "@/constants";
import { getParticipantPegColorSummary } from "@/helpers/pegColors";
import { IShootWithParticipants } from "@/models";
import {
  Calendar,
  MapPin,
  Notebook,
  Target,
  Trophy,
  Users,
} from "lucide-react";
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
  const topScore = Math.max(
    0,
    ...shootInfo.participants.map((participant) => participant.totalScore),
  );
  const scoredStations = shootInfo.participants.reduce(
    (total, participant) =>
      total + participant.roundScores.filter((score) => score !== null).length,
    0,
  );
  const clubData = CLUBS[shootInfo.clubId];

  const totalStations = shootInfo.participants.length * clubData.totalStations;
  const completion =
    totalStations === 0
      ? 0
      : Math.round((scoredStations / totalStations) * 100);
  const clubName = clubData?.name ?? shootInfo.clubId;
  const { label: pegLabel, pegColors } = getParticipantPegColorSummary(
    shootInfo.participants,
  );

  return (
    <section className="forest-chart-panel overflow-hidden rounded-xl border border-border p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            Shoot summary
          </div>
          <h2 className="text-2xl font-bold leading-tight text-(--club-red-dark)">
            {formatSummaryDate(createdAtTimestamp, false)}
          </h2>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card/80 px-2.5 py-1 text-xs font-bold uppercase text-(--club-red-dark)">
          {pegColors.slice(0, 3).map((pegColor) => (
            <span
              key={pegColor}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: getPegColorHex(pegColor) }}
            />
          ))}
          {pegLabel}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Archers
          </div>
          <div className="text-xl font-bold text-(--club-red-dark)">
            {shootInfo.participants.length}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Top Score
          </div>
          <div className="text-xl font-bold text-(--club-red-dark)">
            {topScore}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Scored
          </div>
          <div className="text-xl font-bold text-(--club-red-dark)">
            {completion}%
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-border/70 pt-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="rounded-full border border-(--club-gold-dark)/50 bg-[#eef4d7] px-2.5 py-1 text-xs font-bold text-(--club-red-dark)">
            {clubName}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <Notebook className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{shootInfo.notes ? shootInfo.notes : "No notes"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>
            {shootInfo.participants.length} participant
            {shootInfo.participants.length !== 1 ? "s" : ""}
            {shootInfo.createdBy === currentUserId && " (tracked by you)"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{formatSummaryDate(createdAtTimestamp, true)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <span>Best score {topScore}</span>
        </div>
      </div>
    </section>
  );
}
