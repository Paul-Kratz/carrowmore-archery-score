import { render, screen } from "@testing-library/react";
import { SummaryPage } from "./SummaryPage";
import { IShootWithParticipants, IUser, Mode } from "@/models";
import type { Types } from "mongoose";

const asObjectId = (value: string) => value as unknown as Types.ObjectId;

const mockCurrentUser: IUser = {
  id: "user1",
  name: "Alice",
  email: "alice@test.com",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

const createShootInfo = (
  overrides: Partial<IShootWithParticipants> = {},
): IShootWithParticipants => ({
  id: "shoot1",
  mode: Mode.yellow,
  createdBy: "user1",
  createdAt: new Date("2025-06-15T10:30:00Z"),
  updatedAt: new Date("2025-06-15T10:30:00Z"),
  completed: true,
  notes: "Sunny day",
  participants: [
    {
      id: "p1",
      shoot: asObjectId("shoot1"),
      user: asObjectId("user1"),
      joinedAt: new Date(),
      userInfo: { id: "user1", name: "Alice", email: "alice@test.com" },
      roundScores: [
        20, 16, 14, 10, 8, 4, 0, 20, 14, 10, 8, 4, 0, 16, 14, 10, 8, 4,
      ],
      totalScore: 180,
    },
  ],
  ...overrides,
  clubId: overrides.clubId ?? "carrowmore",
});

describe("SummaryPage", () => {
  describe("Rendering", () => {
    it("should render the Shoot Details header", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo()}
        />,
      );
      expect(screen.getByText("Shoot Details")).toBeInTheDocument();
    });

    it("should render the shoot mode badge", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo({ mode: Mode.red })}
        />,
      );
      expect(screen.getByText("red")).toBeInTheDocument();
    });

    it("should render the club name", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo()}
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
          shootInfo={createShootInfo({ notes: "Rainy session" })}
        />,
      );
      expect(screen.getByText("Rainy session")).toBeInTheDocument();
    });

    it("should render 'No notes' when notes is empty", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo({ notes: null })}
        />,
      );
      expect(screen.getByText("No notes")).toBeInTheDocument();
    });

    it("should render participant count", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo()}
        />,
      );
      expect(screen.getByText(/1 participant(?!s)/)).toBeInTheDocument();
    });

    it("should show tracked-by-you only when the current user created the shoot", () => {
      const { rerender } = render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo({ createdBy: "user1" })}
        />,
      );

      expect(screen.getByText(/\(tracked by you\)/)).toBeInTheDocument();

      rerender(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo({ createdBy: "user2" })}
        />,
      );

      expect(screen.queryByText(/\(tracked by you\)/)).not.toBeInTheDocument();
    });

    it("should pluralize participants when more than one", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo({
            participants: [
              {
                id: "p1",
                shoot: asObjectId("shoot1"),
                user: asObjectId("user1"),
                joinedAt: new Date(),
                userInfo: { id: "user1", name: "Alice" },
                roundScores: [10],
                totalScore: 10,
              },
              {
                id: "p2",
                shoot: asObjectId("shoot1"),
                user: asObjectId("user2"),
                joinedAt: new Date(),
                userInfo: { id: "user2", name: "Bob" },
                roundScores: [14],
                totalScore: 14,
              },
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
          shootInfo={createShootInfo()}
        />,
      );
      expect(screen.getByText("You")).toBeInTheDocument();
    });

    it("shows a guest badge for guest participants", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo({
            participants: [
              {
                id: "guest-1",
                shoot: asObjectId("shoot1"),
                user: null,
                guestName: "Charlie",
                joinedAt: new Date(),
                userInfo: { name: "Charlie", isGuest: true },
                roundScores: [10, 8, 4],
                totalScore: 22,
              },
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
          shootInfo={createShootInfo()}
        />,
      );
      const matches = screen.getAllByText("Alice");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it("should render total score for participant", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo()}
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
          shootInfo={createShootInfo()}
        />,
      );
      [20, 16, 14, 10, 8, 4, 0].forEach((score) => {
        expect(screen.getByLabelText(new RegExp(`Score ${score} count`))).toBeInTheDocument();
      });
    });

    it("should count score occurrences correctly", () => {
      // roundScores: [20, 16, 14, 10, 8, 4, 0, 20, 14, 10, 8, 4, 0, 16, 14, 10, 8, 4]
      // Expected counts: 0→2, 4→3, 8→3, 10→3, 14→3, 16→2, 20→2
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo()}
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
          shootInfo={createShootInfo({
            participants: [
              {
                id: "p1",
                shoot: asObjectId("shoot1"),
                user: asObjectId("user1"),
                joinedAt: new Date(),
                userInfo: { id: "user1", name: "Alice" },
                roundScores: [20, 20, 20],
                totalScore: 60,
              },
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
          shootInfo={createShootInfo({
            participants: [
              {
                id: "p1",
                shoot: asObjectId("shoot1"),
                user: asObjectId("user1"),
                joinedAt: new Date(),
                userInfo: { id: "user1", name: "Alice" },
                roundScores: [20],
                totalScore: 20,
              },
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
          shootInfo={createShootInfo()}
        />,
      );
      for (let i = 1; i <= 18; i++) {
        expect(
          screen.getByLabelText(`Alice station ${i} score ${
            createShootInfo().participants[0].roundScores[i - 1]
          }`),
        ).toBeInTheDocument();
      }
    });

    it("should render participant name and total in the station breakdown", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo()}
        />,
      );
      expect(screen.getAllByText("Alice").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("180").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("18 / 18 stations scored")).toBeInTheDocument();
    });
  });
});
