import { getParticipatedShoots } from "@/functions/getParticipatedShoots";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = await params;
  const shoots = await getParticipatedShoots(userId);

  return NextResponse.json(shoots, { status: 200 });
}
