import { render, screen } from "@testing-library/react";
import { SummaryPage } from "./SummaryPage";
import { IShootWithParticipants, IUser, Mode } from "@/models";

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
      shoot: "shoot1" as any,
      user: "user1" as any,
      joinedAt: new Date(),
      userInfo: { id: "user1", name: "Alice", email: "alice@test.com" },
      roundScores: [
        20, 16, 14, 10, 8, 4, 0, 20, 14, 10, 8, 4, 0, 16, 14, 10, 8, 4,
      ],
      totalScore: 180,
    },
  ],
  ...overrides,
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
                shoot: "shoot1" as any,
                user: "user1" as any,
                joinedAt: new Date(),
                userInfo: { id: "user1", name: "Alice" },
                roundScores: [10],
                totalScore: 10,
              },
              {
                id: "p2",
                shoot: "shoot1" as any,
                user: "user2" as any,
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

  describe("Score Distribution Table", () => {
    it("should render column headers for all possible scores", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo()}
        />,
      );
      // Headers appear in score distribution and station breakdown tables
      // Check that the possible score values appear as headers
      const headers = screen.getAllByRole("columnheader");
      const headerTexts = headers.map((h) => h.textContent);
      expect(headerTexts).toContain("0");
      expect(headerTexts).toContain("4");
      expect(headerTexts).toContain("8");
      expect(headerTexts).toContain("10");
      expect(headerTexts).toContain("14");
      expect(headerTexts).toContain("16");
      expect(headerTexts).toContain("20");
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
      const cells = screen.getAllByRole("cell");
      // The score distribution table row should contain the counts
      // Find cells with the expected count values in order
      const distributionCells = cells.slice(0, 7); // first table body row has 7 cells
      const counts = distributionCells.map((c) => c.textContent);
      expect(counts).toEqual(["2", "3", "3", "3", "3", "2", "2"]);
    });

    it("should show 0 count for scores not achieved", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo({
            participants: [
              {
                id: "p1",
                shoot: "shoot1" as any,
                user: "user1" as any,
                joinedAt: new Date(),
                userInfo: { id: "user1", name: "Alice" },
                roundScores: [20, 20, 20],
                totalScore: 60,
              },
            ],
          })}
        />,
      );
      const cells = screen.getAllByRole("cell");
      const distributionCells = cells.slice(0, 7);
      const counts = distributionCells.map((c) => c.textContent);
      // Only score 20 has count 3, rest are 0
      expect(counts).toEqual(["0", "0", "0", "0", "0", "0", "3"]);
    });

    it("should apply gray class for zero-count cells", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo({
            participants: [
              {
                id: "p1",
                shoot: "shoot1" as any,
                user: "user1" as any,
                joinedAt: new Date(),
                userInfo: { id: "user1", name: "Alice" },
                roundScores: [20],
                totalScore: 20,
              },
            ],
          })}
        />,
      );
      const cells = screen.getAllByRole("cell");
      // First 6 cells (scores 0,4,8,10,14,16) should have gray class
      for (let i = 0; i < 6; i++) {
        expect(cells[i].className).toContain("text-gray-300");
      }
    });

    it("should apply score color class for non-zero count cells", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo({
            participants: [
              {
                id: "p1",
                shoot: "shoot1" as any,
                user: "user1" as any,
                joinedAt: new Date(),
                userInfo: { id: "user1", name: "Alice" },
                roundScores: [0, 4, 20],
                totalScore: 24,
              },
            ],
          })}
        />,
      );
      const cells = screen.getAllByRole("cell");
      // Score 0 → text-red-600
      expect(cells[0].className).toContain("text-red-600");
      // Score 4 → text-orange-500
      expect(cells[1].className).toContain("text-orange-500");
      // Score 20 → text-green-700
      expect(cells[6].className).toContain("text-green-700");
    });
  });

  describe("Station Breakdown Table", () => {
    it("should render station numbers 1-18 as column headers", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo()}
        />,
      );
      const headers = screen.getAllByRole("columnheader");
      const headerTexts = headers.map((h) => h.textContent);
      for (let i = 1; i <= 18; i++) {
        expect(headerTexts).toContain(String(i));
      }
    });

    it("should render Name and Total column headers", () => {
      render(
        <SummaryPage
          currentUser={mockCurrentUser}
          shootInfo={createShootInfo()}
        />,
      );
      const headers = screen.getAllByRole("columnheader");
      const headerTexts = headers.map((h) => h.textContent);
      expect(headerTexts).toContain("Name");
      expect(headerTexts).toContain("Total");
    });
  });
});
