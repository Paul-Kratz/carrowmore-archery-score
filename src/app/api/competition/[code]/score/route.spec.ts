const mockUpdateCompetitionParticipantScore = jest.fn();

jest.mock("@/functions/competition", () => ({
  updateCompetitionParticipantScore: mockUpdateCompetitionParticipantScore,
}));

import { CompetitionRoundKey } from "@/models";
import { PATCH } from "./route";

function createRequest(body: unknown, token?: string) {
  return {
    json: jest.fn().mockResolvedValue(body),
    cookies: {
      get: jest.fn(() => (token ? { value: token } : undefined)),
    },
  } as never;
}

describe("/api/competition/[code]/score", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates scores using the participant token cookie", async () => {
    mockUpdateCompetitionParticipantScore.mockResolvedValue({
      participant: { id: "participant-1" },
    });

    const response = await PATCH(
      createRequest(
        {
          participantId: "spoofed-participant",
          roundKey: CompetitionRoundKey.morning,
          stationNumber: 1,
          score: 20,
        },
        "participant-token",
      ),
      { params: Promise.resolve({ code: "spring-shoot" }) },
    );

    expect(response.status).toBe(200);
    expect(mockUpdateCompetitionParticipantScore).toHaveBeenCalledWith({
      code: "spring-shoot",
      token: "participant-token",
      roundKey: CompetitionRoundKey.morning,
      stationNumber: 1,
      score: 20,
    });
  });

  it("rejects invalid scores before updating", async () => {
    const response = await PATCH(
      createRequest(
        {
          roundKey: CompetitionRoundKey.morning,
          stationNumber: 1,
          score: 11,
        },
        "participant-token",
      ),
      { params: Promise.resolve({ code: "spring-shoot" }) },
    );

    expect(response.status).toBe(400);
    expect(mockUpdateCompetitionParticipantScore).not.toHaveBeenCalled();
  });
});
