"use client";

import { formatCompetitionDate } from "@/components/pages/competition/competitionUi";
import {
  COMPETITION_ROUND_KEYS,
  getCompetitionRoundTitle,
} from "@/helpers/competition";
import { ICompetitionWithParticipants } from "@/models";
import { Button, Card, Table } from "@radix-ui/themes";
import { ArrowLeft, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PublicCompetitionResultsPageProps = {
  code: string;
};

export function PublicCompetitionResultsPage({
  code,
}: PublicCompetitionResultsPageProps) {
  const [results, setResults] = useState<ICompetitionWithParticipants | null>(
    null,
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadResults = async () => {
      const response = await fetch(`/api/competition/${code}/results`);
      const body = await response.json();

      if (!response.ok) {
        setError(body.error ?? "Results are not available yet");
        setIsLoading(false);
        return;
      }

      setResults(body);
      setIsLoading(false);
    };

    void loadResults();
  }, [code]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading results...</div>;
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container max-w-2xl mx-auto px-4 py-8">
          <Card className="p-5 text-center">
            <h1 className="text-2xl font-bold">Results unavailable</h1>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button className="mt-4" onClick={() => router.push(`/competition/${code}`)}>
              Back
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="2"
            className="text-black"
            onClick={() => router.push(`/competition/${code}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Results</h1>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-5">
          <h2 className="text-2xl font-bold">{results.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCompetitionDate(results.date)} · {results.participants.length}{" "}
            participants
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Place</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Morning (yellow)</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Afternoon (red)</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {results.participants.map((participant, index) => (
                <Table.Row key={participant.id}>
                  <Table.Cell>{index + 1}</Table.Cell>
                  <Table.Cell>{participant.displayName}</Table.Cell>
                  <Table.Cell>{participant.totals.morning}</Table.Cell>
                  <Table.Cell>{participant.totals.afternoon}</Table.Cell>
                  <Table.Cell>
                    <strong>{participant.totals.overall}</strong>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Target Breakdown</h3>
          <div className="overflow-x-auto">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  {COMPETITION_ROUND_KEYS.map((roundKey) => (
                    <Table.ColumnHeaderCell key={roundKey}>
                      {getCompetitionRoundTitle(roundKey)}
                    </Table.ColumnHeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {results.participants.map((participant) => (
                  <Table.Row key={participant.id}>
                    <Table.Cell>{participant.displayName}</Table.Cell>
                    {COMPETITION_ROUND_KEYS.map((roundKey) => (
                      <Table.Cell key={roundKey}>
                        {participant.scores[roundKey]
                          .map((score) => score ?? "-")
                          .join(", ")}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>
        </Card>
      </main>
    </div>
  );
}
