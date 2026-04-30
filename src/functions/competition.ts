import { NUM_STATIONS } from "@/constants";
import {
  COMPETITION_ROUND_KEYS,
  createCompetitionCode,
  createParticipantToken,
  getCompletedStationCount,
  getEmptyCompetitionScores,
  getRoundTotal,
  hashParticipantToken,
  MAX_COMPETITION_TITLE_LENGTH,
} from "@/helpers/competition";
import { formatResponse, formatResponseArray } from "@/helpers/formatResponse";
import {
  MAX_GUEST_NAME_LENGTH,
  normalizeParticipantName,
} from "@/helpers/participantDisplay";
import { connectMongoose } from "@/lib/mongoose";
import {
  CompetitionRoundKey,
  CompetitionStatus,
  ICompetition,
  ICompetitionParticipant,
  ICompetitionScore,
  ICompetitionWithParticipants,
  Mode,
} from "@/models";
import {
  Competition,
  CompetitionParticipant,
  CompetitionScore,
} from "@/models/mongoose";
import mongoose, { Types } from "mongoose";

type CompetitionInput = {
  userId: string;
  title: string;
  date: string;
  mode: Mode;
};

type ScoreUpdateInput = {
  roundKey: CompetitionRoundKey;
  stationNumber: number;
  score: number | null;
};

const isDuplicateKeyError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 11000;

const validateCompetitionInput = ({ title, date }: Pick<CompetitionInput, "title" | "date">) => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw new Error("Competition title is required");
  }

  if (trimmedTitle.length > MAX_COMPETITION_TITLE_LENGTH) {
    throw new Error(
      `Competition title must be ${MAX_COMPETITION_TITLE_LENGTH} characters or fewer`,
    );
  }

  if (Number.isNaN(new Date(date).getTime())) {
    throw new Error("Competition date is invalid");
  }

  return {
    title: trimmedTitle,
    date: new Date(date),
  };
};

const buildCompetitionWithParticipants = ({
  competition,
  participants,
  scores,
}: {
  competition: unknown;
  participants: unknown[];
  scores: unknown[];
}) => {
  const competitionInfo = formatResponse<ICompetition>(competition);
  const scoreMap = new Map<string, Record<CompetitionRoundKey, (number | null)[]>>();

  participants.forEach((participant) => {
    const formatted = formatResponse<ICompetitionParticipant>(participant);
    scoreMap.set(formatted.id, getEmptyCompetitionScores());
  });

  formatResponseArray<ICompetitionScore>(scores).forEach((score) => {
    const participantId = score.participant.toString();
    const participantScores = scoreMap.get(participantId);

    if (!participantScores) {
      return;
    }

    participantScores[score.roundKey][score.stationNumber - 1] =
      score.score ?? null;
  });

  const participantsWithScores = participants.map((participant) => {
    const formatted = formatResponse<ICompetitionParticipant>(participant);
    const participantScores =
      scoreMap.get(formatted.id) ?? getEmptyCompetitionScores();
    const morningTotal = getRoundTotal(participantScores.morning);
    const afternoonTotal = getRoundTotal(participantScores.afternoon);
    const morningCompleted = getCompletedStationCount(participantScores.morning);
    const afternoonCompleted = getCompletedStationCount(
      participantScores.afternoon,
    );

    return {
      ...formatted,
      scores: participantScores,
      totals: {
        morning: morningTotal,
        afternoon: afternoonTotal,
        overall: morningTotal + afternoonTotal,
      },
      completed: {
        morning: morningCompleted,
        afternoon: afternoonCompleted,
        overall: morningCompleted + afternoonCompleted,
      },
    };
  });

  participantsWithScores.sort((a, b) => {
    if (b.totals.overall !== a.totals.overall) {
      return b.totals.overall - a.totals.overall;
    }

    return a.displayName.localeCompare(b.displayName);
  });

  return {
    ...competitionInfo,
    participants: participantsWithScores,
  } as ICompetitionWithParticipants;
};

export const getCompetitionsForAdmin = async (userId: string) => {
  await connectMongoose();
  const competitions = await Competition.find({ createdBy: userId })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  return formatResponseArray<ICompetition>(competitions);
};

