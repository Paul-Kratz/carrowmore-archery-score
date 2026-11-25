import { fireEvent, render, screen } from "@testing-library/react";
import ErrorPage from "@/app/error";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";

jest.mock("@/fonts/oswald", () => ({ oswald: { className: "oswald" } }));

it("offers a working retry without displaying internal error details", () => {
  const reset = jest.fn();
  render(<ErrorPage error={new Error("private database details")} reset={reset} />);
  expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
  expect(screen.queryByText(/private database details/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(reset).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("link", { name: "Back to setup" })).toHaveAttribute("href", "/");
});

it("announces route loading accessibly", () => {
  render(<Loading />);
  expect(screen.getByRole("status", { name: "Loading page" })).toBeInTheDocument();
});

it("gives missing pages a route back to setup", () => {
  render(<NotFound />);
  expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Back to setup" })).toHaveAttribute("href", "/");
});
