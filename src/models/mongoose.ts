import { Schema, model, models } from "mongoose";
import { IUser } from "./index";

import {
  IDenormalizedParticipant,
  IDenormalizedScore,
  IShootDenormalized,
} from ".";

const ScoreSchema = new Schema<IDenormalizedScore>(
  {
    roundNumber: { type: Number, required: true },
    score: { type: Number, default: null },
    scoredAt: { type: Date, default: null },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

const DenormalizedParticipantSchema = new Schema<IDenormalizedParticipant>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    guestName: { type: String, default: null },
    guestNameNormalized: { type: String, default: null },
    pegColor: { type: String, default: null },
    joinedAt: { type: Date, required: true, default: () => new Date() },
    scores: { type: [ScoreSchema], required: true, default: [] },
    totalScore: { type: Number, required: true, default: 0 },
    scoredCount: { type: Number, required: true, default: 0 },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

DenormalizedParticipantSchema.pre("validate", function () {
  const hasUser = Boolean(this.user);
  const hasGuestName =
    typeof this.guestName === "string" && this.guestName.trim().length > 0;

  if (hasUser === hasGuestName) {
    throw new Error(
      "Participant must have either user or guestName, but not both.",
    );
  }
});

const DenormalizedShootSchema = new Schema<IShootDenormalized>(
  {
    schemaVersion: { type: Number, required: true, default: 1 },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    completed: { type: Boolean, required: true, default: false },
    completedAt: { type: Date, required: false, default: null },
    notes: { type: String, required: false, default: null },
    clubId: { type: String, required: true },
    totalStations: { type: Number, required: true },
    firstScoredAt: { type: Date, required: false, default: null },
    participantCount: { type: Number, required: true, default: 0 },
    scoredCount: { type: Number, required: true, default: 0 },
    totalScoreSlots: { type: Number, required: true, default: 0 },
    participants: {
      type: [DenormalizedParticipantSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

DenormalizedShootSchema.index({ createdBy: 1, createdAt: -1 });
DenormalizedShootSchema.index({ "participants.user": 1, createdAt: -1 });
DenormalizedShootSchema.index({
  "participants.guestNameNormalized": 1,
  createdAt: -1,
});
DenormalizedShootSchema.index({ completed: 1, createdAt: -1 });

export const ShootDenormalized =
  models.ShootDenormalized ||
  model<IShootDenormalized>(
    "ShootDenormalized",
    DenormalizedShootSchema,
    "shoots_denormalized",
  );

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: false },
    email: { type: String, required: false, unique: true, sparse: true },
    emailVerified: { type: Date, required: false },
    image: { type: String, required: false },
  },
  { timestamps: true },
);

export const User = models.User || model<IUser>("User", UserSchema);
