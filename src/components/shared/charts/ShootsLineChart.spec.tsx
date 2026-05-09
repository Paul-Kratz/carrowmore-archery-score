import { fireEvent, render, screen } from "@testing-library/react";
import { Mode, type IShootChartData } from "@/models";
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
    mode: Mode.red,
    createdAt: "2026-01-01T00:00:00.000Z",
    roundScores: [20, 16, 14],
    totalScore: 50,
  },
  {
    id: "shoot-2",
    clubId: "testclub",
    mode: Mode.yellow,
    createdAt: "2026-01-02T00:00:00.000Z",
    roundScores: [10, 8],
    totalScore: 18,
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
