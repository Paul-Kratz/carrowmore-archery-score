const mockCheckInCompetitionParticipant = jest.fn();

jest.mock("@/functions/competition", () => ({
  checkInCompetitionParticipant: mockCheckInCompetitionParticipant,
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => {
      const headers = new Map<string, string>();
      const response = {
        status: init?.status ?? 200,
        headers: {
          get: (name: string) => headers.get(name.toLowerCase()) ?? null,
          append: (name: string, value: string) => {
            const key = name.toLowerCase();
            const current = headers.get(key);
            headers.set(key, current ? `${current}, ${value}` : value);
          },
        },
        json: async () => body,
      };

      Object.defineProperty(response, "cookies", {
        value: {
          set: (
            name: string,
            value: string,
            options: { path?: string } = {},
          ) => {
            response.headers.append(
              "set-cookie",
              `${name}=${value}; Path=${options.path ?? "/"}`,
            );
          },
        },
      });

      return response;
    },
  },
}));

import { CompetitionStatus, Mode } from "@/models";
import { POST } from "./route";

function createRequest(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as never;
}

describe("/api/competition/[code]/check-in", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets the participant token cookie on the root path", async () => {
    mockCheckInCompetitionParticipant.mockResolvedValue({
      token: "participant-token",
      competition: {
        id: "competition-1",
        title: "Spring Shoot",
        date: "2026-05-09T00:00:00.000Z",
        mode: Mode.yellow,
        createdBy: "user-1",
        code: "spring-shoot",
        status: CompetitionStatus.open,
      },
      participant: {
        id: "participant-1",
        displayName: "Archer",
      },
    });

    const response = await POST(createRequest({ displayName: "Archer" }), {
      params: Promise.resolve({ code: "spring-shoot" }),
    });

    expect(response.status).toBe(201);
    expect(response.headers.get("set-cookie")).toContain(
      "competition_participant_spring-shoot=participant-token",
    );
    expect(response.headers.get("set-cookie")).toContain("Path=/");
  });

  it("rejects duplicate participant names", async () => {
    mockCheckInCompetitionParticipant.mockRejectedValue(
      new Error("Participant name already checked in"),
    );

    const response = await POST(createRequest({ displayName: "Archer" }), {
      params: Promise.resolve({ code: "spring-shoot" }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Participant name already checked in",
    });
  });
});
