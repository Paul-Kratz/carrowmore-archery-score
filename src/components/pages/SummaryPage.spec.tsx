import { render, screen } from "@testing-library/react";
import { SummaryPage } from "./SummaryPage";
import {
  IDenormalizedParticipant,
  IDenormalizedScore,
  IShootDenormalized,
  Shoot,
  IUser,
} from "@/models";
import type { Types } from "mongoose";

const asObjectId = (value: string) => value as unknown as Types.ObjectId;

const mockCurrentUser: IUser = {
  id: "user1",
  name: "Alice",
  email: "alice@test.com",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

const createScores = (scores: number[]): IDenormalizedScore[] =>
  scores.map((score, index) => ({
    roundNumber: index + 1,
    score,
    scoredAt: new Date("2025-06-15T10:30:00Z"),
  }));

const createParticipant = (
  overrides: Partial<IDenormalizedParticipant> = {},
): IDenormalizedParticipant => {
  const scores =
    overrides.scores ??
    createScores([
      20, 16, 14, 10, 8, 4, 0, 20, 14, 10, 8, 4, 0, 16, 14, 10, 8, 4,
    ]);

  return {
    id: "p1",
    user: { id: "user1", name: "Alice", email: "alice@test.com" },
    joinedAt: new Date(),
    pegColor: "yellow",
    scores,
    totalScore: scores.reduce((total, score) => total + (score.score ?? 0), 0),
    scoredCount: scores.filter((score) => score.score !== null).length,
    ...overrides,
  };
};

const createShootInfo = (
  overrides: Partial<IShootDenormalized> = {},
): IShootDenormalized => {
  const participants = overrides.participants ?? [createParticipant()];

  return {
  id: "shoot1",
  schemaVersion: 1,
  createdBy: asObjectId("user1"),
  createdAt: new Date("2025-06-15T10:30:00Z"),
  updatedAt: new Date("2025-06-15T10:30:00Z"),
  firstScoredAt: new Date("2025-06-15T10:30:00Z"),
  completedAt: new Date("2025-06-15T10:30:00Z"),
  completed: true,
  notes: "Sunny day",
  clubId: overrides.clubId ?? "carrowmore",
  totalStations: 18,
  participantCount: participants.length,
  scoredCount: participants.reduce(
    (total, participant) => total + participant.scoredCount,
    0,
  ),
  totalScoreSlots: participants.length * 18,
  participants,
  ...overrides,
  };
};

const createShoot = (overrides: Partial<IShootDenormalized> = {}) =>
  Shoot.from(createShootInfo(overrides), mockCurrentUser.id);

describe("SummaryPage", () => {
  describe("Rendering", () => {
    it("should render the Shoot Details header", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot()}
        />,
      );
      expect(screen.getByText("Shoot Details")).toBeInTheDocument();
    });

    it("should render the peg colour badge", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot({
            participants: [
              {
                ...createShootInfo().participants[0],
                pegColor: "red",
              },
            ],
          })}
        />,
      );
      expect(screen.getByText("Red peg")).toBeInTheDocument();
    });

    it("should render the club name", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot()}
        />,
      );

      expect(screen.getAllByText("Carrowmore Archery").length).toBeGreaterThan(
        0,
      );
    });

    it("should render notes when present", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot({ notes: "Rainy session" })}
        />,
      );
      expect(screen.getByText("Rainy session")).toBeInTheDocument();
    });

    it("should render 'No notes' when notes is empty", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot({ notes: null })}
        />,
      );
      expect(screen.getByText("No notes")).toBeInTheDocument();
    });

    it("should render participant count", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot()}
        />,
      );
      expect(screen.getByText(/1 participant(?!s)/)).toBeInTheDocument();
    });

    it("should show tracked-by-you only when the current user created the shoot", () => {
      const { rerender } = render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot({ createdBy: asObjectId("user1") })}
        />,
      );

      expect(screen.getByText(/\(tracked by you\)/)).toBeInTheDocument();

      rerender(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot({ createdBy: asObjectId("user2") })}
        />,
      );

      expect(screen.queryByText(/\(tracked by you\)/)).not.toBeInTheDocument();
    });

    it("should pluralize participants when more than one", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot({
            participants: [
              createParticipant({ scores: createScores([10]) }),
              createParticipant({
                id: "p2",
                user: { id: "user2", name: "Bob" },
                scores: createScores([14]),
                totalScore: 14,
                scoredCount: 1,
              }),
            ],
          })}
        />,
      );
      expect(screen.getByText(/2 participants/)).toBeInTheDocument();
    });

    it("should show 'You' badge for the current user", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot()}
        />,
      );
      expect(screen.getByText("You")).toBeInTheDocument();
    });

    it("shows a guest badge for guest participants", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot({
            participants: [
              createParticipant({
                id: "guest-1",
                user: null,
                guestName: "Charlie",
                scores: createScores([10, 8, 4]),
                totalScore: 22,
                scoredCount: 3,
              }),
            ],
          })}
        />,
      );

      expect(screen.getAllByText("Guest").length).toBeGreaterThan(0);
    });

    it("should render participant name", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot()}
        />,
      );
      const matches = screen.getAllByText("Alice (you)");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it("should render total score for participant", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot()}
        />,
      );
      const matches = screen.getAllByText("180");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Score Breakdown", () => {
    it("should render score total cells", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot()}
        />,
      );
      [20, 16, 14, 10, 8, 4, 0].forEach((score) => {
        expect(screen.getByLabelText(new RegExp(`Score ${score} count`))).toBeInTheDocument();
      });
    });

    it("should count score occurrences correctly", () => {
      // Scores: [20, 16, 14, 10, 8, 4, 0, 20, 14, 10, 8, 4, 0, 16, 14, 10, 8, 4]
      // Expected counts: 0→2, 4→3, 8→3, 10→3, 14→3, 16→2, 20→2
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot()}
        />,
      );
      expect(screen.getByLabelText("Score 20 count 2")).toBeInTheDocument();
      expect(screen.getByLabelText("Score 16 count 2")).toBeInTheDocument();
      expect(screen.getByLabelText("Score 14 count 3")).toBeInTheDocument();
      expect(screen.getByLabelText("Score 10 count 3")).toBeInTheDocument();
      expect(screen.getByLabelText("Score 8 count 3")).toBeInTheDocument();
      expect(screen.getByLabelText("Score 4 count 3")).toBeInTheDocument();
      expect(screen.getByLabelText("Score 0 count 2")).toBeInTheDocument();
    });

    it("should show 0 count for scores not achieved", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot({
            participants: [
              createParticipant({
                scores: createScores([20, 20, 20]),
                totalScore: 60,
                scoredCount: 3,
              }),
            ],
          })}
        />,
      );
      expect(screen.getByLabelText("Score 20 count 3")).toBeInTheDocument();
      expect(screen.getByLabelText("Score 16 count 0")).toBeInTheDocument();
      expect(screen.getByLabelText("Score 14 count 0")).toBeInTheDocument();
      expect(screen.getByLabelText("Score 0 count 0")).toBeInTheDocument();
    });

    it("should apply score total tone classes", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot({
            participants: [
              createParticipant({
                scores: createScores([20]),
                totalScore: 20,
                scoredCount: 1,
              }),
            ],
          })}
        />,
      );
      expect(screen.getByLabelText("Score 20 count 1").className).toContain(
        "bg-[#eef3df]",
      );
      expect(screen.getByLabelText("Score 0 count 0").className).toContain(
        "bg-[#f5e3dd]",
      );
    });
  });

  describe("Station Breakdown", () => {
    it("should render station numbers 1-18 as score tiles", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot()}
        />,
      );
      for (let i = 1; i <= 18; i++) {
        expect(
          screen.getByLabelText(`Alice (you) station ${i} score ${
            createShootInfo().participants[0].scores[i - 1]?.score
          }`),
        ).toBeInTheDocument();
      }
    });

    it("should render participant name and total in the station breakdown", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShoot()}
        />,
      );
      expect(screen.getAllByText("Alice (you)").length).toBeGreaterThanOrEqual(
        1,
      );
      expect(screen.getAllByText("180").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("18 / 18 stations scored")).toBeInTheDocument();
    });
  });
});
