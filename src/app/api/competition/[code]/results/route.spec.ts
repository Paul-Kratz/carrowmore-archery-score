const mockGetCompetitionResults = jest.fn();

jest.mock("@/functions/competition", () => ({
  getCompetitionResults: mockGetCompetitionResults,
}));

import { CompetitionStatus, Mode } from "@/models";
import { GET } from "./route";

describe("/api/competition/[code]/results", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 when competition does not exist", async () => {
    mockGetCompetitionResults.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost") as never, {
      params: Promise.resolve({ code: "missing" }),
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Competition not found" });
  });

  it("hides results while the competition is open", async () => {
    mockGetCompetitionResults.mockResolvedValue({
      id: "competition-1",
      title: "Spring Shoot",
      date: "2026-05-09T00:00:00.000Z",
      mode: Mode.yellow,
      createdBy: "user-1",
      code: "spring-shoot",
      status: CompetitionStatus.open,
      participants: [],
    });

    const response = await GET(new Request("http://localhost") as never, {
      params: Promise.resolve({ code: "spring-shoot" }),
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Results are not available yet",
    });
  });

  it("returns results after the competition is finished", async () => {
    const finishedResults = {
      id: "competition-1",
      title: "Spring Shoot",
      date: "2026-05-09T00:00:00.000Z",
      mode: Mode.yellow,
      createdBy: "user-1",
      code: "spring-shoot",
      status: CompetitionStatus.finished,
      participants: [{ id: "participant-1", displayName: "Archer" }],
    };
    mockGetCompetitionResults.mockResolvedValue(finishedResults);

    const response = await GET(new Request("http://localhost") as never, {
      params: Promise.resolve({ code: "spring-shoot" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(finishedResults);
  });
});
