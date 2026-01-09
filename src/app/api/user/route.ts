import { formatResponse } from "@/helpers/formatResponse";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import { IUser } from "@/models";
import { User } from "@/models/mongoose";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectMongoose();

  const users = await User.find({}, { email: 1, name: 1 }).lean();

  return NextResponse.json(formatResponse<IUser>(users), { status: 200 });
};