export const createCompetition = async ({
  userId,
  title,
  date,
  mode,
}: CompetitionInput) => {
  await connectMongoose();
  const sanitized = validateCompetitionInput({ title, date });

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const competition = await Competition.create({
        ...sanitized,
        mode,
        createdBy: new Types.ObjectId(userId),
        code: createCompetitionCode(sanitized.title),
        status: CompetitionStatus.open,
      });

      return formatResponse<ICompetition>(competition);
    } catch (error) {
      if (!isDuplicateKeyError(error) || attempt === 4) {
        throw error;
      }
    }
  }

  throw new Error("Unable to create competition code");
};

export const getCompetitionDashboard = async ({
  competitionId,
  userId,
}: {
  competitionId: string;
  userId: string;
}) => {
  await connectMongoose();
  const competition = await Competition.findById(competitionId).lean();

  if (!competition) {
    return null;
  }

  if (competition.createdBy?.toString() !== userId) {
    throw new Error("Forbidden");
  }

  const [participants, scores] = await Promise.all([
    CompetitionParticipant.find({ competition: competition._id })
      .sort({ checkedInAt: 1 })
      .lean(),
    CompetitionScore.find({ competition: competition._id }).lean(),
  ]);

  return buildCompetitionWithParticipants({
    competition,
    participants,
    scores,
  });
};

export const setCompetitionStatus = async ({
  competitionId,
  userId,
  status,
}: {
  competitionId: string;
  userId: string;
  status: CompetitionStatus;
}) => {
  await connectMongoose();
  const competition = await Competition.findById(competitionId, {
    createdBy: 1,
  }).lean();

  if (!competition) {
    return null;
  }

  if (competition.createdBy?.toString() !== userId) {
    throw new Error("Forbidden");
  }

  await Competition.updateOne({ _id: competition._id }, { $set: { status } });

  return getCompetitionDashboard({ competitionId, userId });
};

export const getPublicCompetition = async (code: string) => {
  await connectMongoose();
  const competition = await Competition.findOne({ code }).lean();

  return competition ? formatResponse<ICompetition>(competition) : null;
};

