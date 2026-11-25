import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { signIn } from "next-auth/react";
import { LoginPage } from "./LoginPage";
import { CheckEmail } from "./CheckEmail";

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock("next-auth/react", () => ({ signIn: jest.fn() }));
jest.mock("@/fonts/oswald", () => ({ oswald: { className: "oswald" } }));

const mockSignIn = jest.mocked(signIn);

function submitEmail(value = "archer@example.com") {
  fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), { target: { value } });
  fireEvent.submit(screen.getByRole("form", { name: "Email sign-in" }));
}

beforeEach(() => jest.resetAllMocks());

it("hands Google the original same-origin destination and prevents duplicate submits", async () => {
  mockSignIn.mockImplementation(() => new Promise(() => {}));
  render(<LoginPage callbackUrl="http://localhost/history?year=2026" />);
  fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
  await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith("google", { redirectTo: "/history?year=2026" }));
  expect(screen.getByRole("button", { name: "Opening Google…" })).toBeDisabled();
  expect(screen.getByRole("textbox")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Email sign-in link" })).toBeDisabled();
});

it("keeps the email sending state named and prevents duplicate submissions", async () => {
  mockSignIn.mockImplementation(() => new Promise(() => {}));
  render(<LoginPage />);
  submitEmail();
  expect(await screen.findByRole("button", { name: "Sending link…" })).toBeDisabled();
  submitEmail();
  expect(mockSignIn).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("textbox")).toBeDisabled();
});

it("sends a trimmed email through Auth.js and opens the confirmation with the callback", async () => {
  mockSignIn.mockResolvedValue({ ok: true, status: 200, error: undefined, code: undefined, url: "/login/check-email" });
  render(<LoginPage callbackUrl="/history" />);
  submitEmail("  archer@example.com  ");
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login/check-email?callbackUrl=%2Fhistory"));
  expect(mockSignIn).toHaveBeenCalledWith("resend", {
    email: "archer@example.com", redirect: false, redirectTo: "/history",
  });
});

it("blocks blank and invalid emails before contacting the provider", () => {
  render(<LoginPage />);
  expect(screen.getByRole("button", { name: "Email sign-in link" })).toBeDisabled();
  submitEmail("not-an-email");
  expect(mockSignIn).not.toHaveBeenCalled();
});

it("shows a send error, retains the email and lets the user retry", async () => {
  mockSignIn.mockResolvedValueOnce({ ok: true, status: 200, error: "EmailSignIn", code: undefined, url: null });
  render(<LoginPage />);
  submitEmail();
  expect(await screen.findByRole("alert")).toHaveTextContent("couldn’t send");
  expect(mockReplace).not.toHaveBeenCalled();
  expect(screen.getByRole("textbox")).toHaveValue("archer@example.com");
  expect(screen.getByRole("button", { name: "Email sign-in link" })).toBeEnabled();
  mockSignIn.mockResolvedValueOnce({ ok: true, status: 200, error: undefined, code: undefined, url: "/login/check-email" });
  fireEvent.submit(screen.getByRole("form", { name: "Email sign-in" }));
  await waitFor(() => expect(mockReplace).toHaveBeenCalled());
});

it("recovers from network failure and discards external return URLs", async () => {
  mockSignIn.mockRejectedValue(new Error("offline"));
  render(<LoginPage callbackUrl="https://untrusted.example/history" />);
  fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("check your connection");
  expect(mockSignIn).toHaveBeenCalledWith("google", { redirectTo: "/" });
  expect(screen.getByRole("button", { name: "Continue with Google" })).toBeEnabled();
});

it("explains an expired link and clears the message when a new attempt starts", () => {
  render(<LoginPage error="Verification" />);
  expect(screen.getByRole("alert")).toHaveTextContent("expired or has already been used");
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "archer@example.com" } });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("keeps the confirmation back link local and preserves its callback", () => {
  render(<CheckEmail callbackUrl="/shoot/123/1" />);
  expect(screen.getByRole("heading", { name: "Check your email" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveAttribute("href", "/login?callbackUrl=%2Fshoot%2F123%2F1");
  expect(mockSignIn).not.toHaveBeenCalled();
});
