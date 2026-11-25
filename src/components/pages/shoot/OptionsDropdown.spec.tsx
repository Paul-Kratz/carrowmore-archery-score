import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import { ShootProvider, useShootContext } from "@/contexts/ShootContext";
import { Shoot } from "@/models";
import { createTestShootData } from "@/testFixtures/shoot";
import { OptionsDropdown } from "./OptionsDropdown";

const mockSave = jest.fn();
jest.mock("@/hooks/queries", () => ({ useUpdateShoot: () => ({ mutateAsync: mockSave }) }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
const Preference = () => <p>{useShootContext().showScores ? "Totals visible" : "Totals hidden"}</p>;
const openMenu = () => {
  render(<Theme><ShootProvider><OptionsDropdown shoot={Shoot.from(createTestShootData(), "user-1")} /><Preference /></ShootProvider></Theme>);
  fireEvent.keyDown(screen.getByRole("button", { name: "Shoot options" }), { key: "Enter" });
};
beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = jest.fn();
  global.ResizeObserver = jest.fn().mockImplementation(() => ({ observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() }));
});
beforeEach(() => jest.clearAllMocks());

it("uses a menu checkbox to reveal totals without closing the menu", () => {
  openMenu();
  const item = screen.getByRole("menuitemcheckbox", { name: "Show total scores" });
  expect(item).toHaveAttribute("aria-checked", "false");
  fireEvent.click(item);
  expect(screen.getByText("Totals visible")).toBeInTheDocument();
  expect(item).toHaveAttribute("aria-checked", "true");
  expect(screen.getByRole("menu")).toBeInTheDocument();
});

it("opens the exit dialog and returns focus to options on cancel without saving", async () => {
  openMenu();
  fireEvent.click(screen.getByRole("menuitem", { name: "Exit shoot" }));
  expect(screen.getByRole("dialog", { name: "Leave shoot" })).toBeInTheDocument();
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(mockSave).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.getByRole("button", { name: "Shoot options" })).toHaveFocus());
});
