"use client";
import Image from "next/image";
import { ScoringButtonGroup } from "./ScoringButtonGroup";
import { useState } from "react";
import { getUserInitials } from "@/helpers/getUserInitials";
import { User } from "@prisma/client";

export const RoundCard = ({
  user,
  shootId,
  roundNumber,
  total,
  round,
}: {
  user?: User;
  shootId: string;
  roundNumber: number;
  total: number;
  round: number | null;
}) => {
  const [totalScore, setTotalScore] = useState(total);
  const [roundScore, setRoundScore] = useState(round);

  const handleSetScore = async (value: number) => {
    setRoundScore(value);
    const result = await fetch("/api/roundScore", {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        shootId,
        userId: user?.id,
        roundNumber,
        score: value,
      }),
    });

    const updatedRound = await result.json();
    setRoundScore(updatedRound.roundScore);
    setTotalScore(updatedRound.totalScore);
  };
  return (
    <div className="card bg-base-100 border-2 border-base-300 my-3">
      <div className="card-body p-3">
        <div className="card-title flex justify-between items-center">
          <div className="flex gap-2 items-center justify-center">
            {user?.image ? (
              <div className="avatar">
                <div className="w-6 rounded-full">
                  <Image
                    src={user?.image as string}
                    alt="User image"
                    width={24}
                    height={24}
                    preload
                  />
                </div>
              </div>
            ) : (
              <div className="avatar avatar-placeholder">
                <div
                  className={`bg-accent text-neutral-content w-6 rounded-full`}
                >
                  <span className="text-xs">{getUserInitials(user)}</span>
                </div>
              </div>
            )}
            <span className="text-lg">{user?.name}</span>
          </div>
          <div className="flex flex-row items-center justify-center gap-1">
            <span className="text-accent text-xs">Score: </span>

            <span className="font-bold text-lg">{totalScore}</span>
          </div>
        </div>
        <div className="divider my-0" />

        <div className="flex flex-row justify-evenly">
          <ScoringButtonGroup
            roundScore={roundScore}
            handleSetScore={handleSetScore}
          />
        </div>
      </div>
    </div>
  );
};
