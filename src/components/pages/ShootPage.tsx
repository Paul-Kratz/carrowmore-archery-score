"use client";

import { IShoot, IShootParticipantWithScores, IUser } from "@/models";
import { Button, ScrollArea } from "@radix-ui/themes";
import { Home, TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetShoot, useUpdateScore } from "@/hooks/queries";
import { ExitDialog } from "@/components/pages/shoot/ExitDialog";
import { ParticipantSelector } from "./shoot/ParticipantSelector";
import { ScorePanel } from "./shoot/ScorePanel";
import { ShootHeader } from "./shoot/ShootHeader";
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
  const { mutateAsync: updateScore, isPending: isUpdatingScore } =
    useUpdateScore();
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
  const selectedParticipantIndex =
    selectedParticipant && participants
      ? participants.findIndex(
          (participant) => participant.id === selectedParticipant.id,
        )
      : -1;
  const stationCompletionCounts = Array.from({ length: 18 }, (_, index) =>
    (participants ?? []).filter(
      (participant) => participant.roundScores[index] !== null,
    ).length,
  );
  const participantCount = participants?.length ?? 0;
  const remainingScoreCount = (participants ?? []).reduce(
    (remaining, participant) =>
      remaining +
      participant.roundScores.filter((score) => score === null).length,
    0,
  );

  const handleSetScore = (value: number | null) => {
    if (!shoot.id || !selectedParticipant?.id || isUpdatingScore) {
      return;
    }

    void updateScore({
      shootId: shoot.id,
      participantId: selectedParticipant.id,
      roundNumber: currentStation,
      score: value,
    });

    if (value === null || !participants?.length) {
      return;
    }

    const nextUnscoredParticipant = Array.from(
      { length: Math.max(participants.length - 1, 0) },
      (_, offset) => {
        const nextIndex = (selectedParticipantIndex + offset + 1) % participants.length;
        return participants[nextIndex];
      },
    ).find(
      (participant) => participant.roundScores[currentStation - 1] === null,
    );

    if (nextUnscoredParticipant) {
      setSelectedParticipantId(nextUnscoredParticipant.id);
      return;
    }

    if (currentStation < 18) {
      setSelectedParticipantId(participants[0]?.id ?? null);
      router.replace(`/shoot/${currentStation + 1}`);
    }
  };

  const onStationChange = (station: number) => {
    router.replace(`/shoot/${station}`);
  };
  const canGoPrevious = currentStation - 1 > 0;
  const canGoNext = currentStation < 18;

  const onPreviousParticipant = () => {
    if (!participants?.length) {
      return;
    }

    const previousIndex =
      selectedParticipantIndex <= 0
        ? participants.length - 1
        : selectedParticipantIndex - 1;

    setSelectedParticipantId(participants[previousIndex].id);
  };

  const onNextParticipant = () => {
    if (!participants?.length) {
      return;
    }

    const nextIndex =
      selectedParticipantIndex < 0 ||
      selectedParticipantIndex >= participants.length - 1
        ? 0
        : selectedParticipantIndex + 1;

    setSelectedParticipantId(participants[nextIndex].id);
  };

  const allParticipantsCompleted = () => {
    return participants?.every(
      (participant) =>
        participant.roundScores.every((score) => score !== null),
    );
  };

  return (
    <div className="forest-page bg-background flex min-h-screen w-full max-w-full flex-col justify-between overflow-x-hidden">
      <ShootHeader
        exitTrigger={
          <ExitDialog
            isShootFinished={false}
            shoot={shoot}
            triggerComponent={
              <Button
                variant="ghost"
                size="1"
                className="p-4 text-primary-foreground"
              >
                <Home className="w-5 h-5" />
              </Button>
            }
          />
        }
      />
      <ScrollArea
        type="auto"
        scrollbars="vertical"
        className="min-w-0 flex-1 overflow-x-hidden"
      >
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-2 overflow-x-hidden py-2">
          <ParticipantSelector
            currentStation={currentStation}
            currentUserId={currentUser.id}
            disabled={isUpdatingScore}
            onNextParticipant={onNextParticipant}
            onPreviousParticipant={onPreviousParticipant}
            onSelect={setSelectedParticipantId}
            participants={participants || []}
            selectedParticipantId={selectedParticipant?.id ?? null}
          />

          <div className="flex-1">
            <ScorePanel
              currentScore={currentScore}
              currentUserId={currentUser.id}
              disabled={isUpdatingScore}
              onClear={() => handleSetScore(null)}
              onSetScore={handleSetScore}
              selectedParticipantUser={
                (selectedParticipant?.userInfo as IUser) || null
              }
            />
          </div>

          {currentStation === 18 && (
            <div className="justify-center flex mx-4 my-2">
              <ExitDialog
                isShootFinished={true}
                shoot={shoot}
                triggerComponent={
                  <Button
                    size="3"
                    className="forest-primary-button"
                    style={{ width: "100%" }}
                    disabled={!allParticipantsCompleted() || isUpdatingScore}
                  >
                    {remainingScoreCount === 0 ? (
                      <>
                        <TreePine className="w-5 h-5 mr-1" />
                        Finish shoot
                      </>
                    ) : (
                      `${remainingScoreCount} scores left`
                    )}
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </ScrollArea>

      <StationNavigationCard
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        currentStation={currentStation}
        disabled={isUpdatingScore}
        onStationChange={onStationChange}
        participantCount={participantCount}
        stationCompletionCounts={stationCompletionCounts}
      />
    </div>
  );
}
