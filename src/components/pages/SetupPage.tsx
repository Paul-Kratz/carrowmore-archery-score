"use client";

import { ACTIVE_SHOOT_COOKIE } from "@/constants";
import { formatResponse } from "@/helpers/formatResponse";
import { IShoot, IUser, Mode } from "@/models";
import { Button } from "@radix-ui/themes";
import { History, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { AddUsernameDialog } from "@/components/pages/setup/AddUsernameDialog";
import { ModeSelectorCard } from "./setup/ModeSelectorCard";
import { ParticipantsCard } from "./setup/ParticipantsCard";
import { SetupHeader } from "./setup/SetupHeader";

type SetupPageProps = {
  users: IUser[];
  currentUser: IUser;
};

export function SetupPage({ users, currentUser }: SetupPageProps) {
  const [mode, setMode] = useState<Mode>(Mode.yellow);
  const [participants, setParticipants] = useState<IUser[]>([]);
  const [newParticipantId, setNewParticipantId] = useState<string>("");
  const router = useRouter();

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
      mode,
      participantIds: participants.map((p) => p.id),
    };

    const response = await fetch("/api/shoot", {
      method: "post",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to create shoot");
    }

    const newShoot = formatResponse<IShoot>(await response.json()) as IShoot;

    Cookies.set(ACTIVE_SHOOT_COOKIE, newShoot.id);

    router.push("/shoot/1");
  };

  return (
    <div className="bg-background min-h-screen">
      <SetupHeader />
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Start a New Shoot</h2>
        </div>

        <div className="space-y-6 ">
          <ModeSelectorCard mode={mode} onModeChange={setMode} />

          <ParticipantsCard
            currentUserId={currentUser.id}
            newParticipantId={newParticipantId}
            onAddParticipant={handleAddParticipant}
            onNewParticipantChange={setNewParticipantId}
            onRemoveParticipant={handleRemoveParticipant}
            participants={participants}
            users={users}
          />

          {/* Start Button */}
          <div className="flex flex-col items-center">
            <Button onClick={createNewShoot} disabled={!canStartShoot} size="4">
              <Play className="w-5 h-5 mr-1" />
              Start Shoot
            </Button>
          </div>

          {!canStartShoot && (
            <p className="text-center text-sm text-muted-foreground">
              Add at least one participant to start the shoot
            </p>
          )}

          <div className="flex flex-col items-center">
            <Button
              variant="surface"
              onClick={() => router.push("/history")}
              size="4"
            >
              <History className="w-5 h-5 mr-1" />
              History
            </Button>
          </div>
        </div>
        {currentUser && !currentUser.name && <AddUsernameDialog />}
      </main>
    </div>
  );
}
