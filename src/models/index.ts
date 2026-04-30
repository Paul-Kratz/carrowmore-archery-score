import { Types } from "mongoose";

export enum Mode {
  yellow = "yellow",
  red = "red",
}

export enum CompetitionStatus {
  open = "open",
  finished = "finished",
}

export enum CompetitionRoundKey {
  morning = "morning",
  afternoon = "afternoon",
}

type ObjectId = Types.ObjectId;

export interface IUser {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  isGuest?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShoot {
  id: string;
  mode: Mode;
  createdBy: ObjectId | IUser | string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  notes?: string | null;
}

export interface IShootParticipant {
  id: string;
  shoot: ObjectId | IShoot;
  user?: ObjectId | IUser | null;
  guestName?: string | null;
  guestNameNormalized?: string | null;
  joinedAt: Date;
}

export interface IRoundScore {
  id: string;
  shoot: ObjectId | IShoot;
  participant?: ObjectId | IShootParticipant | null;
  user?: ObjectId | IUser | null;
  roundNumber: number;
  score?: number | null;
}
export interface IShootParticipantWithScores extends IShootParticipant {
  roundScores: (number | null)[];
  totalScore: number;
  userInfo: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    isGuest?: boolean;
  };
}

export interface IShootWithParticipants extends IShoot {
  participants: IShootParticipantWithScores[];
}

export interface IShootChartData {
  id: string;
  mode: Mode;
  createdAt: string;
  roundScores: (number | null)[];
  totalScore: number;
}

export interface ICompetition {
  id: string;
  title: string;
  date: Date;
  mode: Mode;
  createdBy: ObjectId | IUser | string;
  code: string;
  status: CompetitionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompetitionParticipant {
  id: string;
  competition: ObjectId | ICompetition;
  displayName: string;
  normalizedName: string;
  tokenHash: string;
  checkedInAt: Date;
}

export interface ICompetitionScore {
  id: string;
  competition: ObjectId | ICompetition;
  participant: ObjectId | ICompetitionParticipant;
  roundKey: CompetitionRoundKey;
  stationNumber: number;
  score?: number | null;
}

export interface ICompetitionParticipantWithScores
  extends ICompetitionParticipant {
  scores: Record<CompetitionRoundKey, (number | null)[]>;
  totals: Record<CompetitionRoundKey | "overall", number>;
  completed: Record<CompetitionRoundKey | "overall", number>;
}

export interface ICompetitionWithParticipants extends ICompetition {
  participants: ICompetitionParticipantWithScores[];
}
