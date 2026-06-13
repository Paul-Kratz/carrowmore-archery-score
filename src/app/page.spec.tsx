jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({
    user: { id: "1", name: "Test", email: "test@test.com" },
  }),
}));
jest.mock("@/lib/mongoose", () => ({
  connectMongoose: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/models/mongoose", () => ({
  User: { find: jest.fn(() => ({ lean: jest.fn().mockResolvedValue([]) })) },
}));
const mockCookieGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    get: mockCookieGet,
  }),
}));

const mockSetupPage = jest.fn((props: unknown) => {
  void props;
  return <div data-testid="setup-page" />;
});

jest.mock("@/components/pages/SetupPage", () => ({
  SetupPage: (props: unknown) => mockSetupPage(props),
}));

import Home from "./page";

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookieGet.mockReturnValue(undefined);
  });

  it("should export a default async function", () => {
    expect(typeof Home).toBe("function");
  });

  it("should resolve to a valid element", async () => {
    const result = await Home();
    expect(result).toBeTruthy();
  });

  it("passes the active shoot cookie to setup", async () => {
    mockCookieGet.mockReturnValue({ value: "shoot-123" });

    const result = await Home();

    expect(mockCookieGet).toHaveBeenCalledWith("active_shoot");
    expect(result.props.activeShootId).toBe("shoot-123");
  });
});
