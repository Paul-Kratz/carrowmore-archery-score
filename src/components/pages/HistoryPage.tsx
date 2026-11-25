"use client";
import { useGetParticipatedShoots } from "@/hooks/queries";
import { IShootChartData, IUser, Shoot } from "@/models";
import { ArrowLeft, BarChart3, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { HistoryEmptyState } from "./history/HistoryEmptyState";
import { ScorebookHeader } from "../shared/ScorebookHeader";
import { scorebookStyles, scorebookTheme } from "../shared/scorebookTheme";
import { Button, Theme } from "@radix-ui/themes";
import { oswald } from "@/fonts/oswald";
import { ShootHistoryCard } from "./history/ShootHistoryCard";
import { ForestLoader } from "../shared/ForestLoader";
import { formatHistoryDate } from "./history/historyUtils";

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
  shoot: Shoot;
  shotByCurrentUser: boolean;
  trackedByCurrentUser: boolean;
};

const getEmptyFilterTitle = (filter: HistoryFilter) => {
  if (filter === "shot") return "No shoots tracked by others";
  if (filter === "tracked") return "No Tracked Shoots";
  return "No Shoot History";
};

const getEmptyFilterDescription = (filter: HistoryFilter) => {
  if (filter === "shot") return "Shoots you participated in but someone else tracked will appear here.";
  if (filter === "tracked") {
    return "Shoots you tracked for others will appear here";
  }

  return "Your completed shoots will appear here";
};

export const HistoryPage = ({ currentUser, chartData }: HistoryPageProps) => {
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [showTrends, setShowTrends] = useState(false);
  const { participatedShoots, trackedShoots, isLoading, isError, refetch, isFetching } =
    useGetParticipatedShoots(currentUser.id);
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
          existing?.trackedByCurrentUser || shoot.isCreatedBy(currentUser.id),
      });
    });

    return [...shootsById.values()].sort(
      (itemA, itemB) =>
        new Date(itemB.shoot.createdAt).getTime() -
        new Date(itemA.shoot.createdAt).getTime(),
    );
  }, [currentUser.id, participatedShoots, trackedShoots]);

  const shotCount = historyFeed.filter((item) => item.shotByCurrentUser && !item.trackedByCurrentUser).length;
  const trackedCount = historyFeed.filter(
    (item) => item.trackedByCurrentUser,
  ).length;
  const filteredFeed = historyFeed.filter((item) => {
    if (historyFilter === "shot") return item.shotByCurrentUser && !item.trackedByCurrentUser;
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

  return (
    <Theme accentColor="green" grayColor="olive" radius="small" panelBackground="solid" style={scorebookTheme} className="min-h-dvh bg-background text-foreground">
      <ScorebookHeader rightSlot={
        <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-sm px-2 text-sm text-primary-foreground/85 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back
        </button>
      } />
      <main className="mx-auto w-full max-w-2xl px-5 pt-8 pb-12 sm:px-8 sm:pt-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className={`${oswald.className} text-4xl leading-tight font-normal`}>History</h1>
          {historyFeed.length > 0 && (
            <button type="button" aria-expanded={showTrends} aria-controls="history-trends" onClick={() => setShowTrends((value) => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-sm px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
              <BarChart3 aria-hidden="true" className="h-4 w-4" /> Trends
              <ChevronDown aria-hidden="true" className={`h-4 w-4 ${showTrends ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
        {isError && historyFeed.length > 0 && (
          <div role="status" className="mb-5 border-l-2 border-input pl-3 text-sm text-muted-foreground">
            <p>History couldn’t refresh. Showing saved results.</p>
            <Button variant="ghost" disabled={isFetching} onClick={() => void refetch()} className="mt-1! min-h-11! px-0! font-semibold! text-foreground!">{isFetching ? "Trying again…" : "Try again"}</Button>
          </div>
        )}
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center"><ForestLoader label="Loading your shoot history" size="lg" /></div>
        ) : isError && historyFeed.length === 0 ? (
          <HistoryEmptyState title="Unable to load history" description="Check your connection and try again." action={<Button disabled={isFetching} className={scorebookStyles.primaryButton} onClick={() => void refetch()}>{isFetching ? "Trying again…" : "Try again"}</Button>} />
        ) : historyFeed.length === 0 ? (
          <HistoryEmptyState title="No shoot history yet" description="Your shoots will appear here once you start tracking." action={<Button className={scorebookStyles.primaryButton} onClick={() => router.push("/")}>New shoot</Button>} />
        ) : (
          <>
            <div role="group" aria-label="Filter shoots" className="mb-4 grid grid-cols-3 gap-2">
              {filterOptions.map((option) => (
                <button key={option.value} type="button" aria-pressed={option.value === historyFilter} onClick={() => setHistoryFilter(option.value)} className={`min-h-11 rounded-sm border px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${option.value === historyFilter ? "border-foreground bg-foreground font-semibold text-white" : "border-input bg-card hover:border-foreground"}`}>
                  {option.label} <span className="ml-1 tabular-nums">{option.count}</span>
                </button>
              ))}
            </div>
            {showTrends && <section id="history-trends" aria-label="Your score trends" className="mb-6"><ShootsLineChart data={chartData} /></section>}
            <section aria-label="Shoot history">
              {filteredFeed.length === 0 ? (
                <HistoryEmptyState compact title={getEmptyFilterTitle(historyFilter)} description={getEmptyFilterDescription(historyFilter)} />
              ) : (
                <ol role="list" aria-label="Shoot timeline" className="ml-1 border-l border-border">
                  {filteredFeed.map((item) => (
                    <li key={item.shoot.id} className="relative pb-5 pl-5 last:pb-0 sm:pl-7">
                      <span aria-hidden="true" className="absolute top-0.5 -left-2 h-4 w-4 rounded-full border-2 border-background bg-primary ring-4 ring-background" />
                      <time dateTime={item.shoot.createdAt.toISOString()} className="mb-1 block text-sm leading-5 text-muted-foreground">{formatHistoryDate(item.shoot.createdAt.getTime())}</time>
                      <ShootHistoryCard onOpenSummary={(shootId) => router.push(`/shoot/summary/${shootId}`)} shoot={item.shoot} showUserScore={item.shotByCurrentUser} />
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </main>
    </Theme>
  );
};
