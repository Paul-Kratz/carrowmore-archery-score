import { Types } from "mongoose";

type ObjectId = Types.ObjectId;

export interface IDenormalizedScore {
  _id?: ObjectId;
  roundNumber: number;
  score: number | null;
  scoredAt?: Date | null;
}

export interface IDenormalizedParticipant {
  _id?: ObjectId;
  userId?: ObjectId | null;
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
