// eslint-disable-next-line @typescript-eslint/no-require-imports
const historicalData = require("./historicalData.json");

const nameMap = {
  Steph: "6985d26642c80108a14f5f42",
  Colin: "69885af8ff69fc0333f0d2c7",
  Paul: "695cc283b49cc001400b092d",
  Vero: "6988654ee9f4ea0955edffab",
  Veronika: "6988654ee9f4ea0955edffab",
};

const scoreTable = {
  KILL: { 1: 20, 2: 14, 3: 8 }, // KILL
  WOUND: { 1: 16, 2: 10, 3: 4 }, // WOUND
  MISS: { 1: 0, 2: 0, 3: 0 }, // MISS
};

const formatRoundScores = (rounds) => {
  const roundScores = rounds.map((round) => {
    const { band, hitZone } = round;
    const score = scoreTable[hitZone]?.[band] || 0;
    return score;
  });
  return roundScores;
};
const formatHistoricalData = (historicalData) => {
  return historicalData.map((shoot) => {
    const date = new Date(shoot.date);
    const createdBy = "695cc283b49cc001400b092d";

    const shootParticipants = shoot.participants.map((p) => {
      return {
        user: nameMap[p.name],
        joinedAt: date,
        roundScores: formatRoundScores(p.rounds),
      };
    });

    return {
      mode: shoot.mode,
      createdAt: date,
      createdBy,
      completed: true,
      participants: shootParticipants,
    };
  });
};

console.log(JSON.stringify(formatHistoricalData(historicalData)));
