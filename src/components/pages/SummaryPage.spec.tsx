import { fireEvent, render, screen, within } from "@testing-library/react";
import { SummaryPage } from "./SummaryPage";
import { createTestShootData, testUser } from "@/testFixtures/shoot";
import type { IShootDenormalized } from "@/models";

jest.mock("@/fonts/oswald", () => ({ oswald: { className: "oswald" } }));

const renderSummary = (overrides: Partial<IShootDenormalized> = {}) =>
  render(<SummaryPage currentUser={testUser} shootInfo={createTestShootData(overrides)} />);

it("leads with group totals and omits repeated headline statistics", () => {
  renderSummary();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Shoot summary");
  expect(screen.getByText("Carrowmore Archery")).toBeInTheDocument();
  const totals = screen.getByRole("table", { name: "Archer totals" });
  expect(within(totals).getByRole("cell", { name: "20" })).toBeInTheDocument();
  expect(within(totals).getByRole("cell", { name: "1/2" })).toBeInTheDocument();
  expect(screen.queryByText("Top Score")).not.toBeInTheDocument();
  expect(screen.queryByText("Best score 20")).not.toBeInTheDocument();
  expect(totals.compareDocumentPosition(screen.getByRole("region", { name: "Station breakdown" })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.getByRole("list", { name: "Alice (you) station breakdown" })).toBeInTheDocument();
});

it("shows all archers before detailed score patterns, retaining names, pegs and guests", () => {
  const data = createTestShootData();
  renderSummary({ participants: [...data.participants, {
    ...data.participants[0], id: "guest-1", user: null, guestName: "Ciarán O’Sullivan", pegColor: "blue",
  }] });
  const totals = screen.getByRole("table", { name: "Archer totals" });
  expect(within(totals).getByText("Alice (you)")).toBeInTheDocument();
  expect(within(totals).getByText("Ciarán O’Sullivan")).toBeInTheDocument();
  expect(within(totals).getByText("Red peg")).toBeInTheDocument();
  expect(within(totals).getByText("Blue peg")).toBeInTheDocument();
  expect(within(totals).getByText("Guest")).toBeInTheDocument();
  const disclosure = screen.getByText("Score patterns").closest("details")!;
  expect(disclosure.open).toBe(false);
  fireEvent.click(screen.getByText("Score patterns"));
  expect(disclosure.open).toBe(true);
  expect(screen.getByRole("article", { name: "Alice (you) score pattern" })).toBeVisible();
});

it("uses the shoot's persisted station count, renders absent stations and distinguishes zero", () => {
  const participant = createTestShootData().participants[0];
  renderSummary({ totalStations: 3, participants: [{
    ...participant, scores: [{ roundNumber: 1, score: 0 }, { roundNumber: 3, score: 10 }],
    totalScore: 10, scoredCount: 2,
  }] });
  expect(screen.getByLabelText("Alice (you) station 1 score 0")).toHaveTextContent("0");
  expect(screen.getByLabelText("Alice (you) station 2 score not scored")).toHaveTextContent("—");
  expect(screen.getByLabelText("Alice (you) station 3 score 10")).toHaveTextContent("10");
  expect(screen.queryByLabelText(/station 4 score/)).not.toBeInTheDocument();
  expect(within(screen.getByRole("table", { name: "Archer totals" })).getByText("2/3")).toBeInTheDocument();
});

it("does not represent an unscored archer as a zero score", () => {
  const participant = createTestShootData().participants[0];
  renderSummary({ participants: [{ ...participant, scores: [], scoredCount: 0, totalScore: 0 }] });
  expect(screen.getByLabelText("No scores yet")).toHaveTextContent("—");
  expect(screen.getByText("Average per scored station: —")).toBeInTheDocument();
});

it.each(["carrowmore", "marbleArchers"])("retains score distributions and recorded zero counts for %s", clubId => {
  const participant = createTestShootData().participants[0];
  renderSummary({ clubId, participants: [{ ...participant,
    scores: [{ roundNumber: 1, score: 20 }, { roundNumber: 2, score: 0 }], totalScore: 20, scoredCount: 2,
  }] });
  fireEvent.click(screen.getByText("Score patterns"));
  expect(screen.getByLabelText("Score 20 count 1")).toBeVisible();
  expect(screen.getByLabelText("Score 0 count 1")).toBeVisible();
  if (clubId === "marbleArchers") expect(screen.getByLabelText("Score 18 count 0")).toBeVisible();
  expect(screen.getByText("Average per scored station: 10.00")).toBeVisible();
});

it("retains historical score values even for a removed club", () => {
  const participant = createTestShootData().participants[0];
  renderSummary({ clubId: "old-club", participants: [{ ...participant,
    scores: [{ roundNumber: 1, score: 17 }], totalScore: 17,
  }] });
  expect(screen.getByText("old-club")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Score patterns"));
  expect(screen.getByLabelText("Score 17 count 1")).toBeVisible();
});

it("shows only meaningful notes and identifies the tracker once", () => {
  const { rerender } = renderSummary({ notes: "Sunny morning" });
  expect(screen.getByText("Sunny morning")).toBeInTheDocument();
  expect(screen.getByText("Tracked by you")).toBeInTheDocument();
  rerender(<SummaryPage currentUser={testUser} shootInfo={createTestShootData({ createdBy: "someone-else", notes: "   " })} />);
  expect(screen.queryByText("Notes")).not.toBeInTheDocument();
  expect(screen.queryByText("No notes")).not.toBeInTheDocument();
  expect(screen.queryByText("Tracked by you")).not.toBeInTheDocument();
});

it.each([
  [{ completed: true }, "Complete"],
  [{ completed: false, scoredCount: 2 }, "All scored"],
  [{ completed: false, scoredCount: 1 }, "In progress"],
] as const)("keeps completion state truthful", (overrides, expected) => {
  renderSummary(overrides);
  expect(screen.getByText(new RegExp(`^${expected} ·`))).toBeInTheDocument();
});

it("handles an empty shoot without misleading score tables", () => {
  renderSummary({ participants: [], participantCount: 0, scoredCount: 0, totalScoreSlots: 0 });
  expect(screen.getByText("There are no archers in this shoot.")).toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

it("preserves back navigation", () => {
  const back = jest.spyOn(window.history, "back").mockImplementation(() => {});
  renderSummary();
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(back).toHaveBeenCalledTimes(1);
  back.mockRestore();
});
