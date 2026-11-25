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
participantData.push({
  ...participantData[0],
  id: "participant-2",
  user: { id: "user-2", name: "Bob" },
  scores: [{ roundNumber: 1, score: 0 }],
  totalScore: 40,
});

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
  it("hides totals by default without hiding the station result", () => {
    renderParticipantSelector();

    expect(screen.getByRole("checkbox", { name: "Show Scores" })).not.toBeChecked();
    expect(screen.queryByText("Total")).not.toBeInTheDocument();
    expect(screen.queryByText("24")).not.toBeInTheDocument();
    expect(screen.queryByText("40")).not.toBeInTheDocument();
    expect(screen.queryByText("-")).not.toBeInTheDocument();
    expect(within(screen.getByRole("button", { name: "Select Alice (you)" })).getByText("8")).toBeInTheDocument();
  });

  it("contains no duplicate name heading or scored wording", () => {
    renderParticipantSelector();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByText(/scored/i)).not.toBeInTheDocument();
    expect(within(screen.getByRole("button", { name: "Select Bob" })).getByText("0")).toBeInTheDocument();
  });

  it("reveals the total when enabled and removes it when disabled again", () => {
    renderParticipantSelector();
    const toggle = screen.getByRole("checkbox", { name: "Show Scores" });

    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    const aliceCard = within(screen.getByRole("button", { name: "Select Alice (you)" }));
    const bobCard = within(screen.getByRole("button", { name: "Select Bob" }));
    expect(aliceCard.getByText("Total")).toBeInTheDocument();
    expect(aliceCard.getByText("24")).toBeInTheDocument();
    expect(bobCard.getByText("Total")).toBeInTheDocument();
    expect(bobCard.getByText("40")).toBeInTheDocument();
    expect(bobCard.getByText("0")).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(screen.queryByText("Total")).not.toBeInTheDocument();
    expect(screen.queryByText("24")).not.toBeInTheDocument();
    expect(screen.queryByText("40")).not.toBeInTheDocument();
    expect(screen.queryByText("-")).not.toBeInTheDocument();
    expect(within(screen.getByRole("button", { name: "Select Alice (you)" })).getByText("8")).toBeInTheDocument();
  });
});
