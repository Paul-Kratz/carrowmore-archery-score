import { getParticipatedSessions } from "@/functions/getParticipatedSessions";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const authSession = await auth();
  if (!authSession?.user || !authSession?.user.id) return null;

  const sessions = await getParticipatedSessions(authSession.user.id);

  return NextResponse.json(sessions, { status: 200 });
}
