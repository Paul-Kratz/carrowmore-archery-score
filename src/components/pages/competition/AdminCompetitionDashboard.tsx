"use client";

import {
  formatCompetitionDate,
  getCompetitionProgressLabel,
} from "@/components/pages/competition/competitionUi";
import { SCORE_OPTIONS } from "@/components/pages/shoot/scoreOptions";
import { NUM_STATIONS } from "@/constants";
import {
  COMPETITION_ROUND_KEYS,
  getCompetitionRoundTitle,
} from "@/helpers/competition";
import {
  CompetitionRoundKey,
  CompetitionStatus,
  ICompetitionWithParticipants,
} from "@/models";
import { Badge, Button, Card, Select, Table } from "@radix-ui/themes";
import {
  ArrowLeft,
  Check,
  Clipboard,
  ExternalLink,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type AdminCompetitionDashboardProps = {
  competitionId: string;
};

export function AdminCompetitionDashboard({
  competitionId,
}: AdminCompetitionDashboardProps) {
  const [competition, setCompetition] =
    useState<ICompetitionWithParticipants | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [restoreLink, setRestoreLink] = useState("");
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [selectedRoundKey, setSelectedRoundKey] =
    useState<CompetitionRoundKey>(CompetitionRoundKey.morning);
  const [selectedStation, setSelectedStation] = useState("1");
  const router = useRouter();

  const publicLink =
    typeof window === "undefined" || !competition
      ? ""
      : `${window.location.origin}/competition/${competition.code}`;

  const selectedParticipant = competition?.participants.find(
    (participant) => participant.id === selectedParticipantId,
  );

  const completion = useMemo(() => {
    const participants = competition?.participants ?? [];

    return {
      morning: participants.filter((p) => p.completed.morning === NUM_STATIONS)
        .length,
      afternoon: participants.filter(
        (p) => p.completed.afternoon === NUM_STATIONS,
      ).length,
    };
  }, [competition]);

  const loadCompetition = async () => {
    const response = await fetch(`/api/competitions/${competitionId}`);
    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Unable to load competition");
      setIsLoading(false);
      return;
    }

    setCompetition(body);
    setSelectedParticipantId((current) => current || body.participants[0]?.id || "");
    setIsLoading(false);
  };

  useEffect(() => {
    void loadCompetition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitionId]);

  const updateStatus = async (status: CompetitionStatus) => {
    const response = await fetch(`/api/competitions/${competitionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Unable to update competition");
      return;
    }

    setCompetition(body);
  };

  const updateScore = async (score: number | null) => {
    if (!selectedParticipantId) {
      return;
    }

    const response = await fetch(`/api/competitions/${competitionId}/scores`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: selectedParticipantId,
        roundKey: selectedRoundKey,
        stationNumber: Number(selectedStation),
        score,
      }),
    });
    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Unable to update score");
      return;
    }

    setCompetition(body);
  };

  const createRestoreLink = async (participantId: string) => {
    const response = await fetch(
      `/api/competitions/${competitionId}/participants/${participantId}/restore-link`,
      { method: "POST" },
    );
    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Unable to create restore link");
      return;
    }

    setRestoreLink(body.restoreLink);

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(body.restoreLink);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading competition...</div>;
  }

  if (!competition) {
    return <div className="p-4 text-center">{error || "Competition not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="2"
              className="text-black"
              onClick={() => router.push("/competitions")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              <h1 className="text-xl font-semibold">{competition.title}</h1>
            </div>
          </div>
          <Badge
            color={competition.status === "finished" ? "green" : "blue"}
            variant="surface"
            size="2"
          >
            {competition.status}
          </Badge>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="text-lg font-bold">
              {formatCompetitionDate(competition.date)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Participants</p>
            <p className="text-lg font-bold">{competition.participants.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Morning complete</p>
            <p className="text-lg font-bold">
              {completion.morning} / {competition.participants.length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Afternoon complete</p>
            <p className="text-lg font-bold">
              {completion.afternoon} / {competition.participants.length}
            </p>
          </Card>
        </section>

        <Card className="p-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">Public check-in link</p>
              <p className="break-all text-sm text-muted-foreground">
                {publicLink}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="surface"
                onClick={() => navigator.clipboard?.writeText(publicLink)}
              >
                <Clipboard className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button variant="surface" onClick={() => window.open(publicLink)}>
                <ExternalLink className="w-4 h-4 mr-1" />
                Open
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            {competition.status === "open" ? (
              <Button
                color="green"
                onClick={() => updateStatus(CompetitionStatus.finished)}
              >
                <Check className="w-4 h-4 mr-1" />
                Finish Competition
              </Button>
            ) : (
              <Button
                variant="surface"
                onClick={() => updateStatus(CompetitionStatus.open)}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reopen Competition
              </Button>
            )}
          </div>
        </Card>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <Card className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Admin score correction</h2>
            <p className="text-sm text-muted-foreground">
              Updates here can correct any participant score.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Select.Root
              value={selectedParticipantId}
              onValueChange={setSelectedParticipantId}
            >
              <Select.Trigger placeholder="Participant" />
              <Select.Content>
                {competition.participants.map((participant) => (
                  <Select.Item key={participant.id} value={participant.id}>
                    {participant.displayName}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Select.Root
              value={selectedRoundKey}
              onValueChange={(value) =>
                setSelectedRoundKey(value as CompetitionRoundKey)
              }
            >
              <Select.Trigger />
              <Select.Content>
                {COMPETITION_ROUND_KEYS.map((roundKey) => (
                  <Select.Item key={roundKey} value={roundKey}>
                    {getCompetitionRoundTitle(roundKey)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Select.Root value={selectedStation} onValueChange={setSelectedStation}>
              <Select.Trigger />
              <Select.Content>
                {Array.from({ length: NUM_STATIONS }, (_, index) => (
                  <Select.Item key={index + 1} value={`${index + 1}`}>
                    Station {index + 1}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          <div className="flex flex-wrap gap-2">
            {SCORE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedParticipant?.scores[selectedRoundKey][
                    Number(selectedStation) - 1
                  ] === option.value
                    ? "solid"
                    : "surface"
                }
                onClick={() => updateScore(option.value)}
              >
                {option.label}
              </Button>
            ))}
            <Button variant="surface" onClick={() => updateScore(null)}>
              Clear
            </Button>
          </div>
        </Card>

        {restoreLink && (
          <Card className="p-4">
            <p className="font-semibold">Restore link copied</p>
            <p className="break-all text-sm text-muted-foreground mt-1">
              {restoreLink}
            </p>
          </Card>
        )}

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Participants and scores</h2>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Morning</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Afternoon</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Restore</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {competition.participants.map((participant) => (
                <Table.Row key={participant.id}>
                  <Table.Cell>{participant.displayName}</Table.Cell>
                  <Table.Cell>
                    {participant.totals.morning} ·{" "}
                    {getCompetitionProgressLabel(participant, CompetitionRoundKey.morning)}
                  </Table.Cell>
                  <Table.Cell>
                    {participant.totals.afternoon} ·{" "}
                    {getCompetitionProgressLabel(
                      participant,
                      CompetitionRoundKey.afternoon,
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <strong>{participant.totals.overall}</strong>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      size="1"
                      variant="surface"
                      onClick={() => createRestoreLink(participant.id)}
                    >
                      Copy link
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>
      </main>
    </div>
  );
}
