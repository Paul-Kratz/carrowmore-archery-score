import { render, screen } from "@testing-library/react";
import { Mode, type IShootWithParticipants } from "@/models";
import { ShootHistoryCard } from "./ShootHistoryCard";
import type { Types } from "mongoose";

const asObjectId = (value: string) => value as unknown as Types.ObjectId;

const shoot: IShootWithParticipants = {
  id: "shoot-1",
  clubId: "carrowmore",
  mode: Mode.red,
  createdBy: "user-1",
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  updatedAt: new Date("2026-01-01T10:00:00.000Z"),
  completed: false,
  notes: null,
  participants: [
    {
      id: "participant-1",
      shoot: asObjectId("shoot-1"),
      user: asObjectId("user-1"),
      joinedAt: new Date("2026-01-01T10:00:00.000Z"),
      roundScores: [20, null],
      totalScore: 20,
      userInfo: {
        id: "user-1",
        name: "Alice",
        isGuest: false,
      },
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
