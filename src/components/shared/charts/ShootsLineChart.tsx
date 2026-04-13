"use client";
import { IShootChartData } from "@/models";
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
import { StationLineChart } from "./StationLineChart";

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
  const fill = payload.mode === "red" ? "#dc2626" : "#ca8a04";
  return (
    <Dot cx={cx} cy={cy} r={5} fill={fill} stroke="white" strokeWidth={1} />
  );
};

export const ShootsLineChart = ({ data }: { data: IShootChartData[] }) => {
  const sorted = [...data].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const chartData = sorted.map((shoot) => ({
    date: formatDate(shoot.createdAt),
    score: shoot.totalScore,
    mode: shoot.mode,
  }));

  return (
    <>
      <h1>Total Score across all shoots</h1>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={30} />
          <Tooltip
            formatter={(value) => [value, "Score"]}
            labelFormatter={(label, payload) => {
              const mode = payload?.[0]?.payload?.mode;
              return `${label} (${mode ?? ""})`;
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6b7280"
            strokeWidth={2}
            dot={<ModeDot />}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <StationLineChart data={data} />
    </>
  );
};
