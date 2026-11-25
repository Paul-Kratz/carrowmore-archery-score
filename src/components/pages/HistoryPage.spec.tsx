import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { HistoryPage } from "./HistoryPage";
import { Shoot } from "@/models";
import { createTestShootData, testUser } from "@/testFixtures/shoot";

const mockPush = jest.fn();
const mockDelete = jest.fn();
let mockParticipated: Shoot[] = [];
let mockTracked: Shoot[] = [];
let mockLoading = false;
let mockDeleting = false;
let mockError = false;
const mockRefetch = jest.fn();

jest.mock("@/fonts/oswald", () => ({ oswald: { className: "oswald" } }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("next/dynamic", () => ({ __esModule: true, default: () => () => <p>Trend chart</p> }));
jest.mock("@/hooks/queries", () => ({
  useGetParticipatedShoots: () => ({ participatedShoots: mockParticipated, trackedShoots: mockTracked, isLoading: mockLoading, isError: mockError, refetch: mockRefetch }),
  useDeleteShoot: () => ({ mutateAsync: mockDelete, isPending: mockDeleting }),
}));

beforeEach(() => {
  jest.clearAllMocks(); mockLoading = false; mockDeleting = false; mockError = false;
  mockDelete.mockResolvedValue(undefined);
  const own = Shoot.from(createTestShootData(), "user-1");
  const other = Shoot.from(createTestShootData({ id: "shoot-2", createdBy: "user-2", createdAt: new Date("2026-01-02T10:00:00Z") }), "user-1");
  const tracked = Shoot.from(createTestShootData({ id: "shoot-3", createdAt: new Date("2026-01-03T10:00:00Z"), participants: [] }), "user-1");
  mockParticipated = [own, other]; mockTracked = [own, tracked];
});

const renderHistory = () => render(<HistoryPage currentUser={testUser} chartData={[]} />);

it("shows a retry instead of an empty history when retrieval fails", () => {
  mockError = true;
  mockParticipated = []; mockTracked = [];
  renderHistory();
  expect(screen.getByText("Unable to load history")).toBeInTheDocument();
  expect(screen.queryByText("No shoot history yet")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(mockRefetch).toHaveBeenCalledTimes(1);
});

it("retains cached history with a refresh warning when the connection fails", () => {
  mockError = true;
  renderHistory();
  expect(screen.getAllByRole("article")).toHaveLength(3);
  expect(screen.getByRole("status")).toHaveTextContent("Showing saved results");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(mockRefetch).toHaveBeenCalledTimes(1);
});
const openDelete = () => {
  fireEvent.click(within(screen.getAllByRole("article")[0]).getByRole("button", { name: /^Delete shoot/ }));
};

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = jest.fn();
  global.ResizeObserver = jest.fn().mockImplementation(() => ({ observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() }));
});

it("deduplicates, sorts newest first and preserves relationship filters", () => {
  renderHistory();
  expect(screen.getAllByRole("article")).toHaveLength(3);
  const dates = screen.getAllByRole("article").map((article) => article.querySelector("time")?.dateTime);
  expect(dates).toEqual(["2026-01-03T10:00:00.000Z", "2026-01-02T10:00:00.000Z", "2026-01-01T10:00:00.000Z"]);
  fireEvent.click(screen.getByRole("button", { name: "Shot 2" }));
  expect(screen.getAllByRole("article")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Tracked 2" }));
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(screen.getByRole("button", { name: "Tracked 2" })).toHaveAttribute("aria-pressed", "true");
});

it("opens summary routes and only expands trends on request", () => {
  renderHistory();
  expect(screen.queryByText("Trend chart")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Trends" }));
  expect(screen.getByText("Trend chart")).toBeInTheDocument();
  fireEvent.click(within(screen.getAllByRole("article")[0]).getByRole("button", { name: /^Open shoot/ }));
  expect(mockPush).toHaveBeenCalledWith("/shoot/summary/shoot-3");
});

it("shows loading, an empty history and a useful way back to setup", () => {
  mockLoading = true; const { rerender } = renderHistory();
  expect(screen.getByRole("status", { name: "Loading your shoot history" })).toBeInTheDocument();
  mockLoading = false; mockParticipated = []; mockTracked = [];
  rerender(<HistoryPage currentUser={testUser} chartData={[]} />);
  expect(screen.getByText("No shoot history yet")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "New shoot" }));
  expect(mockPush).toHaveBeenCalledWith("/");
});

it("shows an empty filter without discarding the other history entries", () => {
  mockTracked = []; mockParticipated = [Shoot.from(createTestShootData({ createdBy: "user-2" }), "user-1")];
  renderHistory();
  fireEvent.click(screen.getByRole("button", { name: "Tracked 0" }));
  expect(screen.getByText("No Tracked Shoots")).toBeInTheDocument();
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "All 1" }));
  expect(screen.getByRole("article")).toBeInTheDocument();
});

it("cancels deletion without a request and keeps a failed deletion open for retry", async () => {
  renderHistory(); openDelete();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(mockDelete).not.toHaveBeenCalled();
  mockDelete.mockRejectedValueOnce(new Error("Network failed"));
  openDelete(); fireEvent.click(screen.getByRole("button", { name: "Delete shoot" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("could not be deleted");
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  expect(mockDelete).toHaveBeenCalledWith("shoot-3");
  fireEvent.click(screen.getByRole("button", { name: "Delete shoot" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
});

it("returns keyboard focus to the same delete control after cancellation", async () => {
  renderHistory();
  const trigger = within(screen.getAllByRole("article")[0]).getByRole("button", { name: /^Delete shoot/ });
  trigger.focus();
  fireEvent.click(trigger);
  expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(mockDelete).not.toHaveBeenCalled();
});

it("locks confirmation and cancellation while deletion is pending", () => {
  const { rerender } = renderHistory(); openDelete(); mockDeleting = true;
  rerender(<HistoryPage currentUser={testUser} chartData={[]} />);
  const dialog = screen.getByRole("alertdialog");
  for (const button of within(dialog).getAllByRole("button")) expect(button).toBeDisabled();
  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  expect(mockDelete).not.toHaveBeenCalled();
});
