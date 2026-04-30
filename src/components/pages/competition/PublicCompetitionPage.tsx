"use client";

import {
  formatCompetitionDate,
  getRoundStatusLabel,
} from "@/components/pages/competition/competitionUi";
import {
  COMPETITION_ROUND_KEYS,
  getCompetitionRoundTitle,
} from "@/helpers/competition";
import {
  CompetitionStatus,
  ICompetition,
  ICompetitionParticipantWithScores,
} from "@/models";
import { Badge, Button, Card, TextField } from "@radix-ui/themes";
import { ClipboardCheck, Trophy } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type CompetitionSession = {
  competition: ICompetition;
  participant: ICompetitionParticipantWithScores | null;
};

type PublicCompetitionPageProps = {
  code: string;
};

export function PublicCompetitionPage({ code }: PublicCompetitionPageProps) {
  const [session, setSession] = useState<CompetitionSession | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const loadSession = async () => {
    const response = await fetch(`/api/competition/${code}/me`);
    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Unable to load competition");
      setIsLoading(false);
      return;
    }

    setSession(body);
    setIsLoading(false);
  };

  useEffect(() => {
    if (searchParams.get("error") === "invalid-link") {
      setError("That restore link is no longer valid.");
    }

    void loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleCheckIn = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/competition/${code}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to check in");
      }

      await loadSession();
    } catch (checkInError) {
      setError(
        checkInError instanceof Error
          ? checkInError.message
          : "Unable to check in",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading competition...</div>;
  }

  if (!session) {
    return <div className="p-4 text-center">{error || "Competition not found"}</div>;
  }

  const { competition, participant } = session;
  const isFinished = competition.status === CompetitionStatus.finished;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            <h1 className="text-xl font-semibold">{competition.title}</h1>
          </div>
          <Badge color={isFinished ? "green" : "blue"} variant="surface">
            {competition.status}
          </Badge>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-5">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            {formatCompetitionDate(competition.date)} · Morning yellow ·
            Afternoon red
          </p>
          {isFinished && (
            <Button
              className="mt-4"
              onClick={() => router.push(`/competition/${code}/results`)}
            >
              View Results
            </Button>
          )}
        </Card>

        {error && <p className="text-sm text-red-700">{error}</p>}

        {!participant ? (
          <Card className="p-5">
            {isFinished ? (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Check-in closed</h2>
                <p className="text-sm text-muted-foreground">
                  This competition has finished.
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleCheckIn}>
                <div>
                  <h2 className="text-2xl font-bold">Check in</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter the name you want shown on the score table.
                  </p>
                </div>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Display name</span>
                  <TextField.Root
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    maxLength={50}
                    placeholder="Your name"
                  />
                </label>
                <Button
                  type="submit"
                  disabled={isSaving || !displayName.trim()}
                  size="3"
                >
                  <ClipboardCheck className="w-5 h-5 mr-1" />
                  Check In
                </Button>
              </form>
            )}
          </Card>
        ) : (
          <section className="space-y-4">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Checked in as</p>
              <h2 className="text-2xl font-bold">{participant.displayName}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Total: {participant.totals.overall}
              </p>
            </Card>

            {COMPETITION_ROUND_KEYS.map((roundKey) => (
              <Card key={roundKey} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">
                      {getCompetitionRoundTitle(roundKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getRoundStatusLabel(participant, roundKey)} ·{" "}
                      {participant.totals[roundKey]} points
                    </p>
                  </div>
                  <Button
                    variant={isFinished ? "surface" : "solid"}
                    onClick={() =>
                      router.push(`/competition/${code}/round/${roundKey}/1`)
                    }
                  >
                    {participant.completed[roundKey] === 18 ? "Review" : "Score"}
                  </Button>
                </div>
              </Card>
            ))}

            {!isFinished && (
              <p className="text-center text-sm text-muted-foreground">
                Final results will appear here after the competition is finished.
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
