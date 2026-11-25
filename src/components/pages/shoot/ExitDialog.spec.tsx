import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import Cookies from "js-cookie";
import { Theme } from "@radix-ui/themes";
import { Shoot } from "@/models";
import { createTestShootData } from "@/testFixtures/shoot";
import { ExitDialog } from "./ExitDialog";

const mockMutateAsync = jest.fn();
const mockPush = jest.fn();
jest.mock("@/hooks/queries", () => ({ useUpdateShoot: () => ({ mutateAsync: mockMutateAsync }) }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("js-cookie", () => ({ remove: jest.fn(), set: jest.fn() }));

const renderExitDialog = (notes: string | null = null, finished = false) => {
  render(<Theme><ExitDialog shoot={Shoot.from(createTestShootData({ notes }), "user-1")} isShootFinished={finished} triggerComponent={<button>Open dialog</button>} /></Theme>);
  fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
};
beforeEach(() => { jest.clearAllMocks(); mockMutateAsync.mockResolvedValue(undefined); });

it("allows cancelling without saving or clearing the active shoot cookie", () => {
  renderExitDialog();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(mockMutateAsync).not.toHaveBeenCalled(); expect(Cookies.remove).not.toHaveBeenCalled();
  expect(Cookies.set).not.toHaveBeenCalled();
});

it.each([false, true])("preserves notes and updates resume state only after saving, finished=%s", async (finished) => {
  renderExitDialog("Existing notes", finished);
  expect(screen.getByRole("textbox", { name: /Notes/ })).toHaveValue("Existing notes");
  fireEvent.click(screen.getByRole("button", { name: finished ? "Save & Finish" : "Save & Exit" }));
  await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  if (finished) {
    expect(Cookies.remove).toHaveBeenCalledWith("active_shoot");
    expect(Cookies.set).not.toHaveBeenCalled();
  } else {
    expect(Cookies.set).toHaveBeenCalledWith("active_shoot", "shoot-1");
    expect(Cookies.remove).not.toHaveBeenCalled();
  }
  expect(mockMutateAsync).toHaveBeenCalledWith({ shootId: "shoot-1", notes: "Existing notes", completed: finished });
  expect(mockPush).toHaveBeenCalledWith("/");
});

it("retains the dialog and edited notes after failure, without clearing the cookie", async () => {
  mockMutateAsync.mockRejectedValue(new Error("Save failed")); renderExitDialog();
  fireEvent.change(screen.getByRole("textbox", { name: /Notes/ }), { target: { value: "A wet afternoon" } });
  fireEvent.click(screen.getByRole("button", { name: "Save & Exit" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("could not be saved");
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /Notes/ })).toHaveValue("A wet afternoon");
  expect(Cookies.remove).not.toHaveBeenCalled(); expect(mockPush).not.toHaveBeenCalled();
  expect(Cookies.set).not.toHaveBeenCalled();
});

it("prevents closing or resubmitting while saving", () => {
  mockMutateAsync.mockReturnValue(new Promise(() => {})); renderExitDialog();
  fireEvent.click(screen.getByRole("button", { name: "Save & Exit" }));
  const dialog = screen.getByRole("dialog");
  for (const button of within(dialog).getAllByRole("button")) expect(button).toBeDisabled();
  expect(screen.getByRole("textbox")).toBeDisabled();
  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(mockMutateAsync).toHaveBeenCalledTimes(1);
});
