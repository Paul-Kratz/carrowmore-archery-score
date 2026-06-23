import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Cookies from "js-cookie";
import { Shoot, type IShootDenormalized } from "@/models";
import { ExitDialog } from "./ExitDialog";

const mockMutateAsync = jest.fn();
const mockPush = jest.fn();

jest.mock("@/hooks/queries", () => ({
  useUpdateShoot: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("js-cookie", () => ({
  remove: jest.fn(),
}));

jest.mock("@radix-ui/themes", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  Dialog: {
    Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Trigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Content: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    Description: ({ children }: { children: React.ReactNode }) => (
      <p>{children}</p>
    ),
    Close: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
  TextArea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} />
  ),
}));

const shootData: IShootDenormalized = {
  id: "shoot-123",
  schemaVersion: 1,
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  updatedAt: new Date("2026-01-01T10:00:00.000Z"),
  createdBy: "user-1",
  clubId: "carrowmore",
  totalStations: 18,
  completed: false,
  firstScoredAt: null,
  completedAt: null,
  notes: null,
  participantCount: 0,
  scoredCount: 0,
  totalScoreSlots: 0,
  participants: [],
};
const shoot = Shoot.from(shootData, "user-1");

const renderExitDialog = () =>
  render(
    <ExitDialog
      shoot={shoot}
      triggerComponent={<button type="button">Leave shoot</button>}
    />,
  );

describe("ExitDialog active shoot cookie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockResolvedValue(undefined);
  });

  it("does not clear the active shoot cookie when the dialog opens or closes", () => {
    renderExitDialog();

    fireEvent.click(screen.getByRole("button", { name: "Leave shoot" }));
    fireEvent.click(screen.getByLabelText("Close"));

    expect(Cookies.remove).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clears the active shoot cookie after the exit action saves successfully", async () => {
    renderExitDialog();

    fireEvent.click(screen.getByText("Save & Exit"));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        shootId: "shoot-123",
        notes: "",
        completed: false,
      });
      expect(Cookies.remove).toHaveBeenCalledWith("active_shoot");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("keeps the active shoot cookie when saving the exit fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mockMutateAsync.mockRejectedValue(new Error("Save failed"));

    renderExitDialog();
    fireEvent.click(screen.getByText("Save & Exit"));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });

    expect(Cookies.remove).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
