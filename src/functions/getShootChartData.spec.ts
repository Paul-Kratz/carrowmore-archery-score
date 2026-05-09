const mockConnectMongoose = jest.fn();
const mockShootAggregate = jest.fn();
const mockFormatResponseArray = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  Shoot: {
    aggregate: mockShootAggregate,
  },
}));

jest.mock("@/helpers/formatResponse", () => ({
  formatResponseArray: mockFormatResponseArray,
}));

import { getShootChartData } from "./getShootChartData";

describe("getShootChartData", () => {
  const mockAggregatePipeline = {
    lookup: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    unwind: jest.fn().mockReturnThis(),
    addFields: jest.fn().mockReturnThis(),
    group: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockShootAggregate.mockReturnValue(mockAggregatePipeline);
  });

  it("includes clubId in chart data aggregation", async () => {
    mockFormatResponseArray.mockResolvedValue([]);

    await getShootChartData("507f1f77bcf86cd799439001");

    expect(mockConnectMongoose).toHaveBeenCalled();
    expect(mockAggregatePipeline.group).toHaveBeenCalledWith(
      expect.objectContaining({
        clubId: { $first: "$clubId" },
      }),
    );
  });
});
