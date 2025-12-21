import { getUsers } from "@/functions/getUsers";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const GET = auth(async function GET(req) {
  if (req.auth) {
    const users = await getUsers();

    return NextResponse.json(users, { status: 200 });
  }
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
});
