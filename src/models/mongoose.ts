import mongoose, { Schema, Types, model, models } from "mongoose";
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
  { timestamps: true }
);

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

export const User = models.User || model<IUser>("User", UserSchema);
export const Shoot = models.Shoot || model<IShoot>("Shoot", ShootSchema);
export const ShootParticipant =
  models.ShootParticipant ||
  model<IShootParticipant>("ShootParticipant", ShootParticipantSchema);
export const RoundScore =
  models.RoundScore || model<IRoundScore>("RoundScore", RoundScoreSchema);

// When a Shoot is deleted => delete participants + roundScores
ShootSchema.pre(
  "deleteOne",
  { document: false, query: true },
  async function () {
    const filter = this.getFilter();
    const shootId = filter._id as Types.ObjectId | undefined;
    if (!shootId) return;

    const ShootParticipant =
      mongoose.model<IShootParticipant>("ShootParticipant");
    const RoundScore = mongoose.model<IRoundScore>("RoundScore");

    await Promise.all([
      ShootParticipant.deleteMany({ shootId }),
      RoundScore.deleteMany({ shootId }),
    ]);
  }
);
