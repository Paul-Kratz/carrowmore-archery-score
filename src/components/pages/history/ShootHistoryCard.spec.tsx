import { fireEvent, render, screen } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import { Shoot } from "@/models";
import { createTestShootData } from "@/testFixtures/shoot";
import { ShootHistoryCard } from "./ShootHistoryCard";

const onOpenSummary = jest.fn();
const props = { onOpenSummary };
beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = jest.fn();
  global.ResizeObserver = jest.fn().mockImplementation(() => ({ observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() }));
});
beforeEach(() => jest.clearAllMocks());

it("shows club, score and archer count without progress or relationship clutter", () => {
  render(<Theme><ShootHistoryCard {...props} shoot={Shoot.from(createTestShootData(), "user-1")} showUserScore /></Theme>);
  expect(screen.getByText("Carrowmore Archery")).toBeInTheDocument();
  expect(screen.getByText("Your score")).toBeInTheDocument();
  expect(screen.getByText("20")).toBeInTheDocument();
  expect(screen.queryByText(/stations/)).not.toBeInTheDocument();
  expect(screen.queryByText("Shot & tracked")).not.toBeInTheDocument();
  expect(screen.getByText("1 archer")).toBeInTheDocument();
  expect(screen.queryByText("No notes")).not.toBeInTheDocument();
});

it("opens the summary without a neighboring delete action", () => {
  render(<Theme><ShootHistoryCard {...props} shoot={Shoot.from(createTestShootData(), "user-1")} /></Theme>);
  fireEvent.click(screen.getByRole("button", { name: /^Open shoot/ }));
  expect(onOpenSummary).toHaveBeenCalledWith("shoot-1");
  expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  expect(onOpenSummary).toHaveBeenCalledTimes(1);
});

it("retains notes and top scores for other participants", () => {
  render(<Theme><ShootHistoryCard {...props} shoot={Shoot.from(createTestShootData({ notes: "Windy at the last station", completed: true }), "user-2")} /></Theme>);
  expect(screen.queryByRole("button", { name: /^Delete shoot/ })).not.toBeInTheDocument();
  expect(screen.getByText("Top score")).toBeInTheDocument();
  expect(screen.getByText("Windy at the last station")).toBeInTheDocument();
  expect(screen.queryByText(/stations/)).not.toBeInTheDocument();
});
