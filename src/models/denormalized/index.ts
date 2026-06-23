import { CLUBS } from "@/constants";
import type { Types } from "mongoose";
import type { ClubData } from "..";

type ObjectId = Types.ObjectId;
type DateLike = Date | string | null | undefined;

const toDate = (value: DateLike): Date => {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value ?? Date.now());
};

const toNullableDate = (value: DateLike): Date | null => {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
};

const objectIdToString = (value: ObjectId | string | undefined): string => {
  if (!value) {
    return "";
  }

  return typeof value === "string" ? value : value.toString();
};

export interface IDenormalizedScore {
  _id?: ObjectId;
  id?: string;
  roundNumber: number;
  score: number | null;
  scoredAt?: DateLike;
}

export interface IDenormalizedParticipantUserInfo {
  _id?: ObjectId | string;
  id?: string;
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
  joinedAt: DateLike;
  scores: IDenormalizedScore[];
  totalScore: number;
  scoredCount: number;
}

export interface IShootDenormalized {
  _id?: ObjectId;
  id: string;
  schemaVersion: number;
  createdAt: DateLike;
  updatedAt: DateLike;
  firstScoredAt?: DateLike;
  completedAt?: DateLike;
  createdBy: ObjectId | string;
  clubId: string;
  totalStations: number;
  completed: boolean;
  notes?: string | null;
  participantCount: number;
  scoredCount: number;
  totalScoreSlots: number;
  participants: IDenormalizedParticipant[];
}

export class ShootScore {
  id: string;
  roundNumber: number;
  score: number | null;
  scoredAt: Date | null;

  constructor(scoreData: IDenormalizedScore) {
    this.id = scoreData.id ?? scoreData._id?.toString() ?? "";
    this.roundNumber = scoreData.roundNumber;
    this.score = scoreData.score;
    this.scoredAt = toNullableDate(scoreData.scoredAt);
  }

  get isScored() {
    return this.score !== null;
  }
}

export class ShootParticipant {
  id: string;
  user?: ObjectId | string | null | IDenormalizedParticipantUserInfo;
  guestName?: string | null;
  guestNameNormalized?: string | null;
  pegColor?: string | null;
  joinedAt: Date;
  scores: ShootScore[];
  totalScore: number;
  scoredCount: number;
  isCurrentUser: boolean;

  constructor(participantData: IDenormalizedParticipant, currentUserId: string) {
    this.id = participantData.id ?? participantData._id?.toString() ?? "";
    this.user = participantData.user;
    this.guestName = participantData.guestName;
    this.guestNameNormalized = participantData.guestNameNormalized;
    this.pegColor = participantData.pegColor;
    this.joinedAt = toDate(participantData.joinedAt);
    this.scores = participantData.scores.map((score) => new ShootScore(score));
    this.totalScore = participantData.totalScore;
    this.scoredCount = participantData.scoredCount;
    this.isCurrentUser = this.userId === currentUserId && !this.isGuest;
  }

  get isGuest() {
    return Boolean(this.guestName?.trim());
  }

  get userId() {
    if (typeof this.user === "string") {
      return this.user;
    }

    if (
      this.user &&
      typeof this.user === "object" &&
      ("name" in this.user || "email" in this.user || "id" in this.user)
    ) {
      return this.user.id ?? this.user._id?.toString() ?? null;
    }

    return this.user ? this.user.toString() : null;
  }

  get displayName() {
    const guestName = this.guestName?.trim();

    if (guestName) {
      return guestName;
    }

    if (
      this.user &&
      typeof this.user === "object" &&
      ("name" in this.user || "email" in this.user)
    ) {
      const name = this.user.name?.trim();

      if (name) {
        return name;
      }

      return (
        this.user.email?.trim() ||
        (this.isCurrentUser ? "You" : "Unnamed archer")
      );
    }

    return this.isCurrentUser ? "You" : "Unnamed archer";
  }

  get completedStationCount() {
    return this.scores.filter((score) => score.isScored).length;
  }

  get averageScore() {
    return this.completedStationCount === 0
      ? 0
      : this.totalScore / this.completedStationCount;
  }

  getScoreForStation(station: number) {
    return (
      this.scores.find((score) => score.roundNumber === station)?.score ?? null
    );
  }

  hasScoreForStation(station: number) {
    return this.getScoreForStation(station) !== null;
  }

