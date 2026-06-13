jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({
    user: { id: "user-1", name: "Alice" },
  }),
}));

jest.mock("@/components/pages/ShootPage", () => ({
  ShootPage: ({
    currentStation,
    shootId,
  }: {
    currentStation: number;
    shootId: string;
  }) => (
    <div data-shoot-id={shootId} data-testid="shoot-page">
      {currentStation}
    </div>
  ),
}));

const mockRedirect = jest.fn((url: string) => {
  throw new Error(`redirect:${url}`);
});

jest.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

import ShootSession from "./page";

describe("/shoot/[shootId]/[roundNumber]", () => {
  beforeEach(() => {
    mockRedirect.mockClear();
  });

  it("renders a shoot using the route shoot id", async () => {
    const result = await ShootSession({
      params: Promise.resolve({ shootId: "shoot-123", roundNumber: "3" }),
    });

    expect(result).toBeTruthy();
    expect(result.props.shootId).toBe("shoot-123");
    expect(result.props.currentStation).toBe(3);
  });

  it("redirects invalid stations to the first station for the route shoot", async () => {
    await expect(
      ShootSession({
        params: Promise.resolve({ shootId: "shoot-123", roundNumber: "99" }),
      }),
    ).rejects.toThrow("redirect:/shoot/shoot-123/1");

    expect(mockRedirect).toHaveBeenCalledWith("/shoot/shoot-123/1");
  });
});
