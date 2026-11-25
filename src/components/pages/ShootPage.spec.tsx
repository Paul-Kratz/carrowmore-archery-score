import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ShootPage } from "./ShootPage";
import type { IShootDenormalized, IUser, ShootParticipant } from "@/models";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockRefetch = jest.fn();
let mockLoading = false;
let mockError = false;
const mockUpdateScore = jest.fn();
let mockIsPending = false;

it("keeps loading and failed retrieval inside the scorebook and offers retry/navigation", () => {
  mockLoading = true;
  const props = { currentUser: { id: "user-1" } as IUser, shootId: "shoot-1", currentStation: 1 };
  const { rerender } = render(<ShootPage {...props} />);
  expect(screen.getByRole("status", { name: "Loading shoot" })).toBeInTheDocument();
  mockLoading = false;
  mockError = true;
  rerender(<ShootPage {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(mockRefetch).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Back to setup" }));
  expect(mockPush).toHaveBeenCalledWith("/");
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

jest.mock("@/fonts/oswald", () => ({ oswald: { className: "font-oswald" } }));

jest.mock("@radix-ui/themes", () => ({
  Theme: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/hooks/queries", () => ({
  useGetShoot: () => ({ data: mockShootData, isLoading: mockLoading, isError: mockError, refetch: mockRefetch }),
  useUpdateScore: () => ({
    mutateAsync: mockUpdateScore,
    isPending: mockIsPending,
  }),
}));

jest.mock("./shoot/OptionsDropdown", () => ({
  OptionsDropdown: () => <button type="button">Options</button>,
}));

jest.mock("./shoot/ParticipantSelector", () => ({
  ParticipantSelector: ({ selectedParticipantId, participants, onSelect }: {
    selectedParticipantId: string;
    participants: ShootParticipant[];
    onSelect: (id: string) => void;
  }) => (
    <div>
      <span data-testid="selected-participant">{selectedParticipantId}</span>
      {participants.map((participant) => (
        <button key={participant.id} onClick={() => onSelect(participant.id)}>
          Select {participant.displayName}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("./shoot/ScorePanel", () => ({
  ScorePanel: ({ onSetScore, onClear, disabled }: { onSetScore: (score: number) => void; onClear: () => void; disabled: boolean }) => (
    <div>
      <button type="button" disabled={disabled} onClick={() => onSetScore(20)}>Score 20</button>
      <button type="button" disabled={disabled} onClick={() => onSetScore(0)}>Miss</button>
      <button type="button" disabled={disabled} onClick={onClear}>Clear score</button>
    </div>
  ),
}));

jest.mock("./shoot/StationNavigationCard", () => ({
  StationNavigationCard: ({ onStationChange }: { onStationChange: (station: number) => void }) => (
    <button onClick={() => onStationChange(2)}>Next station</button>
  ),
}));

jest.mock("./shoot/ExitDialog", () => ({
  ExitDialog: () => <button type="button">Finish shoot</button>,
}));

const user: IUser = {
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const mockShoot: IShootDenormalized = {
  id: "shoot-1",
  schemaVersion: 1,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  firstScoredAt: null,
  completedAt: null,
  createdBy: "user-1" as never,
  clubId: "carrowmore",
  totalStations: 10,
  completed: false,
  notes: null,
  participantCount: 1,
  scoredCount: 0,
  totalScoreSlots: 10,
  participants: [
    {
      id: "participant-1",
      user: { id: "user-1", name: "Alice" },
      guestName: null,
      guestNameNormalized: null,
      pegColor: "red",
      joinedAt: new Date("2026-01-01"),
      scores: [{ roundNumber: 1, score: null, scoredAt: null }],
      totalScore: 0,
      scoredCount: 0,
    },
  ],
};

let mockShootData = mockShoot;

beforeEach(() => {
  mockLoading = false;
  mockError = false;
  mockShootData = mockShoot;
  mockIsPending = false;
});

const createGroupShoot = (): IShootDenormalized => ({
  ...mockShoot,
  participantCount: 3,
  participants: ["Alice", "Bob", "Carol"].map((name, index) => ({
    ...mockShoot.participants[0],
    id: `participant-${index + 1}`,
    user: { id: `user-${index + 1}`, name },
    scores: [
      { roundNumber: 1, score: index === 1 ? 0 : null, scoredAt: null },
      { roundNumber: 2, score: null, scoredAt: null },
    ],
  })),
});

describe("ShootPage score save failures", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockUpdateScore.mockRejectedValue(new Error("Network failed"));
  });

  it("restores the failed archer at the same station when saving fails", async () => {
    mockShootData = createGroupShoot();
    render(<ShootPage currentStation={1} currentUser={user} shootId="shoot-1" />);

    fireEvent.click(screen.getByText("Score 20"));

    expect(screen.getByTestId("selected-participant")).toHaveTextContent("participant-3");
    expect(mockReplace).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "That score did not save.",
      );
      expect(mockReplace).toHaveBeenLastCalledWith("/shoot/shoot-1/1");
    });
    expect(screen.getByTestId("selected-participant")).toHaveTextContent("participant-1");
    expect(sessionStorage.getItem("score-save-error:shoot-1")).toContain(
      "participant-1",
    );
  });

  it("shows a stored save failure after route remount", async () => {
    sessionStorage.setItem(
      "score-save-error:shoot-1",
      JSON.stringify({
        message:
          "That score did not save. Check your signal and tap the score again.",
        participantId: "participant-1",
        station: 1,
      }),
    );

    render(<ShootPage currentStation={1} currentUser={user} shootId="shoot-1" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "That score did not save.",
      );
    });
    expect(sessionStorage.getItem("score-save-error:shoot-1")).toBeNull();
  });
});


describe("ShootPage scoring progression", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockIsPending = false;
    mockUpdateScore.mockResolvedValue(undefined);
  });

  it("saves a solo miss as zero without leaving the archer or station", () => {
    render(<ShootPage currentStation={1} currentUser={user} shootId="shoot-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Miss" }));
    expect(mockUpdateScore).toHaveBeenCalledWith({ shootId: "shoot-1", participantId: "participant-1", roundNumber: 1, score: 0 });
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByTestId("selected-participant")).toHaveTextContent("participant-1");
  });

  it("moves past scored archers, then stays on the final archer at this station", () => {
    mockShootData = createGroupShoot();
    const { rerender } = render(<ShootPage currentStation={1} currentUser={user} shootId="shoot-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Score 20" }));
    expect(mockUpdateScore).toHaveBeenLastCalledWith({ shootId: "shoot-1", participantId: "participant-1", roundNumber: 1, score: 20 });
    // Bob already has a miss recorded, so the next archer is Carol.
    expect(screen.getByTestId("selected-participant")).toHaveTextContent("participant-3");
    expect(mockReplace).not.toHaveBeenCalled();

    // Reflect the saved score returned by the query cache.
    mockShootData = {
      ...mockShootData,
      participants: mockShootData.participants.map((participant) => ({
        ...participant,
        scores: participant.scores.map((score) => participant.id === "participant-1" && score.roundNumber === 1 ? { ...score, score: 20 } : score),
      })),
    };
    rerender(<ShootPage currentStation={1} currentUser={user} shootId="shoot-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Miss" }));
    expect(mockUpdateScore).toHaveBeenLastCalledWith({ shootId: "shoot-1", participantId: "participant-3", roundNumber: 1, score: 0 });
    expect(screen.getByTestId("selected-participant")).toHaveTextContent("participant-3");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("keeps the selected archer when editing a fully scored station", () => {
    const group = createGroupShoot();
    mockShootData = {
      ...group,
      participants: group.participants.map((participant) => ({
        ...participant,
        scores: participant.scores.map((score) => score.roundNumber === 1 ? { ...score, score: 20 } : score),
      })),
    };
    render(<ShootPage currentStation={1} currentUser={user} shootId="shoot-1" />);
    expect(screen.getByRole("heading", { name: "Alice (you)" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Select Bob" }));
    expect(screen.getByRole("heading", { name: "Bob" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Alice (you)" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Score 20" }));
    expect(screen.getByTestId("selected-participant")).toHaveTextContent("participant-2");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("still changes station when manually requested", () => {
    render(<ShootPage currentStation={1} currentUser={user} shootId="shoot-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Next station" }));
    expect(mockReplace).toHaveBeenCalledWith("/shoot/shoot-1/2");
  });

  it("clears with null and stays at the current station", () => {
    render(<ShootPage currentStation={1} currentUser={user} shootId="shoot-1" />);
    fireEvent.click(screen.getByRole("button", { name: "Clear score" }));
    expect(mockUpdateScore).toHaveBeenCalledWith({ shootId: "shoot-1", participantId: "participant-1", roundNumber: 1, score: null });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("omits automatic-save copy and save status when idle", () => {
    render(<ShootPage currentStation={1} currentUser={user} shootId="shoot-1" />);
    expect(screen.queryByText("Scores save automatically.")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the save state and prevents another score while pending", () => {
    mockIsPending = true;
    render(<ShootPage currentStation={1} currentUser={user} shootId="shoot-1" />);
    expect(screen.getByRole("status")).toHaveTextContent("Saving score…");
    fireEvent.click(screen.getByRole("button", { name: "Score 20" }));
    expect(mockUpdateScore).not.toHaveBeenCalled();
    mockIsPending = false;
  });
});
