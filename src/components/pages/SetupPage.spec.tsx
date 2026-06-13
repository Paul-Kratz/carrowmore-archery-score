import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Cookies from "js-cookie";
import { SetupPage } from "./SetupPage";
import type { IUser } from "@/models";

const mockPush = jest.fn();

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

jest.mock("@radix-ui/themes", () => {
  const actual = jest.requireActual("@radix-ui/themes");

  return {
    ...actual,
    Select: {
      Root: ({
        defaultValue,
        onValueChange,
        children,
      }: {
        defaultValue: string;
        onValueChange: (value: string) => void;
        children: ReactNode;
      }) => (
        <div data-value={defaultValue} data-testid="select-root">
          <button type="button" onClick={() => onValueChange(defaultValue)}>
            Select club
          </button>
          {children}
        </div>
      ),
      Trigger: () => null,
      Content: ({ children }: { children: ReactNode }) => <>{children}</>,
      Group: ({ children }: { children: ReactNode }) => <>{children}</>,
      Item: ({ value, children }: { value: string; children: ReactNode }) => (
        <button type="button" value={value}>
          {children}
        </button>
      ),
    },
  };
});

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

    fireEvent.click(
      screen.getByLabelText("Change Alice peg colour, currently Red"),
    );
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
});
