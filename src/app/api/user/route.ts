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

  const users = await User.find({}, { name: 1 }).lean();

  return NextResponse.json(formatResponse<IUser>(users), { status: 200 });
};

export const POST = async (request: Request) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectMongoose();

  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const updatedUser = await User.findByIdAndUpdate(
    session.user.id,
    { name },
    { new: true, fields: { name: 1 } },
  ).lean();

  return NextResponse.json(formatResponse<IUser>(updatedUser), { status: 200 });
};
