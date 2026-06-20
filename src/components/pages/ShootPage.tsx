"use client";

import { IDenormalizedParticipant, IShootDenormalized, IUser } from "@/models";
import { Button, ScrollArea } from "@radix-ui/themes";
import { TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetShoot, useUpdateScore } from "@/hooks/queries";
import { ExitDialog } from "@/components/pages/shoot/ExitDialog";
import { ParticipantSelector } from "./shoot/ParticipantSelector";
import { ScorePanel } from "./shoot/ScorePanel";
import { StationNavigationCard } from "./shoot/StationNavigationCard";
import { Header } from "../shared/Header";
import { CLUBS } from "@/constants";
import { OptionsDropdown } from "./shoot/OptionsDropdown";

type ShootPageProps = {
  currentStation: number;
  currentUser: IUser;
  shootId: string;
};

const scoreSaveErrorMessage =
  "That score did not save. Check your signal and tap the score again.";

const getScoreSaveErrorKey = (shootId: string) =>
  `score-save-error:${shootId}`;

type FailedScoreSave = {
  message: string;
  participantId: string;
  station: number;
};

export function ShootPage({
  currentStation,
  currentUser,
  shootId,
}: ShootPageProps) {
  const { data: shootData } = useGetShoot(shootId);
  const { mutateAsync: updateScore, isPending: isUpdatingScore } =
    useUpdateScore();
  const { participants, ...shoot } = (shootData as IShootDenormalized) || {};
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    string | null
  >(null);
  const [scoreSaveError, setScoreSaveError] = useState<string | null>(null);
  const router = useRouter();

  const clubData = CLUBS[shoot?.clubId || "carrowmore"];

  useEffect(() => {
    const rawFailedSave = sessionStorage.getItem(getScoreSaveErrorKey(shootId));

    if (!rawFailedSave) {
      return;
    }

    let failedSave: FailedScoreSave;

    try {
      failedSave = JSON.parse(rawFailedSave) as FailedScoreSave;
    } catch {
      sessionStorage.removeItem(getScoreSaveErrorKey(shootId));
      return;
    }

    if (failedSave.station !== currentStation) {
      return;
    }

    sessionStorage.removeItem(getScoreSaveErrorKey(shootId));
    queueMicrotask(() => {
      setSelectedParticipantId(failedSave.participantId);
      setScoreSaveError(failedSave.message);
    });
  }, [currentStation, shootId]);

  const selectedParticipant =
    participants?.find((p) => p.id === selectedParticipantId) ??
    participants?.[0] ??
    null;

  const currentScore = selectedParticipant
    ? (selectedParticipant.scores[currentStation - 1]?.score ?? null)
    : null;

  const selectedParticipantIndex =
    selectedParticipant && participants
      ? participants.findIndex(
          (participant) => participant.id === selectedParticipant.id,
        )
      : -1;
  const stationCompletionCounts = Array.from(
    { length: clubData.totalStations },
    (_, index) =>
      (participants ?? []).filter(
        (participant) => (participant.scores[index]?.score ?? null) !== null,
      ).length,
  );
  const participantCount = participants?.length ?? 0;

  const remainingScoreCount = shoot?.totalScoreSlots - shoot?.scoredCount;

  const handleSetScore = (value: number | null) => {
    if (!shoot.id || !selectedParticipant?.id || isUpdatingScore) {
      return;
    }

    const scoredParticipantId = selectedParticipant.id;
    const scoredStation = currentStation;
    const failedSave = {
      message: scoreSaveErrorMessage,
      participantId: scoredParticipantId,
      station: scoredStation,
    };

    sessionStorage.removeItem(getScoreSaveErrorKey(shootId));
    setScoreSaveError(null);

    void updateScore({
      shootId: shoot.id,
      participantId: scoredParticipantId,
      roundNumber: scoredStation,
      score: value,
    }).catch(() => {
      sessionStorage.setItem(
        getScoreSaveErrorKey(shootId),
        JSON.stringify(failedSave),
      );
      setSelectedParticipantId(scoredParticipantId);
      setScoreSaveError(scoreSaveErrorMessage);
      router.replace(`/shoot/${shootId}/${scoredStation}`);
    });

    if (value === null || !participants?.length) {
      return;
    }

    const nextUnscoredParticipant = Array.from(
      { length: Math.max(participants.length - 1, 0) },
      (_, offset) => {
        const nextIndex =
          (selectedParticipantIndex + offset + 1) % participants.length;
        return participants[nextIndex];
      },
    ).find(
      (participant) =>
        (participant.scores[currentStation - 1]?.score ?? null) === null,
    );

    if (nextUnscoredParticipant) {
      setSelectedParticipantId(nextUnscoredParticipant.id);
      return;
    }

    if (currentStation < clubData.totalStations) {
      setSelectedParticipantId(participants[0]?.id ?? null);
      router.replace(`/shoot/${shootId}/${currentStation + 1}`);
    }
  };

  const onStationChange = (station: number) => {
    router.replace(`/shoot/${shootId}/${station}`);
  };
  const canGoPrevious = currentStation - 1 > 0;
  const canGoNext = currentStation < clubData.totalStations;

  return (
    <div className="forest-page bg-background flex min-h-screen w-full max-w-full flex-col justify-between overflow-x-hidden">
      <Header
        title="In the Forest"
        subtitle={"at " + clubData.name}
        showBackButton={false}
        rightSlot={<OptionsDropdown shoot={shoot} />}
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
            onSelect={setSelectedParticipantId}
            participants={participants || []}
            selectedParticipantId={selectedParticipant?.id ?? null}
          />

          {scoreSaveError && (
            <div
              role="alert"
              className="mx-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
            >
              {scoreSaveError}
            </div>
          )}

          <div className="flex-1">
            <ScorePanel
              currentScore={currentScore}
              currentUserId={currentUser.id}
              disabled={isUpdatingScore}
              onClear={() => handleSetScore(null)}
              onSetScore={handleSetScore}
              selectedParticipantUser={
                (selectedParticipant as IDenormalizedParticipant) || null
              }
              clubId={shoot?.clubId}
            />
          </div>

          {currentStation === clubData.totalStations && (
            <div className="justify-center flex flex-col mx-4 my-2">
              {remainingScoreCount > 0 && (
                <p className="text-xs text-red-700 mb-2 text-center">
                  You have {remainingScoreCount} scores left to track. Are you
                  sure you want to finish the shoot?
                </p>
              )}
              <ExitDialog
                isShootFinished={true}
                shoot={shoot}
                triggerComponent={
                  <Button
                    size="3"
                    className="forest-primary-button"
                    style={{ width: "100%" }}
                    disabled={isUpdatingScore}
                  >
                    <>
                      <TreePine className="w-5 h-5 mr-1" />
                      Finish shoot
                    </>
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
        totalStations={clubData.totalStations}
      />
    </div>
  );
}
