"use client";

import { GuestBadge } from "@/components/shared/GuestBadge";
import { IShootWithParticipants } from "@/models";
import { Badge, Button, Card } from "@radix-ui/themes";
import { ChevronRight, Notebook, Trash2, Trophy, Users } from "lucide-react";
import {
  formatHistoryDate,
  getTopScorer,
  getUserScore,
  truncateString,
} from "./historyUtils";

type ShootHistoryCardProps = {
  currentUserId: string;
  onDelete: (shootId: string) => void;
  onOpenSummary: (shootId: string) => void;
  shoot: IShootWithParticipants;
  showUserScore?: boolean;
};

export function ShootHistoryCard({
  currentUserId,
  onDelete,
  onOpenSummary,
  shoot,
  showUserScore = false,
}: ShootHistoryCardProps) {
  const topScorer = getTopScorer(shoot);
  const userScore = showUserScore ? getUserScore(shoot, currentUserId) : null;
  const guestCount = shoot.participants.filter(
    (participant) => participant.userInfo.isGuest,
  ).length;
  const completedStations = shoot.participants.reduce((max, participant) => {
    const completed = participant.roundScores.filter((score) => score !== null).length;
    return Math.max(max, completed);
  }, 0);

  return (
    <Card
      key={shoot.id}
      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => {}}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">
                Shoot on {formatHistoryDate(new Date(shoot.createdAt).getTime())}
              </h3>
              <Badge
                radius="large"
                color={shoot.mode === "red" ? "red" : "yellow"}
                variant="surface"
              >
                {shoot.mode}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              {shoot.createdBy === currentUserId && (
                <Button variant="ghost" color="red" onClick={() => onDelete(shoot.id)}>
                  <Trash2 className="w-5 h-5 text-danger" />
                </Button>
              )}
              <Button variant="ghost" onClick={() => onOpenSummary(shoot.id)}>
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Notebook className="w-3 h-3" />
              {shoot.notes ? truncateString(shoot.notes, 30) : "No notes"}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {shoot.participants.length} participant
              {shoot.participants.length !== 1 ? "s" : ""}
              {guestCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <GuestBadge />
                  <span>
                    {guestCount} guest{guestCount !== 1 ? "s" : ""}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Progress</div>
          <div className="font-semibold">{completedStations} / 18 stations</div>
        </div>
        {userScore ? (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Your Score</div>
            <div className="font-semibold">{userScore.score} pts</div>
          </div>
        ) : (
          topScorer && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Trophy className="w-3 h-3" />
                Top Score
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <span>
                  {topScorer.name}: {topScorer.score}
                </span>
                {topScorer.isGuest && <GuestBadge />}
              </div>
            </div>
          )
        )}
      </div>
    </Card>
  );
}
