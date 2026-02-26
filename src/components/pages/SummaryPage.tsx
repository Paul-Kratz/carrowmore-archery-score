"use client";
import { IShootWithParticipants, IUser } from "@/models";
import { Badge, Button, Card, Table } from "@radix-ui/themes";
import { ArrowLeft, Calendar, Notebook, Users } from "lucide-react";

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

  const formatDate = (timestamp: number, withTime: boolean) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: withTime ? "short" : undefined,
    }).format(date);
  };

  const getColourForScore = (score: number | null) => {
    if (score === null) return "text-gray-500";
    if (score >= 16) return "text-green-700";
    if (score >= 10) return "text-blue-700";
    if (score >= 4) return "text-orange-500";
    if (score === 0) return "text-red-600";
    return "text-gray-500";
  };

  const POSSIBLE_SCORES = [0, 4, 8, 10, 14, 16, 20];

  const getScoreCounts = (roundScores: (number | null)[]) => {
    const counts = new Map<number, number>();
    POSSIBLE_SCORES.forEach((s) => counts.set(s, 0));
    roundScores.forEach((score) => {
      if (score !== null && counts.has(score)) {
        counts.set(score, counts.get(score)! + 1);
      }
    });
    return counts;
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
        <Card className="p-6 space-y-2">
          <h2 className="text-2xl font-bold">
            {formatDate(new Date(shootInfo.createdAt).getTime(), false)}
          </h2>
          <Badge
            radius="large"
            color={shootInfo.mode === "red" ? "red" : "yellow"}
            variant="surface"
            size={"3"}
          >
            {shootInfo.mode}
          </Badge>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Notebook className="w-3 h-3" />
              {shootInfo.notes ? shootInfo.notes : "No notes"}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {shootInfo.participants.length} participant
              {shootInfo.participants.length !== 1 ? "s" : ""}
              {shootInfo.participants[0]?.userInfo.name === currentUser.name &&
                " (tracked by you)"}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(new Date(shootInfo.createdAt).getTime(), true)}
            </div>
          </div>
        </Card>

        <h3 className="text-lg font-semibold mt-6">Participants</h3>
        {shootInfo.participants.map((participant) => (
          <Card key={participant.id} className="p-4">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-3">
                  <span className="font-bold">{participant.userInfo.name}</span>
                  {participant.userInfo.name === currentUser.name && (
                    <Badge size="2" color="green" variant="surface">
                      You
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {participant.roundScores.length} / 18 stations | Avg:{" "}
                    {(
                      participant.totalScore / participant.roundScores.length
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <h3 className="font-bold">{participant.totalScore}</h3>
                <p className="text-sm text-muted-foreground">points</p>
              </div>
            </div>

            <hr className="my-4" />

            <Table.Root>
              <Table.Header>
                <Table.Row>
                  {POSSIBLE_SCORES.map((score, index) => (
                    <Table.ColumnHeaderCell key={index}>
                      {score}
                    </Table.ColumnHeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  {(() => {
                    const counts = getScoreCounts(participant.roundScores);
                    return POSSIBLE_SCORES.map((score, index) => {
                      const count = counts.get(score) || 0;
                      return (
                        <Table.Cell
                          key={index}
                          className={
                            count > 0
                              ? getColourForScore(score)
                              : "text-gray-300"
                          }
                        >
                          {count}
                        </Table.Cell>
                      );
                    });
                  })()}
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </Card>
        ))}
        <h3 className="text-lg font-semibold mt-6">Station Breakdown</h3>
        <Card className="p-6 space-y-4">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                {Array.from({ length: 18 }, (_, i) => (
                  <Table.ColumnHeaderCell key={i}>
                    {i + 1}
                  </Table.ColumnHeaderCell>
                ))}
                <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {shootInfo.participants.map((participant) => (
                <Table.Row key={participant.id}>
                  <Table.Cell className="font-bold">
                    {participant.userInfo.name}
                  </Table.Cell>
                  {participant.roundScores.map((score, index) => (
                    <Table.Cell
                      key={index}
                      className={getColourForScore(score)}
                    >
                      {score}
                    </Table.Cell>
                  ))}
                  <Table.Cell className="font-bold">
                    {participant.totalScore}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>
      </main>
    </div>
  );
};
