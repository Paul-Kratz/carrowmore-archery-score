"use client";

import { IShoot, IShootParticipantWithScores, IUser } from "@/models";
import { Button, ScrollArea } from "@radix-ui/themes";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetShoot, useUpdateScore } from "@/hooks/queries";
import { ExitDialog } from "@/components/pages/shoot/ExitDialog";
import { ParticipantSelector } from "./shoot/ParticipantSelector";
import { ScorePanel } from "./shoot/ScorePanel";
import { ShootHeader } from "./shoot/ShootHeader";
import { ShootStatsCard } from "./shoot/ShootStatsCard";
import { StationNavigationCard } from "./shoot/StationNavigationCard";

type ShootPageProps = {
  currentStation: number;
  currentUser: IUser;
  shootId: string;
};
export function ShootPage({
  currentStation,
  currentUser,
  shootId,
}: ShootPageProps) {
  const { data: shootData } = useGetShoot(shootId);
  const { mutateAsync: updateScore } = useUpdateScore();
  const { participants, ...shoot } =
    (shootData as IShoot & {
      participants: IShootParticipantWithScores[];
    }) || {};
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    string | null
  >(null);
  const router = useRouter();

  const selectedParticipant =
    participants?.find((p) => p.id === selectedParticipantId) ??
    participants?.[0] ??
    null;

  const currentScore = selectedParticipant
    ? selectedParticipant.roundScores[currentStation - 1]
    : null;

  const handleSetScore = async (value: number | null) => {
    if (!shoot.id || !selectedParticipant?.id) {
      return;
    }

    await updateScore({
      shootId: shoot.id,
      participantId: selectedParticipant.id,
      roundNumber: currentStation,
      score: value,
    });
  };

  const onStationChange = (station: number) => {
    router.replace(`/shoot/${station}`);
  };
  const canGoPrevious = currentStation - 1 > 0;
  const canGoNext = currentStation + 1 < 18;

  const allParticipantsCompleted = () => {
    return participants?.every(
      (p) => p.roundScores[currentStation - 1] !== null,
    );
  };

  return (
    <div className="bg-background min-h-screen flex flex-col justify-between">
      <ShootHeader
        exitTrigger={
          <ExitDialog
            isShootFinished={false}
            shoot={shoot}
            triggerComponent={
              <Button variant="ghost" size="1" className="p-4">
                <Home className="w-5 h-5" color="black" />
              </Button>
            }
          />
        }
      />
      <ScrollArea type="always" scrollbars="vertical">
        <ShootStatsCard selectedParticipant={selectedParticipant} />

        <ParticipantSelector
          currentStation={currentStation}
          currentUserId={currentUser.id}
          onSelect={setSelectedParticipantId}
          participants={participants || []}
          selectedParticipantId={selectedParticipant?.id ?? null}
        />

        <ScorePanel
          currentScore={currentScore}
          currentUserId={currentUser.id}
          onClear={() => handleSetScore(null)}
          onSetScore={handleSetScore}
          selectedParticipantUser={(selectedParticipant?.userInfo as IUser) || null}
        />

        {currentStation === 18 && (
          <div className="justify-center flex mx-4 my-2">
            <ExitDialog
              isShootFinished={true}
              shoot={shoot}
              triggerComponent={
                <Button
                  size="3"
                  style={{ width: "100%" }}
                  disabled={!allParticipantsCompleted()}
                >
                  Finish shoot
                </Button>
              }
            />
          </div>
        )}
      </ScrollArea>

      <StationNavigationCard
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        currentStation={currentStation}
        onStationChange={onStationChange}
        stationScores={selectedParticipant?.roundScores ?? Array(18).fill(null)}
      />
    </div>
  );
}
