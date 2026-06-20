import { Schema, model, models } from "mongoose";
import { IUser } from "./index";

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
