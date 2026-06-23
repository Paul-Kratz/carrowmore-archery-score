"use client";

import { IUser, Shoot } from "@/models";
import { Button, ScrollArea } from "@radix-ui/themes";
import { TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useGetShoot, useUpdateScore } from "@/hooks/queries";
import { ExitDialog } from "@/components/pages/shoot/ExitDialog";
import { ParticipantSelector } from "./shoot/ParticipantSelector";
import { ScorePanel } from "./shoot/ScorePanel";
import { StationNavigationCard } from "./shoot/StationNavigationCard";
import { Header } from "../shared/Header";
import { OptionsDropdown } from "./shoot/OptionsDropdown";
import { ForestLoader } from "../shared/ForestLoader";

type ShootPageProps = {
  currentStation: number;
  currentUser: IUser;
  shootId: string;
};

const scoreSaveErrorMessage =
  "That score did not save. Check your signal and tap the score again.";

const getScoreSaveErrorKey = (shootId: string) => `score-save-error:${shootId}`;

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
  const { data: shootData, isLoading, isError } = useGetShoot(shootId);
  const { mutateAsync: updateScore, isPending: isUpdatingScore } =
    useUpdateScore();
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    string | null
  >(null);
  const [scoreSaveError, setScoreSaveError] = useState<string | null>(null);
  const router = useRouter();

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

  const shoot = useMemo(
    () => (shootData ? Shoot.from(shootData, currentUser.id) : null),
    [shootData, currentUser.id],
  );

  if (isLoading) {
    return <ForestLoader label="Loading shoot" size="lg" />;
  }

  if (isError || !shoot) {
    return <div>Unable to load shoot</div>;
  }
  const participants = shoot.participants;

  const selectedParticipant =
    shoot.getParticipantById(selectedParticipantId) ?? shoot.firstParticipant;

  const currentScore = selectedParticipant
    ? selectedParticipant.getScoreForStation(currentStation)
    : null;

  const participantCount = participants.length;

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

    const nextUnscoredParticipant = shoot.getNextUnscoredParticipant(
      selectedParticipant.id,
      currentStation,
    );

    if (nextUnscoredParticipant) {
      setSelectedParticipantId(nextUnscoredParticipant.id);
      return;
    }

    if (currentStation < shoot.totalStations) {
      setSelectedParticipantId(participants[0]?.id ?? null);
      router.replace(`/shoot/${shootId}/${currentStation + 1}`);
    }
  };

  const onStationChange = (station: number) => {
    router.replace(`/shoot/${shootId}/${station}`);
  };
  const canGoPrevious = currentStation - 1 > 0;
  const canGoNext = currentStation < shoot.totalStations;

  return (
    <div className="forest-page bg-background flex min-h-screen w-full max-w-full flex-col justify-between overflow-x-hidden">
      <Header
        title="In the Forest"
        subtitle={"at " + shoot.clubData?.name}
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
              disabled={isUpdatingScore}
              onClear={() => handleSetScore(null)}
              onSetScore={handleSetScore}
              selectedParticipantUser={selectedParticipant}
              clubId={shoot?.clubId}
            />
          </div>

          {currentStation === shoot.totalStations && (
            <div className="justify-center flex flex-col mx-4 my-2">
              {shoot.remainingScoreCount > 0 && (
                <p className="text-xs text-red-700 mb-2 text-center">
                  You have {shoot.remainingScoreCount} scores left to track. Are
                  you sure you want to finish the shoot?
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
        stationCompletionCounts={shoot.stationCompletionCounts}
        totalStations={shoot.totalStations}
      />
    </div>
  );
}
