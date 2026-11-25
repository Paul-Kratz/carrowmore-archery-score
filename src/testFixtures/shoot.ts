import type { IShootDenormalized, IUser } from "@/models";

export const testUser: IUser = {
  id: "user-1", name: "Alice", email: "alice@example.com",
  createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-01"),
};

export const createTestShootData = (overrides: Partial<IShootDenormalized> = {}): IShootDenormalized => ({
  id: "shoot-1", schemaVersion: 1, clubId: "carrowmore", createdBy: "user-1",
  createdAt: new Date("2026-01-01T10:00:00Z"), updatedAt: new Date("2026-01-01T10:00:00Z"),
  firstScoredAt: new Date("2026-01-01T10:00:00Z"), completedAt: null, completed: false,
  notes: null, participantCount: 1, scoredCount: 1, totalStations: 2, totalScoreSlots: 2,
  participants: [{
    id: "participant-1", user: { id: "user-1", name: "Alice" }, pegColor: "red",
    joinedAt: new Date("2026-01-01T10:00:00Z"), totalScore: 20, scoredCount: 1,
    scores: [{ roundNumber: 1, score: 20 }, { roundNumber: 2, score: null }],
  }],
  ...overrides,
});
