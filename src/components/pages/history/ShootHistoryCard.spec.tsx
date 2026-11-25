import { fireEvent, render, screen } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import { Shoot } from "@/models";
import { createTestShootData } from "@/testFixtures/shoot";
import { ShootHistoryCard } from "./ShootHistoryCard";

const onDelete = jest.fn();
const onOpenSummary = jest.fn();
const props = { currentUserId: "user-1", onDelete, onOpenSummary };
beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = jest.fn();
  global.ResizeObserver = jest.fn().mockImplementation(() => ({ observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() }));
});
beforeEach(() => jest.clearAllMocks());

it("shows club, score and progress without empty note or decorative metadata", () => {
  render(<Theme><ShootHistoryCard {...props} shoot={Shoot.from(createTestShootData(), "user-1")} showUserScore relationLabel="Shot & tracked" /></Theme>);
  expect(screen.getByText("Carrowmore Archery")).toBeInTheDocument();
  expect(screen.getByText("Your score")).toBeInTheDocument();
  expect(screen.getByText("20")).toBeInTheDocument();
  expect(screen.getByText("1/2 stations")).toBeInTheDocument();
  expect(screen.getByText("Shot & tracked")).toBeInTheDocument();
  expect(screen.queryByText("No notes")).not.toBeInTheDocument();
});

it("keeps opening a summary separate from requesting deletion", () => {
  render(<Theme><ShootHistoryCard {...props} shoot={Shoot.from(createTestShootData(), "user-1")} /></Theme>);
  fireEvent.click(screen.getByRole("button", { name: /^Open shoot/ }));
  expect(onOpenSummary).toHaveBeenCalledWith("shoot-1");
  expect(onDelete).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: /^Delete shoot/ }));
  expect(onDelete).toHaveBeenCalledWith("shoot-1");
  expect(onOpenSummary).toHaveBeenCalledTimes(1);
});

it("retains notes and hides deletion from someone who did not create the shoot", () => {
  render(<Theme><ShootHistoryCard {...props} currentUserId="user-2" shoot={Shoot.from(createTestShootData({ notes: "Windy at the last station", completed: true }), "user-2")} /></Theme>);
  expect(screen.queryByRole("button", { name: /^Delete shoot/ })).not.toBeInTheDocument();
  expect(screen.getByText("Top score")).toBeInTheDocument();
  expect(screen.getByText("Windy at the last station")).toBeInTheDocument();
  expect(screen.getByText("1/2 stations")).toBeInTheDocument();
});
