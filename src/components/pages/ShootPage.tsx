"use client";

import { getUserLabel } from "@/helpers/getUserLabel";
import { IShoot, IShootParticipantWithScores, IUser } from "@/models";
import { Button, Card, ScrollArea } from "@radix-ui/themes";
import { ArrowLeft, ArrowRight, Home, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExitDialog } from "../ExitDialog";
import { useGetShoot, useUpdateScore } from "@/hooks/queries";

const SCORE_OPTIONS = [
  {
    value: 20,
    label: "20",
    description: "Kill on 1st Arrow",
    color: "bg-green-700 text-white",
  },
  {
    value: 16,
    label: "16",
    description: "Wound on 1st Arrow",
    color: "border border-green-700 bg-green-700/10 text-black/80",
  },
  {
    value: 14,
    label: "14",
    description: "Kill on 2nd Arrow",
    color: "bg-blue-700 text-white",
  },
  {
    value: 10,
    label: "10",
    description: "Wound on 2nd Arrow",
    color: "border border-blue-700 bg-blue-700/10 text-black/80",
  },
  {
    value: 8,
    label: "8",
    description: "Kill on 3rd Arrow",
    color: "bg-orange-500 text-white",
  },
  {
    value: 4,
    label: "4",
    description: "Wound on 3rd Arrow",
    color: "border border-orange-500 bg-orange-500/10 text-black/80",
  },
  {
    value: 0,
    label: "0",
    description: "Missed Shot",
    color: "bg-red-700 text-white",
  },
];

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
  const { mutate: updateScore } = useUpdateScore();
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
    await updateScore({
      shootId: shoot.id,
      userId: selectedParticipant?.userInfo.id,
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

  console.log(shootData);
  return (
    <div className="bg-background min-h-screen flex flex-col justify-between">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold">In the Forest</h1>
              </div>
            </div>

            <ExitDialog
              isShootFinished={false}
              shoot={shoot}
              triggerComponent={
                <Button variant="ghost" size="1" className="p-4">
                  <Home className="w-5 h-5" color="black" />
                </Button>
              }
            />
          </div>
        </div>
      </header>
      <ScrollArea type="always" scrollbars="vertical">
        {/* Quick Stats */}
        <Card className="m-2 p-4 bg-muted/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {selectedParticipant?.totalScore}
              </div>
              <div className="text-xs text-muted-foreground">Total Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {selectedParticipant
                  ? selectedParticipant.roundScores.filter((s) => s !== null)
                      .length
                  : 0}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {(
                  (selectedParticipant?.totalScore || 0) /
                  Math.max(
                    selectedParticipant
                      ? selectedParticipant.roundScores.filter(
                          (s) => s !== null,
                        ).length
                      : 0,
                    1,
                  )
                ).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Average</div>
            </div>
          </div>
        </Card>

        {/* Participant Selection */}
        <div className="p-2">
          <div className="text-sm font-medium mb-2">Select Participant</div>
          <div className="flex flex-wrap gap-2">
            {participants?.map((p) => {
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedParticipantId(p.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    p.id === selectedParticipant?.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium">
                    {getUserLabel(p.userInfo as IUser, currentUser.id)}
                  </div>

                  <div className="text-xs text-muted-foreground mt-0.5">
                    Score: {p.roundScores[currentStation - 1] ?? "-"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Score Selection */}
        <div className="p-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-md font-bold">
              Score for{" "}
              {getUserLabel(
                (selectedParticipant?.userInfo as IUser) || {},
                currentUser.id,
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SCORE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSetScore(option.value)}
                className={`p-3 rounded-lg ${option.color} ${
                  currentScore === option.value
                    ? "ring-3 ring-offset-2 ring-black/80"
                    : ""
                }`}
              >
                <div className="text-2xl font-bold">{option.label}</div>
                <div className="text-sm opacity-90 mt-1">
                  {option.description}
                </div>
              </button>
            ))}
            {currentScore !== null && (
              <button
                onClick={() => handleSetScore(null)}
                className="p-3 rounded-lg border-2 border-dashed border-muted-foreground/50"
              >
                Clear Score
              </button>
            )}
          </div>
        </div>

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

      <Card>
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="1"
            onClick={() => onStationChange(currentStation - 1)}
            disabled={!canGoPrevious}
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </Button>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Station</div>
            <div className="text-3xl font-bold">{currentStation}</div>
          </div>
          <Button
            variant="ghost"
            size="1"
            onClick={() => onStationChange(currentStation + 1)}
            disabled={!canGoNext}
          >
            <ArrowRight className="w-6 h-6 text-primary" />
          </Button>
        </div>

        {/* Quick Station Jump */}
        <div className="flex flex-wrap gap-1 justify-center">
          {Array.from({ length: 18 }, (_, i) => (
            <button
              key={i}
              onClick={() => onStationChange(i + 1)}
              className={`w-8 h-8 rounded text-sm font-medium ${
                i === currentStation - 1
                  ? "bg-primary text-primary-foreground"
                  : `${selectedParticipant?.roundScores[i] !== null ? "bg-green-700/80 text-white" : "bg-muted"}`
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
