"use client";

import { IUser, Shoot } from "@/models";
import { Button, Theme } from "@radix-ui/themes";
import { TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useGetShoot, useUpdateScore } from "@/hooks/queries";
import { ExitDialog } from "@/components/pages/shoot/ExitDialog";
import { ParticipantSelector } from "./shoot/ParticipantSelector";
import { ScorePanel } from "./shoot/ScorePanel";
import { StationNavigationCard } from "./shoot/StationNavigationCard";
import { scorebookTheme } from "../shared/scorebookTheme";
import { oswald } from "@/fonts/oswald";
import { OptionsDropdown } from "./shoot/OptionsDropdown";
import { ScorebookHeader } from "../shared/ScorebookHeader";
import { ScorebookStatus } from "../shared/ScorebookStatus";
import { scorebookStyles } from "../shared/scorebookTheme";

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
  const { data: shootData, isLoading, isError, refetch, isFetching } = useGetShoot(shootId);
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
    return <ScorebookStatus title="Opening your shoot" loadingLabel="Loading shoot" />;
  }

  if (isError || !shoot) {
    return <ScorebookStatus title="Unable to load shoot" description="Check your connection and try again.">
      <Button disabled={isFetching} onClick={() => void refetch()} className={scorebookStyles.primaryButton}>{isFetching ? "Trying again…" : "Try again"}</Button>
      <Button variant="ghost" onClick={() => router.push("/")} className={scorebookStyles.secondaryButton}>Back to setup</Button>
    </ScorebookStatus>;
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
    }
  };

  const onStationChange = (station: number) => {
    router.replace(`/shoot/${shootId}/${station}`);
  };
  const canGoPrevious = currentStation - 1 > 0;
  const canGoNext = currentStation < shoot.totalStations;

  return (
    <Theme accentColor="green" grayColor="olive" radius="small" panelBackground="solid" style={scorebookTheme} className="flex min-h-dvh flex-col bg-background text-foreground">
      <ScorebookHeader rightSlot={<OptionsDropdown shoot={shoot} />} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-5 pt-6 pb-28 sm:px-8 sm:pt-8">
        <div>
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <p>{shoot.clubData?.name}</p>
            <p>{shoot.stationCompletionCounts[currentStation - 1] ?? 0}/{participantCount} scored</p>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h1 className={`${oswald.className} text-4xl font-normal leading-tight`}>Station {currentStation}</h1>
            {selectedParticipant && (
              <h2 className="min-w-0 break-words text-base font-semibold">
                {selectedParticipant.getParticipantLabel()}
                {selectedParticipant.isGuest && <span className="ml-2 text-sm font-normal text-muted-foreground">Guest</span>}
              </h2>
            )}
          </div>
        </div>
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
            className="rounded-sm border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
          >
            {scoreSaveError}
          </div>
        )}

        <div>
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
                  className="min-h-12! bg-primary! bg-none! text-white! shadow-none!"
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
        {isUpdatingScore && (
          <p role="status" className="text-center text-sm text-muted-foreground">Saving score…</p>
        )}
      </main>

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
    </Theme>
  );
}
