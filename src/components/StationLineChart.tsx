"use client";
import { IShootChartData } from "@/models";
import { Select } from "@radix-ui/themes";
import { useState } from "react";
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

const STATIONS = Array.from({ length: 18 }, (_, i) => i);

const formatDate = (createdAt: string) => {
  const date = new Date(createdAt);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ModeDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (payload.score === null || payload.score === undefined) return null;
  const fill = payload.mode === "red" ? "#dc2626" : "#ca8a04";
  return (
    <Dot cx={cx} cy={cy} r={5} fill={fill} stroke="white" strokeWidth={1} />
  );
};

export const StationLineChart = ({ data }: { data: IShootChartData[] }) => {
  const [selectedStation, setSelectedStation] = useState(0);

  const sorted = [...data].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const chartData = sorted.map((shoot) => ({
    date: formatDate(shoot.createdAt),
    score: shoot.roundScores[selectedStation] ?? null,
    mode: shoot.mode,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between items-center">
        <h1>Score per station</h1>
        <Select.Root
          value={String(selectedStation)}
          onValueChange={(v) => setSelectedStation(Number(v))}
        >
          <Select.Trigger />
          <Select.Content>
            {STATIONS.map((i) => (
              <Select.Item key={i} value={String(i)}>
                Station {i + 1}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      <ResponsiveContainer width="100%" height={300} className="mt-3">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            ticks={[0, 4, 8, 10, 14, 16, 20]}
            width={30}
          />
          <Tooltip
            formatter={(value) => [value ?? "No score", "Score"]}
            labelFormatter={(label, payload) => {
              const mode = payload?.[0]?.payload?.mode;
              return `${label} (${mode ?? ""})`;
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6b7280"
            strokeWidth={1.5}
            dot={<ModeDot />}
            activeDot={{ r: 6 }}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
