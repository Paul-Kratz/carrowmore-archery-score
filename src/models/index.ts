import { Types } from "mongoose";

export enum Mode {
  yellow = "yellow",
  red = "red",
}

type ObjectId = Types.ObjectId;

export interface IUser {
  _id: ObjectId;
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShoot {
  _id: ObjectId;
  id: string;
  mode: Mode;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  notes?: string | null;
}

export interface IShootParticipant {
  _id: ObjectId;
  id: string;
  shoot: ObjectId;
  user: ObjectId | IUser;
  joinedAt: Date;
}

export interface IRoundScore {
  _id: ObjectId;
  id: string;
  shoot: ObjectId;
  user: ObjectId;
  roundNumber: number;
  score?: number | null;
}
