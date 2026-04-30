"use client";
import { useDeleteShoot, useGetParticipatedShoots } from "@/hooks/queries";
import { IShootChartData, IUser } from "@/models";
import { Tabs } from "@radix-ui/themes";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteShootDialog } from "./history/DeleteShootDialog";
import { HistoryEmptyState } from "./history/HistoryEmptyState";
import { HistoryHeader } from "./history/HistoryHeader";
import { ShootHistoryCard } from "./history/ShootHistoryCard";
import { ForestLoader } from "../shared/ForestLoader";

const ShootsLineChart = dynamic(
  () =>
    import("@/components/shared/charts/ShootsLineChart").then(
      (mod) => mod.ShootsLineChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center p-4">
        <ForestLoader label="Loading statistics" size="lg" />
      </div>
    ),
  },
);

type HistoryPageProps = {
  currentUser: IUser;
  chartData: IShootChartData[];
};

export const HistoryPage = ({ currentUser, chartData }: HistoryPageProps) => {
  const [activeTab, setActiveTab] = useState<"tracked" | "participated">(
    "tracked",
  );
  const [deleteShootId, setDeleteShootId] = useState<string | null>(null);
  const { participatedShoots, trackedShoots, isLoading } =
    useGetParticipatedShoots(currentUser.id); // Refetch participated shoots to get latest data after deletion
  const { mutateAsync, isPending: isDeletingShoot } = useDeleteShoot();
  const onBack = () => {
    window.history.back();
  };

  const router = useRouter();

  const handleOnDelete = (shootId: string) => {
    setDeleteShootId(shootId);
  };

  const finaliseDeleteShoot = async () => {
    if (isDeletingShoot) return;
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

  return (
    <div className="min-h-screen bg-background">
      <HistoryHeader onBack={onBack} />
      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center p-4">
          <ForestLoader label="Loading your shoot history" size="lg" />
        </div>
      ) : (
        <main className="container max-w-2xl mx-auto px-4 py-2">
          {participatedShoots.length === 0 ? (
            <HistoryEmptyState
              title="No Shoot History"
              description="Your completed shoots will appear here"
            />
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
                  <HistoryEmptyState
                    compact
                    title="No Tracked Shoots"
                    description="Shoots you tracked for others will appear here"
                  />
                ) : (
                  trackedShoots.map((shoot) => (
                    <ShootHistoryCard
                      key={shoot.id}
                      currentUserId={currentUser.id}
                      onDelete={handleOnDelete}
                      onOpenSummary={(shootId) =>
                        router.push(`/shoot/summary/${shootId}`)
                      }
                      shoot={shoot}
                    />
                  ))
                )}
              </Tabs.Content>

              <Tabs.Content value="participated" className="space-y-4 mt-2">
                {participatedShoots.length === 0 ? (
                  <HistoryEmptyState
                    compact
                    title="No Participated Shoots"
                    description="Shoots where you were a participant will appear here"
                  />
                ) : (
                  participatedShoots.map((shoot) => (
                    <ShootHistoryCard
                      key={shoot.id}
                      currentUserId={currentUser.id}
                      onDelete={handleOnDelete}
                      onOpenSummary={(shootId) =>
                        router.push(`/shoot/summary/${shootId}`)
                      }
                      shoot={shoot}
                      showUserScore
                    />
                  ))
                )}
              </Tabs.Content>

              <Tabs.Content value="statistics" className="space-y-4 mt-2">
                <ShootsLineChart data={chartData} />
              </Tabs.Content>
            </Tabs.Root>
          )}
        </main>
      )}

      <DeleteShootDialog
        isDeleting={isDeletingShoot}
        open={deleteShootId !== null}
        onConfirm={finaliseDeleteShoot}
        onOpenChange={() => {
          if (!isDeletingShoot) {
            setDeleteShootId(null);
          }
        }}
      />
    </div>
  );
};
