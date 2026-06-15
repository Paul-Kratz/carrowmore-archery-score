"use client";

import { CLUBS } from "@/constants";
import { IShootChartData } from "@/models";
import { Target, TrendingUp, TreePine } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PegScoreDot, PegScoreTooltip } from "./PegScoreChartParts";
import { StationLineChart } from "./StationLineChart";

const DEEP_FOREST_GREEN = "#123426";
const MOSS = "#6d7f47";
const TAN_GRID_LINE = "#d8cfb8";

const formatShortDate = (createdAt: string) => {
  const date = new Date(createdAt);
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const getShootClubId = (shoot: IShootChartData) => shoot.clubId || "carrowmore";
const getShootTotalScore = (shoot: IShootChartData) =>
  shoot.participant.totalScore;

const TrendStat = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) => (
  <div>
    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    <div className="text-xl font-bold leading-tight text-(--deep-forest-green)">
      {value}
    </div>
    {helper && <div className="text-xs text-muted-foreground">{helper}</div>}
  </div>
);

export const ShootsLineChart = ({ data }: { data: IShootChartData[] }) => {
  const [selectedClubId, setSelectedClubId] = useState("all");
  const clubIds = useMemo(
    () =>
      Array.from(new Set(data.map(getShootClubId))).filter(
        (clubId) => CLUBS[clubId],
      ),
    [data],
  );
  const filteredData =
    selectedClubId === "all"
      ? data
      : data.filter((shoot) => getShootClubId(shoot) === selectedClubId);
  const sorted = [...filteredData].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const latestShoot = sorted.at(-1);
  const previousShoot = sorted.at(-2);
  const bestScore =
    sorted.length > 0
      ? Math.max(...sorted.map((shoot) => getShootTotalScore(shoot)))
      : null;
  const averageScore =
    sorted.length > 0
      ? Math.round(
          sorted.reduce((total, shoot) => total + getShootTotalScore(shoot), 0) /
            sorted.length,
        )
      : null;
  const latestChange =
    latestShoot && previousShoot
      ? getShootTotalScore(latestShoot) - getShootTotalScore(previousShoot)
      : null;
  const latestChangeLabel =
    latestChange === null
      ? "First result"
      : `${latestChange >= 0 ? "+" : ""}${latestChange} from previous`;

  const chartData = sorted.map((shoot) => ({
    date: formatShortDate(shoot.createdAt),
    score: getShootTotalScore(shoot),
    pegColor: shoot.participant.pegColor,
  }));

  if (sorted.length === 0) {
    return (
      <div className="forest-chart-panel rounded-xl border border-border p-4 text-center shadow-sm">
        <TreePine className="mx-auto mb-2 h-8 w-8 text-(--deep-forest-green)" />
        <h3 className="font-semibold text-(--deep-forest-green)">No trends yet</h3>
        <p className="text-sm text-muted-foreground">
          Shoot statistics will appear once you have scored a round.
        </p>
      </div>
    );
  }

  return (
    <div className="forest-chart-panel rounded-xl border border-border p-3 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            Trends
          </div>
          <h3 className="text-lg font-bold leading-tight text-(--deep-forest-green)">
            Score trend
          </h3>
        </div>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          aria-pressed={selectedClubId === "all"}
          onClick={() => setSelectedClubId("all")}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
            selectedClubId === "all"
              ? "border-(--deep-forest-green) bg-(--deep-forest-green) text-primary-foreground"
              : "border-border bg-card/80 text-(--deep-forest-green)"
          }`}
        >
          All clubs
        </button>
        {clubIds.map((clubId) => (
          <button
            key={clubId}
            type="button"
            aria-pressed={selectedClubId === clubId}
            onClick={() => setSelectedClubId(clubId)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              selectedClubId === clubId
                ? "border-(--deep-forest-green) bg-(--deep-forest-green) text-primary-foreground"
                : "border-border bg-card/80 text-(--deep-forest-green)"
            }`}
          >
            {CLUBS[clubId].name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-b border-border/70 pb-3">
        <TrendStat label="Rounds" value={sorted.length} />
        <TrendStat label="Best" value={bestScore ?? "-"} />
        <TrendStat label="Average" value={averageScore ?? "-"} />
        <TrendStat
          label="Latest"
          value={latestShoot ? getShootTotalScore(latestShoot) : "-"}
          helper={latestChangeLabel}
        />
      </div>

      <div className="pt-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-(--deep-forest-green)">
          <Target className="h-4 w-4" />
          Total score
        </div>
        <div className="forest-chart-surface h-[220px] px-1 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
            >
              <CartesianGrid stroke={TAN_GRID_LINE} strokeDasharray="4 4" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: MOSS }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tickMargin={6}
                tick={{ fontSize: 11, fill: MOSS }}
                width={48}
              />
              <Tooltip
                content={<PegScoreTooltip />}
                cursor={{ stroke: MOSS }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={DEEP_FOREST_GREEN}
                strokeWidth={2.5}
                dot={<PegScoreDot />}
                activeDot={{
                  r: 7,
                  fill: DEEP_FOREST_GREEN,
                  stroke: "#fbf7e8",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <StationLineChart data={filteredData} />
    </div>
  );
};
