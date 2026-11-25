import { fireEvent, render, screen } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import { AddUsernameDialog } from "./AddUsernameDialog";

const mockSave = jest.fn();
let mockPending = false;
jest.mock("@/hooks/queries", () => ({ useUpdateUsername: () => ({ mutateAsync: mockSave, isPending: mockPending }) }));
beforeEach(() => { jest.clearAllMocks(); mockPending = false; });

it("requires a nonblank name and keeps the form visible on failure", async () => {
  mockSave.mockRejectedValue(new Error("Save failed")); render(<Theme><AddUsernameDialog /></Theme>);
  const input = screen.getByRole("textbox", { name: "Name" });
  const button = screen.getByRole("button", { name: "Save name" });
  expect(button).toBeDisabled();
  fireEvent.change(input, { target: { value: "  " } }); expect(button).toBeDisabled();
  fireEvent.change(input, { target: { value: "Alice" } }); fireEvent.click(button);
  expect(mockSave).toHaveBeenCalledWith({ name: "Alice" });
  expect(await screen.findByRole("alert")).toHaveTextContent("could not be saved");
  expect(screen.getByRole("alertdialog")).toBeInTheDocument(); expect(input).toHaveValue("Alice");
});

it("locks the name field and submit button while saving", () => {
  mockPending = true; render(<Theme><AddUsernameDialog /></Theme>);
  expect(screen.getByRole("textbox", { name: "Name" })).toBeDisabled();
  expect(screen.getByRole("button")).toBeDisabled();
});
