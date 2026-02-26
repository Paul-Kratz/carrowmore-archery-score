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
  user: ObjectId | IUser;
  joinedAt: Date;
}

export interface IRoundScore {
  id: string;
  shoot: ObjectId | IShoot;
  user: ObjectId | IUser;
  roundNumber: number;
  score?: number | null;
}
export interface IShootParticipantWithScores extends IShootParticipant {
  roundScores: (number | null)[];
  totalScore: number;
  userInfo: {
    id: string;
    name?: string | null;
    email?: string | null;
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
