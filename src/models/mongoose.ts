import { Schema, model, models } from "mongoose";
import { IUser, IShoot, IShootParticipant, IRoundScore, Mode } from "./index";

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
      required: true,
      index: true,
    },
    joinedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: false }
);
ShootParticipantSchema.index({ shoot: 1, user: 1 }, { unique: true });

const RoundScoreSchema = new Schema<IRoundScore>(
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
      required: true,
      index: true,
    },
    roundNumber: { type: Number, required: true },
    score: { type: Number, required: false },
  },
  { timestamps: false }
);
RoundScoreSchema.index(
  { shoot: 1, user: 1, roundNumber: 1 },
  { unique: true },
);

export const User = models.User || model<IUser>("User", UserSchema);
export const Shoot = models.Shoot || model<IShoot>("Shoot", ShootSchema);
export const ShootParticipant =
  models.ShootParticipant ||
  model<IShootParticipant>("ShootParticipant", ShootParticipantSchema);
export const RoundScore =
  models.RoundScore || model<IRoundScore>("RoundScore", RoundScoreSchema);