export const checkInCompetitionParticipant = async ({
  code,
  displayName,
}: {
  code: string;
  displayName: string;
}) => {
  await connectMongoose();
  const competition = await Competition.findOne({ code }).lean();

  if (!competition) {
    return null;
  }

  if (competition.status !== CompetitionStatus.open) {
    throw new Error("Competition is not open");
  }

  const sanitizedDisplayName = displayName.trim();

  if (!sanitizedDisplayName) {
    throw new Error("Participant name is required");
  }

  if (sanitizedDisplayName.length > MAX_GUEST_NAME_LENGTH) {
    throw new Error(
      `Participant names must be ${MAX_GUEST_NAME_LENGTH} characters or fewer`,
    );
  }

  const token = createParticipantToken();
  const tokenHash = hashParticipantToken(token);
  const normalizedName = normalizeParticipantName(sanitizedDisplayName);
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [participant] = await CompetitionParticipant.create(
      [
        {
          competition: competition._id,
          displayName: sanitizedDisplayName,
          normalizedName,
          tokenHash,
          checkedInAt: new Date(),
        },
      ],
      { session },
    );

    await CompetitionScore.insertMany(
      COMPETITION_ROUND_KEYS.flatMap((roundKey) =>
        Array.from({ length: NUM_STATIONS }, (_, index) => ({
          competition: competition._id,
          participant: participant._id,
          roundKey,
          stationNumber: index + 1,
          score: null,
        })),
      ),
      { session },
    );

    await session.commitTransaction();

    return {
      token,
      participant: formatResponse<ICompetitionParticipant>(participant),
      competition: formatResponse<ICompetition>(competition),
    };
  } catch (error) {
    await session.abortTransaction();

    if (isDuplicateKeyError(error)) {
      throw new Error("Participant name already checked in");
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export const getCompetitionParticipantSession = async ({
  code,
  token,
}: {
  code: string;
  token?: string;
}) => {
  await connectMongoose();
  const competition = await Competition.findOne({ code }).lean();

  if (!competition) {
    return null;
  }

  if (!token) {
    return {
      competition: formatResponse<ICompetition>(competition),
      participant: null,
    };
  }

  const participant = await CompetitionParticipant.findOne({
    competition: competition._id,
    tokenHash: hashParticipantToken(token),
  }).lean();

  if (!participant) {
    return {
      competition: formatResponse<ICompetition>(competition),
      participant: null,
    };
  }

  const scores = await CompetitionScore.find({
    competition: competition._id,
    participant: participant._id,
  }).lean();

  const participantWithScores = buildCompetitionWithParticipants({
    competition,
    participants: [participant],
    scores,
  }).participants[0];

  return {
    competition: formatResponse<ICompetition>(competition),
    participant: participantWithScores,
  };
};

export const updateCompetitionParticipantScore = async ({
  code,
  token,
  roundKey,
  stationNumber,
  score,
}: {
  code: string;
  token?: string;
} & ScoreUpdateInput) => {
  await connectMongoose();
  const competition = await Competition.findOne({ code }).lean();

  if (!competition) {
    return null;
  }

  if (competition.status !== CompetitionStatus.open) {
    throw new Error("Competition is not open");
  }

  if (!token) {
    throw new Error("Participant token is required");
  }

  const participant = await CompetitionParticipant.findOne({
    competition: competition._id,
    tokenHash: hashParticipantToken(token),
  }).lean();

  if (!participant) {
    throw new Error("Participant not found");
  }

  const result = await CompetitionScore.updateOne(
    {
      competition: competition._id,
      participant: participant._id,
      roundKey,
      stationNumber,
    },
    { $set: { score } },
  );

  if (result.matchedCount === 0) {
    throw new Error("Score not found");
  }

  return getCompetitionParticipantSession({ code, token });
};

export const updateCompetitionAdminScore = async ({
  competitionId,
  userId,
  participantId,
  roundKey,
  stationNumber,
  score,
}: {
  competitionId: string;
  userId: string;
  participantId: string;
} & ScoreUpdateInput) => {
  await connectMongoose();
  const competition = await Competition.findById(competitionId, {
    createdBy: 1,
  }).lean();

  if (!competition) {
    return null;
  }

  if (competition.createdBy?.toString() !== userId) {
    throw new Error("Forbidden");
  }

  const result = await CompetitionScore.updateOne(
    {
      competition: competition._id,
      participant: new Types.ObjectId(participantId),
      roundKey,
      stationNumber,
    },
    { $set: { score } },
  );

  if (result.matchedCount === 0) {
    throw new Error("Score not found");
  }

  return getCompetitionDashboard({ competitionId, userId });
};

export const createCompetitionParticipantRestoreLink = async ({
  competitionId,
  userId,
  participantId,
  origin,
}: {
  competitionId: string;
  userId: string;
  participantId: string;
  origin: string;
}) => {
  await connectMongoose();
  const competition = await Competition.findById(competitionId, {
    code: 1,
    createdBy: 1,
  }).lean();

  if (!competition) {
    return null;
  }

  if (competition.createdBy?.toString() !== userId) {
    throw new Error("Forbidden");
  }

  const token = createParticipantToken();
  const result = await CompetitionParticipant.updateOne(
    {
      _id: new Types.ObjectId(participantId),
      competition: competition._id,
    },
    { $set: { tokenHash: hashParticipantToken(token) } },
  );

  if (result.matchedCount === 0) {
    throw new Error("Participant not found");
  }

  return `${origin}/competition/${competition.code}/claim/${token}`;
};

export const getCompetitionResults = async (code: string) => {
  await connectMongoose();
  const competition = await Competition.findOne({ code }).lean();

  if (!competition) {
    return null;
  }

  const [participants, scores] = await Promise.all([
    CompetitionParticipant.find({ competition: competition._id }).lean(),
    CompetitionScore.find({ competition: competition._id }).lean(),
  ]);

  return buildCompetitionWithParticipants({
    competition,
    participants,
    scores,
  });
};
