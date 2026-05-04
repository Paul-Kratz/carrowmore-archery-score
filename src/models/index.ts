import { Types } from "mongoose";

export enum Mode {
  yellow = "yellow",
  red = "red",
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
  firstScoredAt?: Date | string | null;
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
  scoredAt?: Date | null;
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
