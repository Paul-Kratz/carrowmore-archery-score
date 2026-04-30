import { NUM_STATIONS } from "@/constants";
import { CompetitionRoundKey, Mode } from "@/models";
import { createHash, randomBytes } from "crypto";

export const COMPETITION_ROUND_KEYS = [
  CompetitionRoundKey.morning,
  CompetitionRoundKey.afternoon,
] as const;

export const COMPETITION_PARTICIPANT_COOKIE_PREFIX =
  "competition_participant_";
export const COMPETITION_PARTICIPANT_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;
export const MAX_COMPETITION_TITLE_LENGTH = 80;

export const getCompetitionParticipantCookieName = (code: string) =>
  `${COMPETITION_PARTICIPANT_COOKIE_PREFIX}${code}`;

export const createCompetitionCode = (title: string) => {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return `${slug || "competition"}-${randomBytes(3).toString("hex")}`;
};

export const createParticipantToken = () => randomBytes(32).toString("base64url");

export const hashParticipantToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const isCompetitionRoundKey = (
  value: unknown,
): value is CompetitionRoundKey =>
  typeof value === "string" &&
  COMPETITION_ROUND_KEYS.includes(value as CompetitionRoundKey);

export const getEmptyCompetitionScores = () =>
  COMPETITION_ROUND_KEYS.reduce(
    (scores, roundKey) => ({
      ...scores,
      [roundKey]: Array<number | null>(NUM_STATIONS).fill(null),
    }),
    {} as Record<CompetitionRoundKey, (number | null)[]>,
  );

export const getCompetitionRoundLabel = (roundKey: CompetitionRoundKey) =>
  roundKey === CompetitionRoundKey.morning ? "Morning" : "Afternoon";

export const getCompetitionRoundMode = (roundKey: CompetitionRoundKey) =>
  roundKey === CompetitionRoundKey.morning ? Mode.yellow : Mode.red;

export const getCompetitionRoundTitle = (roundKey: CompetitionRoundKey) => {
  const mode = getCompetitionRoundMode(roundKey);

  return `${getCompetitionRoundLabel(roundKey)} (${mode})`;
};

export const getCompletedStationCount = (scores: (number | null)[]) =>
  scores.filter((score) => score !== null).length;

export const getRoundTotal = (scores: (number | null)[]) =>
  scores.reduce<number>((total, score) => total + (score ?? 0), 0);
