const mockConnectMongoose = jest.fn();
const mockShootUpdateOne = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  Shoot: {
    updateOne: mockShootUpdateOne,
  },
}));

import { updateShoot } from "./updateShoot";

describe("updateShoot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShootUpdateOne.mockResolvedValue({ modifiedCount: 1 });
  });

  it("should connect to mongoose", async () => {
    await updateShoot({
      shootId: "shoot123",
      notes: "Test notes",
      completed: false,
    });

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("should update shoot with notes and completed status", async () => {
    const shootId = "shoot123";
    const notes = "Great session today";
    const completed = true;

    await updateShoot({ shootId, notes, completed });

    expect(mockShootUpdateOne).toHaveBeenCalledWith(expect.anything(), {
      notes: "Great session today",
      completed: true,
    });
  });

  it("should update shoot with correct shoot ID", async () => {
    const shootId = "shoot123";

    await updateShoot({
      shootId,
      notes: "Test",
      completed: false,
    });

    expect(mockShootUpdateOne).toHaveBeenCalled();
  });

  it("should mark shoot as completed", async () => {
    await updateShoot({
      shootId: "shoot123",
      notes: "",
      completed: true,
    });

    expect(mockShootUpdateOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ completed: true }),
    );
  });

  it("should mark shoot as not completed", async () => {
    await updateShoot({
      shootId: "shoot123",
      notes: "",
      completed: false,
    });

    expect(mockShootUpdateOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ completed: false }),
    );
  });

  it("should update with empty notes", async () => {
    await updateShoot({
      shootId: "shoot123",
      notes: "",
      completed: true,
    });

    expect(mockShootUpdateOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ notes: "" }),
    );
  });

  it("should update with long notes", async () => {
    const longNotes =
      "This is a very long note with lots of details about the archery session and how it went.";

    await updateShoot({
      shootId: "shoot123",
      notes: longNotes,
      completed: true,
    });

    expect(mockShootUpdateOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ notes: longNotes }),
    );
  });

  it("should handle different shoot IDs", async () => {
    await updateShoot({
      shootId: "shoot1",
      notes: "First shoot",
      completed: true,
    });

    await updateShoot({
      shootId: "shoot2",
      notes: "Second shoot",
      completed: false,
    });

    expect(mockShootUpdateOne).toHaveBeenCalledTimes(2);
  });

  it("should complete without returning value", async () => {
    const result = await updateShoot({
      shootId: "shoot123",
      notes: "Test",
      completed: true,
    });

    expect(result).toBeUndefined();
  });

  it("should handle update of only completed status", async () => {
    await updateShoot({
      shootId: "shoot123",
      notes: "",
      completed: true,
    });

    expect(mockShootUpdateOne).toHaveBeenCalledWith(expect.anything(), {
      notes: "",
      completed: true,
    });
  });

  it("should handle update of only notes", async () => {
    await updateShoot({
      shootId: "shoot123",
      notes: "Updated notes",
      completed: false,
    });

    expect(mockShootUpdateOne).toHaveBeenCalledWith(expect.anything(), {
      notes: "Updated notes",
      completed: false,
    });
  });
});
