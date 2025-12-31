import { getParticipatedShoots } from "@/functions/getParticipatedShoots";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const authSession = await auth();
  if (!authSession?.user || !authSession?.user.id) return null;

  const shoots = await getParticipatedShoots(authSession.user.id);

  return NextResponse.json(shoots, { status: 200 });
}
