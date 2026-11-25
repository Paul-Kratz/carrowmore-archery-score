"use client";

import { IShootDenormalized, IUser, Shoot } from "@/models";
import { Theme } from "@radix-ui/themes";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { oswald } from "@/fonts/oswald";
import { ParticipantSummaryCard } from "./summary/ParticipantSummaryCard";
import { StationBreakdownCard } from "./summary/StationBreakdownCard";
import { SummaryHeaderCard } from "./summary/SummaryHeaderCard";
import { ArcherTotals } from "./summary/ArcherTotals";
import { ScorebookHeader } from "../shared/ScorebookHeader";
import { scorebookTheme } from "../shared/scorebookTheme";

export const SummaryPage = ({ currentUser, shootInfo }: {
  currentUser: IUser;
  shootInfo: IShootDenormalized;
}) => {
  const shoot = Shoot.from(shootInfo, currentUser.id);

  return (
    <Theme accentColor="green" grayColor="olive" radius="small" panelBackground="solid" style={scorebookTheme} className="min-h-dvh bg-background text-foreground">
      <ScorebookHeader rightSlot={
        <button type="button" onClick={() => window.history.back()} className="inline-flex min-h-11 items-center gap-2 rounded-sm px-2 text-sm text-primary-foreground/85 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back
        </button>
      } />
      <main className="mx-auto w-full max-w-2xl px-5 pt-8 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-12">
        <h1 className={`${oswald.className} text-4xl leading-tight font-normal wrap-anywhere`}>Shoot summary</h1>
        <SummaryHeaderCard currentUserId={currentUser.id} shootInfo={shoot} />
        {shoot.participants.length === 0 ? <p className="mt-8 border-t border-border pt-6 text-muted-foreground">There are no archers in this shoot.</p> : <>
          <section aria-labelledby="summary-archers" className="mt-8">
            <h2 id="summary-archers" className="text-lg font-semibold">Archers</h2>
            <ArcherTotals participants={shoot.participants} totalStations={shoot.totalStations} />
          </section>
          <section aria-labelledby="summary-stations" className="mt-8">
            <h2 id="summary-stations" className="mb-2 text-lg font-semibold">Station scorecard</h2>
            <StationBreakdownCard participants={shoot.participants} totalStations={shoot.totalStations} />
          </section>
          <details className="group mt-8 border-y border-border">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-sm py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden">
              Score patterns <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 group-open:rotate-180" />
            </summary>
            <div className="grid gap-x-6 sm:grid-cols-2">
              {shoot.participants.map(participant => <ParticipantSummaryCard key={participant.id} participant={participant} clubId={shoot.clubId} />)}
            </div>
          </details>
        </>}
      </main>
    </Theme>
  );
};
