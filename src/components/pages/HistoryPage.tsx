"use client";
import { useDeleteShoot, useGetParticipatedShoots } from "@/hooks/queries";
import { IShootChartData, IShootWithParticipants, IUser } from "@/models";
import { BarChart3, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DeleteShootDialog } from "./history/DeleteShootDialog";
import { HistoryEmptyState } from "./history/HistoryEmptyState";
import { Header } from "../shared/Header";
import { ShootHistoryCard } from "./history/ShootHistoryCard";
import { formatHistoryDate, getUserStanding } from "./history/historyUtils";
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

type HistoryFilter = "all" | "shot" | "tracked";

type HistoryFeedItem = {
  shoot: IShootWithParticipants;
  shotByCurrentUser: boolean;
  trackedByCurrentUser: boolean;
};

const getRelationshipLabel = (item: HistoryFeedItem) => {
  if (item.shotByCurrentUser && item.trackedByCurrentUser) {
    return "Shot + tracked";
  }

  if (item.shotByCurrentUser) {
    return "Shot by you";
  }

  return "Tracked by you";
};

const getEmptyFilterTitle = (filter: HistoryFilter) => {
  if (filter === "shot") return "No Shoots Yet";
  if (filter === "tracked") return "No Tracked Shoots";
  return "No Shoot History";
};

const getEmptyFilterDescription = (filter: HistoryFilter) => {
  if (filter === "shot") return "Shoots where you scored will appear here";
  if (filter === "tracked") {
    return "Shoots you tracked for others will appear here";
  }

  return "Your completed shoots will appear here";
};

export const HistoryPage = ({ currentUser, chartData }: HistoryPageProps) => {
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [showTrends, setShowTrends] = useState(false);
  const [deleteShootId, setDeleteShootId] = useState<string | null>(null);
  const { participatedShoots, trackedShoots, isLoading } =
    useGetParticipatedShoots(currentUser.id); // Refetch participated shoots to get latest data after deletion
  const { mutateAsync, isPending: isDeletingShoot } = useDeleteShoot();
  const onBack = () => {
    window.history.back();
  };

  const router = useRouter();
  const historyFeed = useMemo(() => {
    const shootsById = new Map<string, HistoryFeedItem>();

    trackedShoots.forEach((shoot) => {
      shootsById.set(shoot.id, {
        shoot,
        shotByCurrentUser: false,
        trackedByCurrentUser: true,
      });
    });

    participatedShoots.forEach((shoot) => {
      const existing = shootsById.get(shoot.id);

      shootsById.set(shoot.id, {
        shoot,
        shotByCurrentUser: true,
        trackedByCurrentUser:
          existing?.trackedByCurrentUser || shoot.createdBy === currentUser.id,
      });
    });

    return [...shootsById.values()].sort(
      (itemA, itemB) =>
        new Date(itemB.shoot.createdAt).getTime() -
        new Date(itemA.shoot.createdAt).getTime(),
    );
  }, [currentUser.id, participatedShoots, trackedShoots]);

  const shotCount = historyFeed.filter(
    (item) => item.shotByCurrentUser,
  ).length;
  const trackedCount = historyFeed.filter(
    (item) => item.trackedByCurrentUser,
  ).length;
  const filteredFeed = historyFeed.filter((item) => {
    if (historyFilter === "shot") return item.shotByCurrentUser;
    if (historyFilter === "tracked") return item.trackedByCurrentUser;
    return true;
  });
  const filterOptions: Array<{
    value: HistoryFilter;
    label: string;
    count: number;
  }> = [
    { value: "all", label: "All", count: historyFeed.length },
    { value: "shot", label: "Shot", count: shotCount },
    { value: "tracked", label: "Tracked", count: trackedCount },
  ];
  const bestPersonalScore = participatedShoots.reduce(
    (bestScore, shoot) =>
      Math.max(bestScore, getUserStanding(shoot, currentUser.id)?.score ?? 0),
    0,
  );
  const latestShoot = historyFeed[0]?.shoot;

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
    <div
      className="forest-page h-dvh overflow-y-auto bg-background"
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
    >
      <Header
        onBack={onBack}
        title="Trail Log"
        subtitle="Past rounds and scores"
        showBackButton={true}
      />
      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center p-4">
          <ForestLoader label="Loading your shoot history" size="lg" />
        </div>
      ) : (
        <>
          <main className="container max-w-2xl mx-auto px-4 py-3 pb-10">
            {historyFeed.length === 0 ? (
              <HistoryEmptyState
                title="No Shoot History"
                description="Your completed shoots will appear here"
              />
            ) : (
              <>
                <section className="mb-4">
                  <div className="mb-2 flex items-end justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold leading-tight text-(--club-red-dark)">
                        Shoot history
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {latestShoot
                          ? `Latest ${formatHistoryDate(
                              new Date(latestShoot.createdAt).getTime(),
                            )}`
                          : "No rounds yet"}
                      </p>
                    </div>
                    <div className="text-right text-xs leading-5 text-muted-foreground">
                      <div>{historyFeed.length} rounds</div>
                      <div>Best {bestPersonalScore || "-"}</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {trackedShoots.length} tracked by you
                  </p>

                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {filterOptions.map((option) => {
                      const selected = option.value === historyFilter;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setHistoryFilter(option.value)}
                          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                            selected
                              ? "border-(--club-red-dark) bg-(--club-red-dark) text-primary-foreground"
                              : "border-border bg-card/80 text-(--club-red-dark)"
                          }`}
                        >
                          {option.label}
                          <span className="ml-1 text-xs opacity-80">
                            {option.count}
                          </span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      aria-expanded={showTrends}
                      onClick={() => setShowTrends((value) => !value)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                        showTrends
                          ? "border-(--club-red-dark) bg-(--club-red-dark) text-primary-foreground"
                          : "border-border bg-card/80 text-(--club-red-dark)"
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Trends
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          showTrends ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                </section>

                {showTrends && (
                  <section className="mb-3">
                    <ShootsLineChart data={chartData} />
                  </section>
                )}

                <section className="space-y-2.5">
                  {filteredFeed.length === 0 ? (
                    <HistoryEmptyState
                      compact
                      title={getEmptyFilterTitle(historyFilter)}
                      description={getEmptyFilterDescription(historyFilter)}
                    />
                  ) : (
                    filteredFeed.map((item) => (
                      <ShootHistoryCard
                        key={item.shoot.id}
                        currentUserId={currentUser.id}
                        onDelete={handleOnDelete}
                        onOpenSummary={(shootId) =>
                          router.push(`/shoot/summary/${shootId}`)
                        }
                        relationLabel={getRelationshipLabel(item)}
                        shoot={item.shoot}
                        showUserScore={item.shotByCurrentUser}
                      />
                    ))
                  )}
                </section>
              </>
            )}
          </main>
        </>
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
