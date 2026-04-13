"use client";
import { useDeleteShoot, useGetParticipatedShoots } from "@/hooks/queries";
import { IShootChartData, IShootWithParticipants, IUser } from "@/models";
import { AlertDialog, Button, Card, Flex, Tabs, Badge } from "@radix-ui/themes";
import {
  ArrowLeft,
  ChevronRight,
  Notebook,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShootsLineChart } from "../ShootsLineChart";

type HistoryPageProps = {
  currentUser: IUser;
  chartData: IShootChartData[];
};

const truncateString = (str: string, maxLength: number) => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
};
export const HistoryPage = ({ currentUser, chartData }: HistoryPageProps) => {
  const [activeTab, setActiveTab] = useState<"tracked" | "participated">(
    "tracked",
  );
  const [deleteShootId, setDeleteShootId] = useState<string | null>(null);
  const { participatedShoots, trackedShoots, isLoading } =
    useGetParticipatedShoots(currentUser.id); // Refetch participated shoots to get latest data after deletion
  const { mutateAsync } = useDeleteShoot();
  const onBack = () => {
    window.history.back();
  };

  const router = useRouter();

  const getTopScorer = (shoot: IShootWithParticipants) => {
    if (shoot.participants.length === 0) return null;
    const sorted = [...shoot.participants].sort((a, b) => {
      const scoreA = a.totalScore;
      const scoreB = b.totalScore;
      return scoreB - scoreA;
    });
    const topParticipant = sorted[0];
    const topScore = topParticipant.totalScore;
    return {
      name: topParticipant?.userInfo?.name || "Unknown",
      score: topScore,
    };
  };

  const getUserScore = (shoot: IShootWithParticipants) => {
    const userParticipant = shoot.participants.find(
      (p) => p?.userInfo?.id === currentUser?.id,
    );
    if (!userParticipant) return null;

    const completed = userParticipant.roundScores.filter(
      (s) => s !== null,
    ).length;
    return { score: userParticipant.totalScore, completed };
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleOnDelete = (shootId: string) => {
    setDeleteShootId(shootId);
  };

  const finaliseDeleteShoot = async () => {
    if (!deleteShootId) return;
    const shootToDelete = trackedShoots.find((s) => s.id === deleteShootId);
    if (currentUser.id !== shootToDelete?.createdBy) return; // Extra safety check to ensure only creator can delete
    try {
      await mutateAsync(deleteShootId);
    } catch (error) {
      console.error("Error deleting shoot:", error);
    } finally {
      setDeleteShootId(null);
    }
  };
  const renderShootCard = (
    shoot: IShootWithParticipants,
    showUserScore: boolean = false,
  ) => {
    const topScorer = getTopScorer(shoot);
    const userScore = showUserScore ? getUserScore(shoot) : null;
    const completedStations = shoot.participants.reduce((max, p) => {
      const completed = p.roundScores.filter((s) => s !== null).length;
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
                  Shoot on {formatDate(new Date(shoot.createdAt).getTime())}
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
                {shoot.createdBy === currentUser.id && (
                  <Button
                    variant="ghost"
                    color="red"
                    onClick={() => handleOnDelete(shoot.id)}
                  >
                    <Trash2 className="w-5 h-5 text-danger" />
                  </Button>
                )}
                <Button variant="ghost">
                  <ChevronRight
                    className="w-6 h-6"
                    onClick={() => router.push(`/shoot/summary/${shoot.id}`)}
                  />
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
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Progress</div>
            <div className="font-semibold">
              {completedStations} / 18 stations
            </div>
          </div>
          {userScore ? (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">
                Your Score
              </div>
              <div className="font-semibold">{userScore.score} pts</div>
            </div>
          ) : (
            topScorer && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Trophy className="w-3 h-3" />
                  Top Score
                </div>
                <div className="font-semibold">
                  {topScorer.name}: {topScorer.score}
                </div>
              </div>
            )
          )}
        </div>
      </Card>
    );
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
            <h1 className="text-xl font-semibold">Shoot History</h1>
          </div>
        </div>
      </header>
      {isLoading ? (
        <div className="p-4 text-center">Loading your shoot history...</div>
      ) : (
        <main className="container max-w-2xl mx-auto px-4 py-2">
          {participatedShoots.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg mb-2">No Shoot History</h3>
              <p className="text-muted-foreground mb-4">
                Your completed shoots will appear here
              </p>
            </div>
          ) : (
            <Tabs.Root
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as "tracked" | "participated")
              }
              style={{ width: "100%" }}
            >
              <Tabs.List size={"2"}>
                <Tabs.Trigger value="tracked" style={{ width: "33%" }}>
                  Tracked ({trackedShoots.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="participated" style={{ width: "34%" }}>
                  Participated ({participatedShoots.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="statistics" style={{ width: "33%" }}>
                  Statistics
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="tracked" className="space-y-4 mt-2">
                {trackedShoots.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No Tracked Shoots</h3>
                    <p className="text-sm text-muted-foreground">
                      Shoots you tracked for others will appear here
                    </p>
                  </div>
                ) : (
                  trackedShoots.map((shoot) => renderShootCard(shoot, false))
                )}
              </Tabs.Content>

              <Tabs.Content value="participated" className="space-y-4 mt-2">
                {participatedShoots.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">
                      No Participated Shoots
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Shoots where you were a participant will appear here
                    </p>
                  </div>
                ) : (
                  participatedShoots.map((shoot) =>
                    renderShootCard(shoot, true),
                  )
                )}
              </Tabs.Content>

              <Tabs.Content value="statistics" className="space-y-4 mt-2">
                <ShootsLineChart data={chartData} />
              </Tabs.Content>
            </Tabs.Root>
          )}
        </main>
      )}

      {/* Delete Confirmation Modal */}
      {deleteShootId && (
        <AlertDialog.Root
          open={true}
          onOpenChange={() => setDeleteShootId(null)}
        >
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>Delete Shoot</AlertDialog.Title>
            <AlertDialog.Description size="2">
              Are you sure? This action cannot be undone. This will permanently
              delete the shoot and all associated scores.
            </AlertDialog.Description>

            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </AlertDialog.Cancel>

              <Button variant="solid" color="red" onClick={finaliseDeleteShoot}>
                Delete Shoot
              </Button>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      )}
    </div>
  );
};
