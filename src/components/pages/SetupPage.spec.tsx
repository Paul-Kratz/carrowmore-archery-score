import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Cookies from "js-cookie";
import { SetupPage } from "./SetupPage";
import { Mode, type IUser } from "@/models";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("js-cookie", () => ({
  set: jest.fn(),
}));

jest.mock("../AddUsernameDialog", () => ({
  AddUsernameDialog: () => <div data-testid="add-username-dialog" />,
}));

jest.mock("@radix-ui/themes", () => {
  const actual = jest.requireActual("@radix-ui/themes");

  return {
    ...actual,
    Select: {
      Root: ({
        value,
        onValueChange,
        children,
      }: {
        value: string;
        onValueChange: (value: string) => void;
        children: ReactNode;
      }) => (
        <div>
          <select
            aria-label="Select a participant"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
          >
            <option value="">Select a participant</option>
            {children}
          </select>
        </div>
      ),
      Trigger: () => null,
      Content: ({ children }: { children: ReactNode }) => <>{children}</>,
      Item: ({
        value,
        children,
      }: {
        value: string;
        children: ReactNode;
      }) => <option value={value}>{children}</option>,
    },
    RadioGroup: {
      Root: ({
        value,
        onValueChange,
        children,
      }: {
        value: string;
        onValueChange: (value: string) => void;
        children: ReactNode;
      }) => (
        <div role="radiogroup" data-value={value}>
          <button type="button" onClick={() => onValueChange(Mode.red)}>
            red
          </button>
          <button type="button" onClick={() => onValueChange(Mode.yellow)}>
            yellow
          </button>
          {children}
        </div>
      ),
      Item: () => null,
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

  it("creates a shoot and navigates with the client router", async () => {
    render(<SetupPage users={mockUsers} currentUser={mockCurrentUser} />);

    fireEvent.change(screen.getByLabelText("Select a participant"), {
      target: { value: "user-2" },
    });
    fireEvent.click(screen.getByText("Add"));
    fireEvent.click(screen.getByText("Start Shoot"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/shoot",
        expect.objectContaining({
          method: "post",
          body: JSON.stringify({
            mode: Mode.yellow,
            participantIds: ["user-2"],
          }),
        }),
      );
      expect(Cookies.set).toHaveBeenCalledWith("active_shoot", "shoot-123");
      expect(mockPush).toHaveBeenCalledWith("/shoot/1");
    });
  });
});
