import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { SummaryPage } from "./SummaryPage";
import { createTestShootData, testUser } from "@/testFixtures/shoot";
import type { IShootDenormalized } from "@/models";
import { Shoot } from "@/models";
import { StationBreakdownCard } from "./summary/StationBreakdownCard";

jest.mock("@/fonts/oswald", () => ({ oswald: { className: "oswald" } }));

const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockDelete = jest.fn();
let mockDeleting = false;
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }) }));
jest.mock("@/hooks/queries", () => ({ useDeleteShoot: () => ({ mutateAsync: mockDelete, isPending: mockDeleting }) }));
beforeEach(() => {
  jest.clearAllMocks();
  mockDeleting = false;
  mockDelete.mockResolvedValue(undefined);
});

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

it.each([false, true])("limits another-tracked shoot to own breakdowns while retaining every total (redacted=%s)", (redacted) => {
  const participant = createTestShootData().participants[0];
  renderSummary({ createdBy: "other-tracker", participants: [participant, {
    ...participant, id: "bob", user: { id: "other-tracker", name: "Bob" }, totalScore: 18,
    scores: redacted ? [] : [{ roundNumber: 1, score: 18 }],
    scoreDetailsVisible: !redacted,
  }, {
    ...participant, id: "guest", user: null, guestName: "Guest archer", totalScore: 10,
    scores: redacted ? [] : [{ roundNumber: 1, score: 10 }],
    scoreDetailsVisible: !redacted,
  }] });
  const totals = screen.getByRole("table", { name: "Archer totals" });
  expect(within(totals).getByRole("cell", { name: "18" })).toBeInTheDocument();
  expect(within(totals).getByRole("cell", { name: "10" })).toBeInTheDocument();
  expect(within(totals).getAllByText("1/2")).toHaveLength(3);
  expect(screen.getByRole("list", { name: "Alice (you) station breakdown" })).toBeInTheDocument();
  expect(screen.queryByRole("list", { name: "Bob station breakdown" })).not.toBeInTheDocument();
  expect(screen.queryByRole("list", { name: "Guest archer station breakdown" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByText("Score patterns"));
  expect(screen.getByRole("article", { name: "Alice (you) score pattern" })).toBeVisible();
  expect(screen.queryByRole("article", { name: "Bob score pattern" })).not.toBeInTheDocument();
  expect(screen.queryByRole("article", { name: "Guest archer score pattern" })).not.toBeInTheDocument();
});

it("omits the detail sections entirely when no score breakdown is visible", () => {
  const participant = createTestShootData().participants[0];
  renderSummary({ createdBy: "other-tracker", participants: [{
    ...participant, scores: [], scoreDetailsVisible: false,
  }] });
  expect(screen.getByRole("table", { name: "Archer totals" })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: "20" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Station scorecard" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Station breakdown" })).not.toBeInTheDocument();
  expect(screen.queryByText("Score patterns")).not.toBeInTheDocument();
});

it("never renders redacted participants as gray station cards", () => {
  const data = createTestShootData();
  const shoot = Shoot.from({ ...data, participants: [{
    ...data.participants[0], scores: [], scoreDetailsVisible: false,
  }] }, testUser.id);
  const { container } = render(<StationBreakdownCard participants={shoot.participants} totalStations={2} />);
  expect(container).toBeEmptyDOMElement();
});

it("places deletion after the summary and restores focus when cancelled", async () => {
  renderSummary();
  const trigger = screen.getByRole("button", { name: "Delete shoot" });
  expect(screen.getByText("Score patterns").compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  trigger.focus();
  fireEvent.click(trigger);
  expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(mockDelete).not.toHaveBeenCalled();
  expect(mockReplace).not.toHaveBeenCalled();
});

it("keeps a failed deletion open for retry, then returns to refreshed history", async () => {
  mockDelete.mockRejectedValueOnce(new Error("Network failed"));
  renderSummary();
  fireEvent.click(screen.getByRole("button", { name: "Delete shoot" }));
  const dialog = screen.getByRole("alertdialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete shoot" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("could not be deleted");
  expect(mockReplace).not.toHaveBeenCalled();
  expect(mockRefresh).not.toHaveBeenCalled();
  expect(mockDelete).toHaveBeenCalledWith("shoot-1");
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete shoot" }));
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/history"));
  expect(mockRefresh).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledTimes(2);
});

it("locks confirmation and cancellation while deletion is pending", () => {
  const { rerender } = renderSummary();
  fireEvent.click(screen.getByRole("button", { name: "Delete shoot" }));
  mockDeleting = true;
  rerender(<SummaryPage currentUser={testUser} shootInfo={createTestShootData()} />);
  const dialog = screen.getByRole("alertdialog");
  for (const button of within(dialog).getAllByRole("button")) expect(button).toBeDisabled();
  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  expect(mockDelete).not.toHaveBeenCalled();
});

it("only offers deletion to the shoot's creator", () => {
  renderSummary({ createdBy: "other-tracker" });
  expect(screen.queryByRole("button", { name: "Delete shoot" })).not.toBeInTheDocument();
});
