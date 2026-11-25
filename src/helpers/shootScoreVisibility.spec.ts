import { limitShootScoreDetails } from "./shootScoreVisibility";
import { createTestShootData } from "@/testFixtures/shoot";

const fixture = () => {
  const shoot = createTestShootData();
  return { ...shoot, participants: [
    shoot.participants[0],
    { ...shoot.participants[0], id: "other", user: { id: "user-2", name: "Bob" }, totalScore: 18,
      scores: [{ roundNumber: 1, score: 18 }] },
    { ...shoot.participants[0], id: "guest", user: null, guestName: "Guest", totalScore: 16,
      scores: [{ roundNumber: 1, score: 16 }] },
  ] };
};

it("retains every detailed score for the tracker", () => {
  const shoot = fixture();
  expect(limitShootScoreDetails(shoot, "user-1")).toEqual(shoot);
});

it("keeps the viewer's scores but strips other users and guests, retaining totals and counts", () => {
  const shoot = fixture();
  const visible = limitShootScoreDetails(shoot, "user-2");
  expect(visible.participants[1].scores).toEqual(shoot.participants[1].scores);
  for (const index of [0, 2]) {
    expect(visible.participants[index].scores).toEqual([]);
    expect(visible.participants[index].scoreDetailsVisible).toBe(false);
    expect(visible.participants[index].totalScore).toBe(shoot.participants[index].totalScore);
    expect(visible.participants[index].scoredCount).toBe(1);
  }
  expect(shoot.participants[0].scores).toHaveLength(2);
  expect(shoot.participants[2].scores).toHaveLength(1);
});

it("recognises a raw user ID as the viewer", () => {
  const shoot = fixture();
  shoot.participants[1].user = "user-2";
  expect(limitShootScoreDetails(shoot, "user-2").participants[1].scores).toEqual(shoot.participants[1].scores);
});
