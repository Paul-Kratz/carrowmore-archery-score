import { getParticipatedSessions } from "@/functions/getParticipatedSessions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = await params;
  const sessions = await getParticipatedSessions(userId);

  return NextResponse.json(sessions, { status: 200 });
}
