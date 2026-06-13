"use client";
import { CLUBS } from "@/constants";
import { IShootWithParticipants, IUser } from "@/models";
import { ParticipantSummaryCard } from "./summary/ParticipantSummaryCard";
import { StationBreakdownCard } from "./summary/StationBreakdownCard";
import { SummaryHeaderCard } from "./summary/SummaryHeaderCard";
import { Header } from "../shared/Header";

export const SummaryPage = ({
  currentUser,
  shootInfo,
}: {
  currentUser: IUser;
  shootInfo: IShootWithParticipants;
}) => {
  const onBack = () => {
    window.history.back();
  };
  const clubName =
    CLUBS[shootInfo.clubId || "carrowmore"]?.name ?? shootInfo.clubId;

  return (
    <div className="forest-page min-h-screen bg-background">
      <Header onBack={onBack} title="Shoot Details" subtitle={clubName} />
      <main className="container max-w-2xl mx-auto px-4 py-3 pb-10">
        <SummaryHeaderCard
          currentUserId={currentUser.id}
          shootInfo={shootInfo}
        />

        <section className="mt-5">
          <div className="mb-2 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-(--deep-forest-green)">
                Participants
              </h3>
              <p className="text-xs text-muted-foreground">
                Totals and score pattern for each archer
              </p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {shootInfo.participants.length} total
            </span>
          </div>
          <div className="space-y-2.5">
            {shootInfo.participants.map((participant) => (
              <ParticipantSummaryCard
                key={participant.id}
                currentUserId={currentUser.id}
                participant={participant}
                clubId={shootInfo.clubId}
              />
            ))}
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-(--deep-forest-green)">
              Station Breakdown
            </h3>
            <p className="text-xs text-muted-foreground">
              Per-station score detail for this shoot
            </p>
          </div>
          <StationBreakdownCard
            participants={shootInfo.participants}
            clubId={shootInfo.clubId}
          />
        </section>
      </main>
    </div>
  );
};
