import { fireEvent, render, screen, within } from "@testing-library/react";
import { ShootProvider } from "@/contexts/ShootContext";
import { type IShootParticipantWithScores } from "@/models";
import type { Types } from "mongoose";
import { ParticipantSelector } from "./ParticipantSelector";
import { ShowScoresToggle } from "./ShotScoresToggle";

const asObjectId = (value: string) => value as unknown as Types.ObjectId;

const participants: IShootParticipantWithScores[] = [
  {
    id: "participant-1",
    shoot: asObjectId("shoot-1"),
    user: asObjectId("user-1"),
    joinedAt: new Date("2026-01-01T10:00:00.000Z"),
    pegColor: "red",
    roundScores: [8, null],
    totalScore: 24,
    userInfo: {
      id: "user-1",
      name: "Alice",
      isGuest: false,
    },
  },
];

const renderParticipantSelector = () =>
  render(
    <ShootProvider>
      <ShowScoresToggle />
      <ParticipantSelector
        currentStation={1}
        currentUserId="user-1"
        onSelect={jest.fn()}
        participants={participants}
        selectedParticipantId="participant-1"
      />
    </ShootProvider>,
  );

describe("ParticipantSelector score visibility", () => {
  it("shows participant totals by default", () => {
    renderParticipantSelector();

    const participantButton = screen.getByRole("button", {
      name: "Select Alice (you)",
    });

    expect(within(participantButton).getByText("24")).toBeInTheDocument();
    expect(within(participantButton).getByText("8")).toBeInTheDocument();
  });

  it("hides participant totals when score visibility is toggled off", () => {
    renderParticipantSelector();

    fireEvent.click(screen.getByText("Show Scores"));

    const participantButton = screen.getByRole("button", {
      name: "Select Alice (you)",
    });

    expect(within(participantButton).queryByText("24")).not.toBeInTheDocument();
    expect(within(participantButton).getByText("8")).toBeInTheDocument();
    expect(within(participantButton).getByText("-")).toBeInTheDocument();
  });
});
