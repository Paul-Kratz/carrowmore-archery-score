import { render, screen } from "@testing-library/react";
import { type IShootDenormalized } from "@/models";
import { ShootHistoryCard } from "./ShootHistoryCard";
import type { Types } from "mongoose";

const asObjectId = (value: string) => value as unknown as Types.ObjectId;

const shoot: IShootDenormalized = {
  id: "shoot-1",
  schemaVersion: 1,
  clubId: "carrowmore",
  createdBy: asObjectId("user-1"),
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  updatedAt: new Date("2026-01-01T10:00:00.000Z"),
  firstScoredAt: new Date("2026-01-01T10:00:00.000Z"),
  completedAt: null,
  completed: false,
  notes: null,
  participantCount: 1,
  scoredCount: 1,
  totalStations: 2,
  totalScoreSlots: 2,
  participants: [
    {
      id: "participant-1",
      user: { id: "user-1", name: "Alice" },
      joinedAt: new Date("2026-01-01T10:00:00.000Z"),
      pegColor: "red",
      scores: [
        { roundNumber: 1, score: 20, scoredAt: new Date("2026-01-01") },
        { roundNumber: 2, score: null, scoredAt: null },
      ],
      totalScore: 20,
      scoredCount: 1,
    },
  ],
};

describe("ShootHistoryCard", () => {
  it("renders the shoot club name", () => {
    render(
      <ShootHistoryCard
        currentUserId="user-1"
        onDelete={jest.fn()}
        onOpenSummary={jest.fn()}
        shoot={shoot}
      />,
    );

    expect(screen.getByText("Carrowmore Archery")).toBeInTheDocument();
  });
});
