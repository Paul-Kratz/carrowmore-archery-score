import { fireEvent, render, screen, within } from "@testing-library/react";
import { ShootProvider } from "@/contexts/ShootContext";
import { ShootParticipant, type IDenormalizedParticipant } from "@/models";
import { ParticipantSelector } from "./ParticipantSelector";
import { ShowScoresToggle } from "./ShotScoresToggle";

const participantData: IDenormalizedParticipant[] = [
  {
    id: "participant-1",
    user: {
      id: "user-1",
      name: "Alice",
    },
    joinedAt: new Date("2026-01-01T10:00:00.000Z"),
    pegColor: "red",
    scores: [
      { roundNumber: 1, score: 8 },
      { roundNumber: 2, score: null },
    ],
    totalScore: 24,
    scoredCount: 1,
  },
];
const participants = participantData.map(
  (participant) => new ShootParticipant(participant, "user-1"),
);

const renderParticipantSelector = () =>
  render(
    <ShootProvider>
      <ShowScoresToggle />
        <ParticipantSelector
          currentStation={1}
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
