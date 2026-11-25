import { fireEvent, render, screen } from "@testing-library/react";
import { ScorePanel } from "./ScorePanel";

const onSetScore = jest.fn();
const onClear = jest.fn();
const props = { onSetScore, onClear, selectedParticipantUser: null, clubId: "carrowmore", currentScore: null };

beforeEach(() => jest.clearAllMocks());

it.each([
  ["carrowmore", [20, 16, 14, 10, 8, 4]],
  ["marbleArchers", [20, 18, 16, 14, 12, 10]],
])("keeps every scoring choice for %s", (clubId, scores) => {
  render(<ScorePanel {...props} clubId={clubId as string} />);
  for (const score of scores as number[]) {
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${score} `) }));
    expect(onSetScore).toHaveBeenLastCalledWith(score);
  }
  fireEvent.click(screen.getByRole("button", { name: "0 Miss" }));
  expect(onSetScore).toHaveBeenLastCalledWith(0);
  expect(screen.queryByRole("button", { name: "Clear score" })).not.toBeInTheDocument();
});

it("distinguishes a recorded miss from an empty score and allows clearing", () => {
  render(<ScorePanel {...props} currentScore={0} />);
  expect(screen.getByRole("button", { name: "0 Miss" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Clear score" }));
  expect(onClear).toHaveBeenCalledTimes(1);
});

it("blocks edits while a save is pending", () => {
  render(<ScorePanel {...props} currentScore={20} disabled />);
  for (const button of screen.getAllByRole("button")) {
    expect(button).toBeDisabled();
    fireEvent.click(button);
  }
  expect(onSetScore).not.toHaveBeenCalled();
  expect(onClear).not.toHaveBeenCalled();
});
