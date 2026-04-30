import { Schema, model, models } from "mongoose";
import {
  CompetitionRoundKey,
  CompetitionStatus,
  ICompetition,
  ICompetitionParticipant,
  ICompetitionScore,
  IRoundScore,
  IShoot,
  IShootParticipant,
  IUser,
  Mode,
} from "./index";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: false },
    email: { type: String, required: false, unique: true, sparse: true },
    emailVerified: { type: Date, required: false },
    image: { type: String, required: false },
  },
  { timestamps: true }
);

const ShootSchema = new Schema<IShoot>(
  {
    mode: { type: String, enum: Object.values(Mode), required: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    completed: { type: Boolean, required: true, default: false },
    notes: { type: String, required: false },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Virtual for roundScores
ShootSchema.virtual("roundScores", {
  ref: "RoundScore",
  localField: "_id",
  foreignField: "shoot",
  justOne: false,
});

const ShootParticipantSchema = new Schema<IShootParticipant>(
  {
    shoot: {
      type: Schema.Types.ObjectId,
      ref: "Shoot",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    guestName: { type: String, required: false },
    guestNameNormalized: { type: String, required: false, index: true },
    joinedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: false }
);
ShootParticipantSchema.index(
  { shoot: 1, user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: "objectId" } } },
);
ShootParticipantSchema.index(
  { shoot: 1, guestNameNormalized: 1 },
  {
    unique: true,
    partialFilterExpression: { guestNameNormalized: { $type: "string" } },
  },
);

const RoundScoreSchema = new Schema<IRoundScore>(
  {
    shoot: {
      type: Schema.Types.ObjectId,
      ref: "Shoot",
      required: true,
      index: true,
    },
    participant: {
      type: Schema.Types.ObjectId,
      ref: "ShootParticipant",
      required: false,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    roundNumber: { type: Number, required: true },
    score: { type: Number, required: false },
  },
  { timestamps: false }
);

const CompetitionSchema = new Schema<ICompetition>(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    mode: { type: String, enum: Object.values(Mode), required: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    code: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: Object.values(CompetitionStatus),
      required: true,
      default: CompetitionStatus.open,
      index: true,
    },
  },
  { timestamps: true },
);

const CompetitionParticipantSchema = new Schema<ICompetitionParticipant>(
  {
    competition: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
      index: true,
    },
    displayName: { type: String, required: true },
    normalizedName: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    checkedInAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: false },
);
CompetitionParticipantSchema.index(
  { competition: 1, normalizedName: 1 },
  { unique: true },
);
CompetitionParticipantSchema.index(
  { competition: 1, tokenHash: 1 },
  { unique: true },
);

const CompetitionScoreSchema = new Schema<ICompetitionScore>(
  {
    competition: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
      index: true,
    },
    participant: {
      type: Schema.Types.ObjectId,
      ref: "CompetitionParticipant",
      required: true,
      index: true,
    },
    roundKey: {
      type: String,
      enum: Object.values(CompetitionRoundKey),
      required: true,
      index: true,
    },
    stationNumber: { type: Number, required: true },
    score: { type: Number, required: false },
  },
  { timestamps: false },
);
CompetitionScoreSchema.index(
  { competition: 1, participant: 1, roundKey: 1, stationNumber: 1 },
  { unique: true },
);
RoundScoreSchema.index(
  { shoot: 1, user: 1, roundNumber: 1 },
  { unique: true, partialFilterExpression: { user: { $type: "objectId" } } },
);
RoundScoreSchema.index(
  { shoot: 1, participant: 1, roundNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { participant: { $type: "objectId" } },
  },
);

export const User = models.User || model<IUser>("User", UserSchema);
export const Shoot = models.Shoot || model<IShoot>("Shoot", ShootSchema);
export const ShootParticipant =
  models.ShootParticipant ||
  model<IShootParticipant>("ShootParticipant", ShootParticipantSchema);
export const RoundScore =
  models.RoundScore || model<IRoundScore>("RoundScore", RoundScoreSchema);
export const Competition =
  models.Competition || model<ICompetition>("Competition", CompetitionSchema);
export const CompetitionParticipant =
  models.CompetitionParticipant ||
  model<ICompetitionParticipant>(
    "CompetitionParticipant",
    CompetitionParticipantSchema,
  );
export const CompetitionScore =
  models.CompetitionScore ||
  model<ICompetitionScore>("CompetitionScore", CompetitionScoreSchema);
