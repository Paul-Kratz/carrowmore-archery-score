// Mock dependencies before imports
const mockPush = jest.fn();
const mockVerifyCode = jest.fn();
const mockCookiesGet = jest.fn();
const mockCookiesSet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("js-cookie", () => ({
  __esModule: true,
  default: {
    get: mockCookiesGet,
    set: mockCookiesSet,
  },
}));

jest.mock("@/hooks/queries", () => ({
  useVerifyAccessCode: () => ({
    mutate: mockVerifyCode,
  }),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./page";

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookiesGet.mockReturnValue(null);
  });

  describe("Rendering", () => {
    it("should render the page blocks successfully", () => {
      render(<Home />);
      expect(screen.getByText("In the Forest")).toBeInTheDocument();
      expect(screen.getByText("Welcome to In the Forest")).toBeInTheDocument();
      expect(
        screen.getByText("Please enter the gate code"),
      ).toBeInTheDocument();
      const input = screen.getByPlaceholderText("Gate Code");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "number");
      expect(screen.getByRole("button", { name: "Enter" })).toBeInTheDocument();
      const header = screen.getByRole("banner");
      expect(header).toBeInTheDocument();
    });
  });

  describe("Cookie Check on Mount", () => {
    it("should redirect to /setup if gate code cookie exists", () => {
      mockCookiesGet.mockReturnValue("valid");

      render(<Home />);

      expect(mockCookiesGet).toHaveBeenCalledWith("x-gate-code");
      expect(mockPush).toHaveBeenCalledWith("/setup");
    });

    it("should not redirect if gate code cookie does not exist", () => {
      mockCookiesGet.mockReturnValue(null);

      render(<Home />);

      expect(mockCookiesGet).toHaveBeenCalledWith("x-gate-code");
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Code Input", () => {
    it("should update code state when input changes", () => {
      render(<Home />);
      const input = screen.getByPlaceholderText(
        "Gate Code",
      ) as HTMLInputElement;

      fireEvent.change(input, { target: { value: "1234" } });

      expect(input.value).toBe("1234");
    });

    it("should allow entering numbers", () => {
      render(<Home />);
      const input = screen.getByPlaceholderText(
        "Gate Code",
      ) as HTMLInputElement;

      fireEvent.change(input, { target: { value: "5678" } });

      expect(input.value).toBe("5678");
    });

    it("should start with empty code", () => {
      render(<Home />);
      const input = screen.getByPlaceholderText(
        "Gate Code",
      ) as HTMLInputElement;

      expect(input.value).toBe("");
    });
  });

  describe("Code Verification", () => {
    it("should call verifyCode when Enter button is clicked", () => {
      render(<Home />);
      const input = screen.getByPlaceholderText("Gate Code");
      const button = screen.getByRole("button", { name: "Enter" });

      fireEvent.change(input, { target: { value: "1609" } });
      fireEvent.click(button);

      expect(mockVerifyCode).toHaveBeenCalledWith(
        { accessCode: "1609" },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );
    });

    it("should set cookie and redirect on successful verification", () => {
      render(<Home />);
      const input = screen.getByPlaceholderText("Gate Code");
      const button = screen.getByRole("button", { name: "Enter" });

      fireEvent.change(input, { target: { value: "1609" } });
      fireEvent.click(button);

      // Get the onSuccess callback and call it
      const verifyCall = mockVerifyCode.mock.calls[0];
      const callbacks = verifyCall[1];
      callbacks.onSuccess();

      expect(mockCookiesSet).toHaveBeenCalledWith("x-gate-code", "valid");
      expect(mockPush).toHaveBeenCalledWith("/setup");
    });

    it("should show alert and clear code on verification error", async () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

      render(<Home />);
      const input = screen.getByPlaceholderText(
        "Gate Code",
      ) as HTMLInputElement;
      const button = screen.getByRole("button", { name: "Enter" });

      fireEvent.change(input, { target: { value: "9999" } });
      fireEvent.click(button);

      // Get the onError callback and call it
      const verifyCall = mockVerifyCode.mock.calls[0];
      const callbacks = verifyCall[1];
      callbacks.onError();

      expect(alertSpy).toHaveBeenCalledWith(
        "Incorrect gate code. Please try again.",
      );

      // Wait for the state update to complete
      await waitFor(() => {
        expect(input.value).toBe("");
      });

      alertSpy.mockRestore();
    });

    it("should handle empty code submission", () => {
      render(<Home />);
      const button = screen.getByRole("button", { name: "Enter" });

      fireEvent.click(button);

      expect(mockVerifyCode).toHaveBeenCalledWith(
        { accessCode: "" },
        expect.any(Object),
      );
    });

    it("should handle errors during verification gracefully", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const testError = new Error("Network error");

      mockVerifyCode.mockImplementation(() => {
        throw testError;
      });

      render(<Home />);
      const input = screen.getByPlaceholderText(
        "Gate Code",
      ) as HTMLInputElement;
      const button = screen.getByRole("button", { name: "Enter" });

      fireEvent.change(input, { target: { value: "1234" } });
      fireEvent.click(button);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error verifying access code:",
        testError,
      );
      expect(input.value).toBe("");

      consoleSpy.mockRestore();
    });
  });

  describe("Multiple Interactions", () => {
    it("should allow multiple code entry attempts", async () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

      render(<Home />);
      const input = screen.getByPlaceholderText(
        "Gate Code",
      ) as HTMLInputElement;
      const button = screen.getByRole("button", { name: "Enter" });

      // First attempt
      fireEvent.change(input, { target: { value: "1111" } });
      fireEvent.click(button);

      const firstCall = mockVerifyCode.mock.calls[0];
      firstCall[1].onError();

      await waitFor(() => {
        expect(input.value).toBe("");
      });

      // Second attempt
      fireEvent.change(input, { target: { value: "2222" } });
      fireEvent.click(button);

      expect(mockVerifyCode).toHaveBeenCalledTimes(2);

      alertSpy.mockRestore();
    });

    it("should not redirect multiple times if cookie already exists", () => {
      mockCookiesGet.mockReturnValue("valid");

      render(<Home />);

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/setup");
    });
  });
});
