"use client";

import { CLUBS } from "@/constants";
import { IShootChartData } from "@/models";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Dot,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const FOREST = "#123426";
const MOSS = "#6d7f47";
const PARCHMENT_LINE = "#d8cfb8";
const RED_MODE = "#9f1418";
const YELLOW_MODE = "#b8871a";

const formatShortDate = (createdAt: string) => {
  const date = new Date(createdAt);
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const getModeColor = (mode?: string) =>
  mode === "red" ? RED_MODE : YELLOW_MODE;

type ModeDotProps = {
  cx?: number;
  cy?: number;
  payload?: {
    mode?: string;
    score?: number | null;
  };
};

const ModeDot = ({ cx, cy, payload }: ModeDotProps) => {
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  if (payload?.score === null || payload?.score === undefined) return null;

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={5}
      fill={getModeColor(payload.mode)}
      stroke="#fbf7e8"
      strokeWidth={2}
    />
  );
};

type StationTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{
    value?: number | null;
    payload?: {
      mode?: string;
    };
  }>;
};

const StationTooltip = ({ active, label, payload }: StationTooltipProps) => {
  if (!active || !payload?.length) return null;

  const score = payload[0]?.value;
  const mode = payload[0]?.payload?.mode;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <div className="font-semibold text-(--club-red-dark)">{label}</div>
      <div className="text-muted-foreground">
        {score ?? "No score"} points
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs uppercase text-muted-foreground">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: getModeColor(mode) }}
        />
        {mode ?? "unknown"} peg
      </div>
    </div>
  );
};

const StationStat = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div>
    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    <div className="text-lg font-bold leading-tight text-(--club-red-dark)">
      {value}
    </div>
  </div>
);

export const StationLineChart = ({ data }: { data: IShootChartData[] }) => {
  const [selectedStation, setSelectedStation] = useState(0);
  const stationCount = Math.max(
    1,
    ...data.map(
      (shoot) => CLUBS[shoot.clubId || "carrowmore"]?.totalStations ?? 18,
    ),
  );
  const stations = Array.from({ length: stationCount }, (_, i) => i);
  const activeStation = Math.min(selectedStation, stationCount - 1);

  const sorted = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [data],
  );

  const chartData = sorted.map((shoot) => ({
    date: formatShortDate(shoot.createdAt),
    score: shoot.roundScores[activeStation] ?? null,
    mode: shoot.mode,
  }));
  const stationScores = chartData
    .map((point) => point.score)
    .filter((score): score is number => typeof score === "number");
  const bestScore =
    stationScores.length > 0 ? Math.max(...stationScores) : null;
  const averageScore =
    stationScores.length > 0
      ? Math.round(
          stationScores.reduce((total, score) => total + score, 0) /
            stationScores.length,
        )
      : null;

  return (
    <section className="mt-3 border-t border-border/70 pt-3">
      <div className="mb-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-(--club-red-dark)">
            <MapPin className="h-4 w-4" />
            Station trend
          </div>
          <p className="text-xs text-muted-foreground">
            Track one station across previous rounds.
          </p>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-3 gap-x-4">
        <StationStat label="Station" value={activeStation + 1} />
        <StationStat label="Best" value={bestScore ?? "-"} />
        <StationStat label="Average" value={averageScore ?? "-"} />
      </div>

      <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {stations.map((station) => {
          const selected = station === activeStation;

          return (
            <button
              key={station}
              type="button"
              aria-pressed={selected}
              aria-label={`Show station ${station + 1} trend`}
              onClick={() => setSelectedStation(station)}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-bold transition-colors ${
                selected
                  ? "border-(--club-red-dark) bg-(--club-red-dark) text-primary-foreground"
                  : "border-border bg-card/75 text-(--club-red-dark)"
              }`}
            >
              {station + 1}
            </button>
          );
        })}
      </div>

      <div className="forest-chart-surface h-[210px] px-1 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
          >
            <CartesianGrid stroke={PARCHMENT_LINE} strokeDasharray="4 4" />
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
              ticks={[0, 4, 8, 10, 14, 16, 20]}
              width={48}
            />
            <Tooltip content={<StationTooltip />} cursor={{ stroke: MOSS }} />
            <Line
              type="monotone"
              dataKey="score"
              stroke={FOREST}
              strokeWidth={2}
              dot={<ModeDot />}
              activeDot={{
                r: 7,
                fill: FOREST,
                stroke: "#fbf7e8",
                strokeWidth: 2,
              }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
