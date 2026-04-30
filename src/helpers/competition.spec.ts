import { NUM_STATIONS } from "@/constants";
import { CompetitionRoundKey } from "@/models";
import {
  createCompetitionCode,
  createParticipantToken,
  getCompetitionRoundMode,
  getCompletedStationCount,
  getEmptyCompetitionScores,
  getRoundTotal,
  hashParticipantToken,
  isCompetitionRoundKey,
} from "./competition";

describe("competition helpers", () => {
  it("creates URL-safe competition codes from titles", () => {
    expect(createCompetitionCode("Spring Club Shoot")).toMatch(
      /^spring-club-shoot-[a-f0-9]{6}$/,
    );
  });

  it("creates and hashes participant tokens", () => {
    const token = createParticipantToken();
    const hash = hashParticipantToken(token);

    expect(token).toHaveLength(43);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe(hashParticipantToken(token));
  });

  it("validates competition round keys", () => {
    expect(isCompetitionRoundKey(CompetitionRoundKey.morning)).toBe(true);
    expect(isCompetitionRoundKey(CompetitionRoundKey.afternoon)).toBe(true);
    expect(isCompetitionRoundKey("evening")).toBe(false);
  });

  it("maps morning to yellow mode and afternoon to red mode", () => {
    expect(getCompetitionRoundMode(CompetitionRoundKey.morning)).toBe("yellow");
    expect(getCompetitionRoundMode(CompetitionRoundKey.afternoon)).toBe("red");
  });

  it("builds empty scorecards for both rounds", () => {
    const scores = getEmptyCompetitionScores();

    expect(scores.morning).toHaveLength(NUM_STATIONS);
    expect(scores.afternoon).toHaveLength(NUM_STATIONS);
    expect(scores.morning.every((score) => score === null)).toBe(true);
  });

  it("calculates totals and completed station counts", () => {
    const scores = [20, null, 16, 0, null];

    expect(getRoundTotal(scores)).toBe(36);
    expect(getCompletedStationCount(scores)).toBe(3);
  });
});
