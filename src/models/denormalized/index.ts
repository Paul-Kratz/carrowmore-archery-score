import { Types } from "mongoose";

type ObjectId = Types.ObjectId;

export interface IDenormalizedScore {
  _id?: ObjectId;
  roundNumber: number;
  score: number | null;
  scoredAt?: Date | null;
}
export interface IDenormalizedParticipantUserInfo {
  id: string;
  email?: string | null;
  name?: string | null;
}
export interface IDenormalizedParticipant {
  _id?: ObjectId;
  id: string;
  user?: ObjectId | string | null | IDenormalizedParticipantUserInfo;
  guestName?: string | null;
  guestNameNormalized?: string | null;
  pegColor?: string | null;
  joinedAt: Date;
  scores: IDenormalizedScore[];
  totalScore: number;
  scoredCount: number;
}

export interface IShootDenormalized {
  _id?: ObjectId;
  id: string;
  schemaVersion: number;
  createdAt: Date;
  updatedAt: Date;
  firstScoredAt?: Date | null;
  completedAt?: Date | null;
  createdBy: ObjectId;
  clubId: string;
  totalStations: number;
  completed: boolean;
  notes?: string | null;
  participantCount: number;
  scoredCount: number;
  totalScoreSlots: number;
  participants: IDenormalizedParticipant[];
}
