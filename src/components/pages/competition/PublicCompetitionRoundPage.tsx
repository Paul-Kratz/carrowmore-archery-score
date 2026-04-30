"use client";

import { StationNavigationCard } from "@/components/pages/shoot/StationNavigationCard";
import { SCORE_OPTIONS } from "@/components/pages/shoot/scoreOptions";
import { NUM_STATIONS, TARGET_NAMES } from "@/constants";
import { getCompetitionRoundTitle } from "@/helpers/competition";
import {
  CompetitionRoundKey,
  CompetitionStatus,
  ICompetition,
  ICompetitionParticipantWithScores,
} from "@/models";
import { Button, Card } from "@radix-ui/themes";
import { ArrowLeft, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CompetitionSession = {
  competition: ICompetition;
  participant: ICompetitionParticipantWithScores | null;
};

type PublicCompetitionRoundPageProps = {
  code: string;
  roundKey: CompetitionRoundKey;
  stationNumber: number;
};

export function PublicCompetitionRoundPage({
  code,
  roundKey,
  stationNumber,
}: PublicCompetitionRoundPageProps) {
  const [session, setSession] = useState<CompetitionSession | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadSession = async () => {
    const response = await fetch(`/api/competition/${code}/me`);
    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Unable to load scorecard");
      setIsLoading(false);
      return;
    }

    setSession(body);
    setIsLoading(false);

    if (!body.participant) {
      router.replace(`/competition/${code}`);
    }
  };

  useEffect(() => {
    void loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, roundKey]);

  const setScore = async (score: number | null) => {
    const response = await fetch(`/api/competition/${code}/score`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundKey, stationNumber, score }),
    });
    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Unable to update score");
      return;
    }

    setSession(body);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading scorecard...</div>;
  }

  if (!session?.participant) {
    return <div className="p-4 text-center">{error || "Check-in required"}</div>;
  }

  const { competition, participant } = session;
  const stationScores = participant.scores[roundKey];
  const currentScore = stationScores[stationNumber - 1] ?? null;
  const isFinished = competition.status === CompetitionStatus.finished;

  const changeStation = (nextStation: number) => {
    router.replace(`/competition/${code}/round/${roundKey}/${nextStation}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-semibold">{competition.title}</h1>
              <p className="text-sm text-muted-foreground">
                {getCompetitionRoundTitle(roundKey)} · {participant.displayName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="2"
            className="text-black"
            onClick={() => router.push(`/competition/${code}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-5 flex-1 space-y-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Station {stationNumber}</p>
          <h2 className="text-3xl font-bold">
            {TARGET_NAMES[stationNumber] ?? "Target"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Round total: {participant.totals[roundKey]} · Progress:{" "}
            {participant.completed[roundKey]} / {NUM_STATIONS}
          </p>
        </Card>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          {SCORE_OPTIONS.map((option) => (
            <button
              key={option.value}
              disabled={isFinished}
              onClick={() => setScore(option.value)}
              className={`p-3 rounded-lg ${option.color} ${
                currentScore === option.value
                  ? "ring-3 ring-offset-2 ring-black/80"
                  : ""
              } ${isFinished ? "opacity-60" : ""}`}
            >
              <div className="text-2xl font-bold">{option.label}</div>
              <div className="text-sm opacity-90 mt-1">
                {option.description}
              </div>
            </button>
          ))}
          {currentScore !== null && !isFinished && (
            <button
              onClick={() => setScore(null)}
              className="p-3 rounded-lg border-2 border-dashed border-muted-foreground/50"
            >
              Clear Score
            </button>
          )}
        </div>

        {isFinished && (
          <p className="text-center text-sm text-muted-foreground">
            This competition is finished, so scores are read-only.
          </p>
        )}

        {stationNumber === NUM_STATIONS && (
          <Button
            size="3"
            style={{ width: "100%" }}
            onClick={() => router.push(`/competition/${code}`)}
          >
            Back to Competition
          </Button>
        )}
      </main>

      <StationNavigationCard
        canGoNext={stationNumber < NUM_STATIONS}
        canGoPrevious={stationNumber > 1}
        currentStation={stationNumber}
        onStationChange={changeStation}
        stationScores={stationScores}
      />
    </div>
  );
}
