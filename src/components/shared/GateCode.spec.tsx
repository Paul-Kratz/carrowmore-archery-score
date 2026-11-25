import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GateCode } from "./GateCode";

const mockVerifyCode = jest.fn();
let mockPending = false;

jest.mock("@/fonts/oswald", () => ({ oswald: { className: "oswald" } }));
jest.mock("@/hooks/queries", () => ({
  useVerifyAccessCode: () => ({ mutateAsync: mockVerifyCode, isPending: mockPending }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockPending = false;
  mockVerifyCode.mockReset();
  mockVerifyCode.mockRejectedValue(new Error("Invalid access code"));
});

it("has one page heading and a labelled code field with a numeric keyboard hint", () => {
  render(<GateCode />);
  expect(screen.getByText("In the Forest")).toBeInTheDocument();
  expect(screen.getAllByRole("heading")).toHaveLength(1);
  expect(screen.getByRole("heading", { name: "Come on in" })).toBeInTheDocument();
  const input = screen.getByRole("textbox", { name: "Gate code" });
  expect(input).toHaveAttribute("type", "text");
  expect(input).toHaveAttribute("inputmode", "numeric");
  expect(input).toHaveAttribute("maxlength", "4");
  expect(input).toHaveValue("");
  expect(input).toHaveAttribute("aria-invalid", "false");
  expect(screen.queryByText("Carrowmore Archers")).not.toBeInTheDocument();
});

it("blocks empty and whitespace-only submissions", () => {
  render(<GateCode />);
  const submit = screen.getByRole("button", { name: "Enter" });
  expect(submit).toBeDisabled();
  fireEvent.submit(screen.getByRole("form", { name: "Gate access" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Gate code" }), { target: { value: "   " } });
  expect(submit).toBeDisabled();
  fireEvent.submit(screen.getByRole("form", { name: "Gate access" }));
  expect(mockVerifyCode).not.toHaveBeenCalled();
});

it("preserves leading zeroes when submitting a four-character gate code", async () => {
  render(<GateCode />);
  fireEvent.change(screen.getByRole("textbox", { name: "Gate code" }), { target: { value: "0012" } });
  fireEvent.submit(screen.getByRole("form", { name: "Gate access" }));
  await screen.findByRole("alert");
  expect(mockVerifyCode).toHaveBeenCalledWith({ accessCode: "0012" });
});

it("submits the entered code and trims surrounding whitespace", async () => {
  render(<GateCode />);
  fireEvent.change(screen.getByRole("textbox", { name: "Gate code" }), { target: { value: " 0123 " } });
  fireEvent.click(screen.getByRole("button", { name: "Enter" }));
  await screen.findByRole("alert");
  expect(mockVerifyCode).toHaveBeenCalledWith({ accessCode: "0123" });
});

it("announces rejection, clears and focuses the field, and clears the error on editing", async () => {
  render(<GateCode />);
  const input = screen.getByRole("textbox", { name: "Gate code" });
  fireEvent.change(input, { target: { value: "0000" } });
  fireEvent.click(screen.getByRole("button", { name: "Enter" }));
  const error = await screen.findByRole("alert");
  expect(error).toHaveTextContent("Incorrect gate code. Please try again.");
  expect(input).toHaveValue("");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input.getAttribute("aria-describedby")).toContain(error.id);
  await waitFor(() => expect(input).toHaveFocus());
  fireEvent.change(input, { target: { value: "1234" } });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(input).toHaveAttribute("aria-invalid", "false");
  expect(screen.getByRole("button", { name: "Enter" })).toBeEnabled();
});

it("locks input and submission while checking and announces the pending state", () => {
  mockPending = true;
  render(<GateCode />);
  expect(screen.getByRole("textbox", { name: "Gate code" })).toBeDisabled();
  expect(screen.getByRole("button")).toBeDisabled();
  expect(screen.getByRole("status", { name: "Checking gate code" })).toBeInTheDocument();
  expect(screen.getByText("Checking…")).toBeVisible();
  fireEvent.submit(screen.getByRole("form", { name: "Gate access" }));
  expect(mockVerifyCode).not.toHaveBeenCalled();
});
