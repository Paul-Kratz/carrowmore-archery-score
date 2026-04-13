"use client";
import { IShootWithParticipants, IUser } from "@/models";
import { Button } from "@radix-ui/themes";
import { ArrowLeft } from "lucide-react";
import { ParticipantSummaryCard } from "./summary/ParticipantSummaryCard";
import { StationBreakdownCard } from "./summary/StationBreakdownCard";
import { SummaryHeaderCard } from "./summary/SummaryHeaderCard";

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-black"
              size="4"
            >
              <ArrowLeft className="w-5 h-5 mr-1 text-black" />
            </Button>
            <h1 className="text-xl font-semibold">Shoot Details</h1>
          </div>
        </div>
      </header>
      <main className="container max-w-2xl mx-auto px-4 py-2">
        <SummaryHeaderCard
          currentUserId={currentUser.id}
          shootInfo={shootInfo}
        />

        <h3 className="text-lg font-semibold mt-6">Participants</h3>
        {shootInfo.participants.map((participant) => (
          <ParticipantSummaryCard
            key={participant.id}
            currentUserName={currentUser.name}
            participant={participant}
          />
        ))}
        <h3 className="text-lg font-semibold mt-6">Station Breakdown</h3>
        <StationBreakdownCard participants={shootInfo.participants} />
      </main>
    </div>
  );
};
