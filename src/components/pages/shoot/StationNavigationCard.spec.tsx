import { fireEvent, render, screen } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import { StationNavigationCard } from "./StationNavigationCard";

const onStationChange = jest.fn();
const props = { canGoNext: true, canGoPrevious: false, currentStation: 1, onStationChange, participantCount: 3, stationCompletionCounts: [3, 1, 0], totalStations: 3 };

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = jest.fn();
  global.ResizeObserver = jest.fn().mockImplementation(() => ({ observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() }));
});
beforeEach(() => jest.clearAllMocks());

it("prevents moving before the first station and allows the next", () => {
  render(<Theme><StationNavigationCard {...props} /></Theme>);
  expect(screen.getByRole("button", { name: "Previous station" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Next station" }));
  expect(onStationChange).toHaveBeenCalledWith(2);
});

it("offers completion counts and jumps to the chosen station", () => {
  render(<Theme><StationNavigationCard {...props} /></Theme>);
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Choose station" }), { key: "ArrowDown" });
  expect(screen.getByRole("option", { name: "Station 1 · 3/3 scored" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("option", { name: "Station 3 · 0/3 scored" }));
  expect(onStationChange).toHaveBeenCalledWith(3);
});

it("prevents moving past the last station and locks navigation during saving", () => {
  const { rerender } = render(<Theme><StationNavigationCard {...props} currentStation={3} canGoNext={false} canGoPrevious /></Theme>);
  expect(screen.getByRole("button", { name: "Next station" })).toBeDisabled();
  rerender(<Theme><StationNavigationCard {...props} disabled /></Theme>);
  expect(screen.getByRole("button", { name: "Next station" })).toBeDisabled();
  expect(screen.getByRole("combobox", { name: "Choose station" })).toBeDisabled();
});
