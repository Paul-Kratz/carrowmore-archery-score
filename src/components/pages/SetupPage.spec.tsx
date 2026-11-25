import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Cookies from "js-cookie";
import { SetupPage } from "./SetupPage";
import type { IUser } from "@/models";

const mockPush = jest.fn();

jest.mock("@/fonts/oswald", () => ({
  oswald: { className: "font-oswald" },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("js-cookie", () => ({
  set: jest.fn(),
}));

jest.mock("@/components/pages/setup/AddUsernameDialog", () => ({
  AddUsernameDialog: () => <div data-testid="add-username-dialog" />,
}));

const mockCurrentUser: IUser = {
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

const mockUsers: IUser[] = [
  mockCurrentUser,
  {
    id: "user-2",
    name: "Bob",
    email: "bob@example.com",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
];

// Radix scrolls the selected item and observes its popup in a real browser.
beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = jest.fn();
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
});

const chooseOption = (label: string, option: string) => {
  fireEvent.keyDown(screen.getByRole("combobox", { name: label }), {
    key: "ArrowDown",
  });
  fireEvent.click(screen.getByRole("option", { name: option }));
};

describe("SetupPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "shoot-123" }),
    }) as typeof fetch;
  });

  it("creates a shoot with a registered archer and navigates with the client router", async () => {
    render(<SetupPage users={mockUsers} currentUser={mockCurrentUser} />);

    fireEvent.change(screen.getByLabelText("Add archer by name"), {
      target: { value: "Bob" },
    });
    fireEvent.click(screen.getByText("Bob"));
    fireEvent.click(screen.getByText("Start Shoot"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/shoot",
        expect.objectContaining({
          method: "post",
          body: JSON.stringify({
            clubId: "carrowmore",
            participants: [
              { userId: "user-1", pegColor: "red" },
              { userId: "user-2", pegColor: "red" },
            ],
          }),
        }),
      );
      expect(Cookies.set).toHaveBeenCalledWith("active_shoot", "shoot-123");
      expect(mockPush).toHaveBeenCalledWith("/shoot/shoot-123/1");
    });
  });

  it("shows a resume action when there is an active shoot", () => {
    render(
      <SetupPage
        activeShootId="shoot-123"
        users={mockUsers}
        currentUser={mockCurrentUser}
      />,
    );

    fireEvent.click(screen.getByText("Resume Shoot"));

    expect(mockPush).toHaveBeenCalledWith("/shoot/shoot-123/1");
    expect(global.fetch).not.toHaveBeenCalled();
    expect(Cookies.set).not.toHaveBeenCalled();
  });

  it("includes guest names when creating a shoot", async () => {
    render(<SetupPage users={mockUsers} currentUser={mockCurrentUser} />);

    fireEvent.change(screen.getByLabelText("Add archer by name"), {
      target: { value: "Charlie" },
    });
    fireEvent.click(screen.getByText('Add guest "Charlie"'));
    fireEvent.click(screen.getByText("Start Shoot"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/shoot",
        expect.objectContaining({
          method: "post",
          body: JSON.stringify({
            clubId: "carrowmore",
            participants: [
              { userId: "user-1", pegColor: "red" },
              { guestName: "Charlie", pegColor: "red" },
            ],
          }),
        }),
      );
    });
  });

  it("allows the signed-in archer to start a solo shoot", async () => {
    render(<SetupPage users={mockUsers} currentUser={mockCurrentUser} />);

    fireEvent.click(screen.getByText("Start Shoot"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/shoot",
        expect.objectContaining({
          method: "post",
          body: JSON.stringify({
            clubId: "carrowmore",
            participants: [{ userId: "user-1", pegColor: "red" }],
          }),
        }),
      );
    });
  });

  it("includes the current user's selected peg colour", async () => {
    render(<SetupPage users={mockUsers} currentUser={mockCurrentUser} />);

    chooseOption("Peg for Alice", "Yellow peg");
    fireEvent.click(screen.getByText("Start Shoot"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/shoot",
        expect.objectContaining({
          method: "post",
          body: JSON.stringify({
            clubId: "carrowmore",
            participants: [{ userId: "user-1", pegColor: "yellow" }],
          }),
        }),
      );
    });
  });

  it("keeps peg editing separate from archer identity and removal", () => {
    render(<SetupPage users={mockUsers} currentUser={mockCurrentUser} />);

    fireEvent.change(screen.getByLabelText("Add archer by name"), {
      target: { value: "Alexandra Montgomery" },
    });
    fireEvent.click(screen.getByText('Add guest "Alexandra Montgomery"'));

    fireEvent.click(screen.getByText("Alexandra Montgomery"));
    expect(
      screen.getByRole("combobox", { name: "Peg for Alexandra Montgomery" }),
    ).toHaveTextContent("Red peg");
    expect(
      screen.queryByRole("button", { name: "Remove Alice" }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Remove Alexandra Montgomery" }),
    );
    expect(
      screen.queryByRole("combobox", { name: "Peg for Alexandra Montgomery" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Peg for Alice" })).toHaveTextContent("Red peg");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shows club-specific pegs and normalises incompatible selections when changing club", () => {
    render(<SetupPage users={mockUsers} currentUser={mockCurrentUser} />);

    chooseOption("Club", "Marble Archers");
    const peg = screen.getByRole("combobox", { name: "Peg for Alice" });
    expect(peg).toHaveTextContent("Yellow peg");
    fireEvent.keyDown(peg, { key: "ArrowDown" });
    expect(screen.getAllByRole("option").map((option) => option.textContent))
      .toEqual(["Yellow peg", "Blue peg", "Black peg"]);
    fireEvent.click(screen.getByRole("option", { name: "Blue peg" }));

    chooseOption("Club", "Carrowmore Archery");
    expect(peg).toHaveTextContent("Red peg");
    fireEvent.keyDown(peg, { key: "ArrowDown" });
    expect(screen.queryByRole("option", { name: "Blue peg" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: "Red peg" }));
  });

  it("explains the guest name limit and clears the validation when corrected", () => {
    render(<SetupPage users={mockUsers} currentUser={mockCurrentUser} />);
    const search = screen.getByLabelText("Add archer by name");
    fireEvent.change(search, { target: { value: "A".repeat(50) } });
    expect(screen.getByRole("button", { name: "Add archer" })).toBeEnabled();
    fireEvent.change(search, { target: { value: "A".repeat(51) } });
    expect(screen.getByRole("button", { name: "Add archer" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("50 characters or fewer");
    expect(search).toHaveAttribute("aria-invalid", "true");
    expect(search).toHaveAttribute("aria-describedby", screen.getByRole("alert").id);
    fireEvent.change(search, { target: { value: "Charlie" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(search).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByRole("button", { name: "Add archer" })).toBeEnabled();
  });

  it.each(["server", "network"])("retains the draft and allows retry after a %s creation failure", async failure => {
    const fetchMock = global.fetch as jest.Mock;
    if (failure === "server") fetchMock.mockResolvedValueOnce({ ok: false });
    else fetchMock.mockRejectedValueOnce(new Error("Offline"));
    render(<SetupPage users={mockUsers} currentUser={mockCurrentUser} />);
    fireEvent.change(screen.getByLabelText("Add archer by name"), { target: { value: "QA Guest" } });
    fireEvent.click(screen.getByRole("button", { name: "Add archer" }));
    fireEvent.click(screen.getByRole("button", { name: "Start Shoot" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn’t be started");
    expect(screen.getByText("QA Guest")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Shoot" })).toBeEnabled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(Cookies.set).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Start Shoot" }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/shoot/shoot-123/1"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).participants).toContainEqual({ guestName: "QA Guest", pegColor: "red" });
  });

  it("disables editing and prevents another start while a shoot is being created", async () => {
    let finishCreate!: (response: unknown) => void;
    (global.fetch as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        finishCreate = resolve;
      }),
    );
    render(<SetupPage users={mockUsers} currentUser={mockCurrentUser} />);

    const start = screen.getByRole("button", { name: "Start Shoot" });
    fireEvent.click(start);
    expect(start).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Club" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Peg for Alice" })).toBeDisabled();
    expect(screen.getByLabelText("Add archer by name")).toBeDisabled();
    expect(screen.getByRole("button", { name: "History" })).toBeDisabled();
    fireEvent.click(start);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    finishCreate({ ok: true, json: async () => ({ id: "shoot-123" }) });
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/shoot/shoot-123/1"),
    );
  });
});
