import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ShootPage } from "./ShootPage";
import type { IShootDenormalized, IUser } from "@/models";

const mockReplace = jest.fn();
const mockUpdateScore = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@radix-ui/themes", () => ({
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
  useGetShoot: () => ({ data: mockShoot }),
  useUpdateScore: () => ({
    mutateAsync: mockUpdateScore,
    isPending: false,
  }),
}));

jest.mock("../shared/Header", () => ({
  Header: () => <div data-testid="header" />,
}));

jest.mock("./shoot/OptionsDropdown", () => ({
  OptionsDropdown: () => <button type="button">Options</button>,
}));

jest.mock("./shoot/ParticipantSelector", () => ({
  ParticipantSelector: () => <div data-testid="participant-selector" />,
}));

jest.mock("./shoot/ScorePanel", () => ({
  ScorePanel: ({ onSetScore }: { onSetScore: (score: number) => void }) => (
    <button type="button" onClick={() => onSetScore(20)}>
      Score 20
    </button>
  ),
}));

jest.mock("./shoot/StationNavigationCard", () => ({
  StationNavigationCard: () => <div data-testid="station-navigation" />,
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

describe("ShootPage score save failures", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockUpdateScore.mockRejectedValue(new Error("Network failed"));
  });

  it("keeps scoring fast but returns to the failed station when save retries fail", async () => {
    render(<ShootPage currentStation={1} currentUser={user} shootId="shoot-1" />);

    fireEvent.click(screen.getByText("Score 20"));

    expect(mockReplace).toHaveBeenCalledWith("/shoot/shoot-1/2");

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "That score did not save.",
      );
      expect(mockReplace).toHaveBeenLastCalledWith("/shoot/shoot-1/1");
    });
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