  getScoreCounts(possibleScores: number[]) {
    const counts = new Map<number, number>();

    possibleScores.forEach((score) => counts.set(score, 0));
    this.scores.forEach(({ score }) => {
      if (score !== null && counts.has(score)) {
        counts.set(score, counts.get(score)! + 1);
      }
    });

    return counts;
  }

  getParticipantLabel() {
    if (this.isCurrentUser && !this.isGuest) {
      return `${this.displayName} (you)`;
    }

    return this.displayName;
  }
}

export class Shoot {
  id: string;
  schemaVersion: number;
  createdAt: Date;
  updatedAt: Date;
  firstScoredAt: Date | null;
  completedAt: Date | null;
  createdBy: string;
  clubId: string;
  clubData?: ClubData;
  totalStations: number;
  completed: boolean;
  notes?: string | null;
  participantCount: number;
  scoredCount: number;
  totalScoreSlots: number;
  participants: ShootParticipant[];

  constructor(shootData: IShootDenormalized, currentUserId: string) {
    this.id = shootData.id ?? shootData._id?.toString() ?? "";
    this.schemaVersion = shootData.schemaVersion;
    this.createdAt = toDate(shootData.createdAt);
    this.updatedAt = toDate(shootData.updatedAt);
    this.firstScoredAt = toNullableDate(shootData.firstScoredAt);
    this.completedAt = toNullableDate(shootData.completedAt);
    this.createdBy = objectIdToString(shootData.createdBy);
    this.clubId = shootData.clubId;
    this.clubData = CLUBS[shootData.clubId];
    this.totalStations = shootData.totalStations;
    this.completed = Boolean(shootData.completed);
    this.notes = shootData.notes;
    this.participantCount = shootData.participantCount;
    this.scoredCount = shootData.scoredCount;
    this.totalScoreSlots = shootData.totalScoreSlots;
    this.participants = shootData.participants.map(
      (participant) => new ShootParticipant(participant, currentUserId),
    );
  }

  static from(shootData: IShootDenormalized, currentUserId: string) {
    return new Shoot(shootData, currentUserId);
  }

  get remainingScoreCount() {
    return this.totalScoreSlots - this.scoredCount;
  }

  get guestCount() {
    return this.participants.filter((participant) => participant.isGuest).length;
  }

  get completedStationCount() {
    if (this.participants.length === 0) {
      return 0;
    }

    return Array.from({ length: this.totalStations }, (_, stationIndex) =>
      this.participants.every(
        (participant) => participant.hasScoreForStation(stationIndex + 1),
      ),
    ).filter(Boolean).length;
  }

  get completionPercent() {
    return this.totalScoreSlots === 0
      ? 0
      : Math.round((this.scoredCount / this.totalScoreSlots) * 100);
  }

  get currentUserParticipant() {
    return (
      this.participants.find((participant) => participant.isCurrentUser) ?? null
    );
  }

  get topScorer() {
    return (
      [...this.participants].sort(
        (participantA, participantB) =>
          participantB.totalScore - participantA.totalScore,
      )[0] ?? null
    );
  }

  get topScore() {
    return this.topScorer?.totalScore ?? 0;
  }

  get stationCompletionCounts() {
    return Array.from({ length: this.totalStations }, (_, index) =>
      this.getStationCompletionCount(index + 1),
    );
  }

  get firstParticipant() {
    return this.participants[0] ?? null;
  }

  getParticipantById(participantId: string | null) {
    if (!participantId) {
      return null;
    }

    return (
      this.participants.find((participant) => participant.id === participantId) ??
      null
    );
  }

  isCreatedBy(userId: string) {
    return this.createdBy === userId;
  }

  getStationCompletionCount(station: number) {
    return this.participants.filter(
      (participant) => participant.hasScoreForStation(station),
    ).length;
  }

  getNextUnscoredParticipant(participantId: string, station: number) {
    const participantIndex = this.participants.findIndex(
      (participant) => participant.id === participantId,
    );

    if (participantIndex === -1 || this.participants.length < 2) {
      return null;
    }

    return (
      Array.from({ length: this.participants.length - 1 }, (_, offset) => {
        const nextIndex = (participantIndex + offset + 1) % this.participants.length;
        return this.participants[nextIndex];
      }).find((participant) => !participant.hasScoreForStation(station)) ?? null
    );
  }
}

export { ShootScore as Score };
