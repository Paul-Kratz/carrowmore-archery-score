import { fireEvent, render, screen } from "@testing-library/react";
import { type IShootChartData } from "@/models";
import { ShootsLineChart } from "./ShootsLineChart";

jest.mock("@/constants", () => ({
  CLUBS: {
    carrowmore: {
      id: "carrowmore",
      name: "Carrowmore Archery",
      totalStations: 18,
    },
    testclub: {
      id: "testclub",
      name: "Test Club",
      totalStations: 6,
    },
  },
}));

jest.mock("recharts", () => ({
  CartesianGrid: () => null,
  Dot: () => null,
  Line: () => null,
  LineChart: ({
    data,
    children,
  }: {
    data: unknown[];
    children: React.ReactNode;
  }) => (
    <div data-testid="line-chart" data-points={data.length}>
      {children}
    </div>
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

const chartData: IShootChartData[] = [
  {
    id: "shoot-1",
    clubId: "carrowmore",
    createdAt: "2026-01-01T00:00:00.000Z",
    completed: true,
    totalStations: 18,
    participant: {
      id: "participant-1",
      user: "user-1",
      pegColor: "yellow",
      totalScore: 50,
      scoredCount: 3,
      scores: [
        { id: "score-1", roundNumber: 1, score: 20 },
        { id: "score-2", roundNumber: 2, score: 16 },
        { id: "score-3", roundNumber: 3, score: 14 },
      ],
    },
  },
  {
    id: "shoot-2",
    clubId: "testclub",
    createdAt: "2026-01-02T00:00:00.000Z",
    completed: true,
    totalStations: 6,
    participant: {
      id: "participant-2",
      user: "user-1",
      pegColor: "blue",
      totalScore: 18,
      scoredCount: 2,
      scores: [
        { id: "score-4", roundNumber: 1, score: 10 },
        { id: "score-5", roundNumber: 2, score: 8 },
      ],
    },
  },
];

describe("ShootsLineChart", () => {
  it("filters score and station charts by selected club", () => {
    render(<ShootsLineChart data={chartData} />);

    expect(screen.getByRole("button", { name: "All clubs" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getAllByTestId("line-chart")).toEqual([
      expect.objectContaining({ dataset: expect.objectContaining({ points: "2" }) }),
      expect.objectContaining({ dataset: expect.objectContaining({ points: "2" }) }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Carrowmore Archery" }));

    expect(
      screen.getByRole("button", { name: "Carrowmore Archery" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByTestId("line-chart")).toEqual([
      expect.objectContaining({ dataset: expect.objectContaining({ points: "1" }) }),
      expect.objectContaining({ dataset: expect.objectContaining({ points: "1" }) }),
    ]);
  });

  it("uses the selected club station count for station trend pills", () => {
    render(<ShootsLineChart data={chartData} />);

    expect(
      screen.getByRole("button", { name: "Show station 18 trend" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Test Club" }));

    expect(
      screen.getByRole("button", { name: "Show station 6 trend" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Show station 7 trend" }),
    ).not.toBeInTheDocument();
  });
});
