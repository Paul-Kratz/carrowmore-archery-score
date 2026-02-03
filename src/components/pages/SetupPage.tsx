"use client";

import { ACTIVE_SHOOT_COOKIE } from "@/constants";
import { formatResponse } from "@/helpers/formatResponse";
import { IShoot, IUser, Mode } from "@/models";
import { Button, Card, RadioGroup, Select } from "@radix-ui/themes";
import { Play, Target, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { getUserLabel } from "@/helpers/getUserLabel";

type SetupPageProps = {
  users: IUser[];
  currentUser: IUser;
};

export function SetupPage({ users, currentUser }: SetupPageProps) {
  const [mode, setMode] = useState<Mode>(Mode.yellow);
  const [participants, setParticipants] = useState<IUser[]>([]);
  const [newParticipantId, setNewParticipantId] = useState<string>("");

  const canStartShoot = participants.length > 0;

  const handleAddParticipant = () => {
    const newParticipant = users.find((u) => u.id === newParticipantId);
    if (
      newParticipant &&
      !participants.find((p) => p.id === newParticipant.id)
    ) {
      setParticipants([...participants, newParticipant]);
      setNewParticipantId("");
    }
  };

  const handleRemoveParticipant = (id: string) => {
    const updatedParticipants = participants.filter((p) => p.id !== id);
    setParticipants(updatedParticipants);
  };

  const createNewShoot = async () => {
    const body = {
      userId: currentUser.id,
      mode,
      participantIds: participants.map((p) => p.id),
    };

    const response = await fetch("/api/shoot", {
      method: "post",
      body: JSON.stringify(body),
    });

    const newShoot = formatResponse<IShoot>(await response.json()) as IShoot;

    Cookies.set(ACTIVE_SHOOT_COOKIE, newShoot.id);

    redirect("/shoot/1");
  };

  return (
    <div className="bg-background mt-16 min-h-screen">
      <header className="bg-background border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6" />
              <h1 className="text-xl font-semibold">In the Forest</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Start a New Shoot</h2>
        </div>

        <div className="space-y-6 ">
          {/* Mode Selection */}
          <Card className="p-6">
            <p className="font-semibold mb-4">Select Mode</p>
            <RadioGroup.Root
              value={mode}
              onValueChange={(value) => setMode(value as Mode)}
              color={mode === "red" ? "red" : "yellow"}
            >
              <div className="grid grid-cols-2 gap-4">
                <label
                  htmlFor="red"
                  className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    mode === "red"
                      ? "border-red-500 bg-red-500/10"
                      : "border-border hover:border-red-500/50"
                  }`}
                >
                  <RadioGroup.Item value={Mode.red} id="red" />
                  <div className="flex-1 ml-2">
                    <div className="font-semibold">Red Mode</div>
                  </div>
                </label>

                <label
                  htmlFor="yellow"
                  className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    mode === "yellow"
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-border hover:border-yellow-500/50"
                  }`}
                >
                  <RadioGroup.Item value={Mode.yellow} id="yellow" />
                  <div className="flex-1 ml-2">
                    <div className="font-semibold">Yellow Mode</div>
                  </div>
                </label>
              </div>
            </RadioGroup.Root>
          </Card>

          {/* Add Participants */}
          <Card className="p-6">
            <p className="font-semibold mb-2.5">Who is with you today?</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="col-span-3">
                <Select.Root
                  size={"3"}
                  value={newParticipantId}
                  onValueChange={setNewParticipantId}
                >
                  <Select.Trigger
                    placeholder="Select a participant"
                    style={{ width: "100%", minWidth: 0 }}
                  />
                  <Select.Content>
                    {users.map((user) => (
                      <Select.Item key={user.id} value={user.id}>
                        {getUserLabel(user, currentUser.id)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
              <Button
                onClick={handleAddParticipant}
                size={"3"}
                disabled={!newParticipantId.trim()}
                className="col-span-1"
              >
                Add
              </Button>
            </div>

            {participants.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-2">
                  {participants.length} participant
                  {participants.length !== 1 ? "s" : ""} added
                </div>
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium">
                      {getUserLabel(participant, currentUser.id)}
                    </span>
                    <Button
                      onClick={() => handleRemoveParticipant(participant.id)}
                      variant="ghost"
                      size="3"
                      className="text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg">
                No participants added yet
              </div>
            )}
          </Card>

          {/* Start Button */}
          <div className="flex flex-col items-center">
            <Button onClick={createNewShoot} disabled={!canStartShoot} size="4">
              <Play className="w-5 h-5 mr-2" />
              Start Shoot
            </Button>
          </div>

          {!canStartShoot && (
            <p className="text-center text-sm text-muted-foreground">
              Add at least one participant to start the shoot
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
