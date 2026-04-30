import { getCompetitionParticipantSession } from "@/functions/competition";
import { getCompetitionParticipantCookieName } from "@/helpers/competition";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const token = request.cookies.get(getCompetitionParticipantCookieName(code))
    ?.value;
  const participantSession = await getCompetitionParticipantSession({
    code,
    token,
  });

  if (!participantSession) {
    return NextResponse.json(
      { error: "Competition not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(participantSession, { status: 200 });
}
