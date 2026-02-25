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
jest.mock("@/components/pages/SetupPage", () => ({
  SetupPage: () => <div data-testid="setup-page" />,
}));

import Home from "./page";

describe("Home Page", () => {
  it("should export a default async function", () => {
    expect(typeof Home).toBe("function");
  });

  it("should resolve to a valid element", async () => {
    const result = await Home();
    expect(result).toBeTruthy();
  });
});
