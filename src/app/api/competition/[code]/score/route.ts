import { updateCompetitionParticipantScore } from "@/functions/competition";
import { validRoundNumber, validScore } from "@/helpers";
import {
  getCompetitionParticipantCookieName,
  isCompetitionRoundKey,
} from "@/helpers/competition";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const { roundKey, stationNumber, score } = await request.json();

    if (!isCompetitionRoundKey(roundKey)) {
      return NextResponse.json({ error: "Invalid roundKey" }, { status: 400 });
    }

    if (!validRoundNumber(stationNumber) || !validScore(score)) {
      return NextResponse.json(
        { error: "Invalid stationNumber or score" },
        { status: 400 },
      );
    }

    const token = request.cookies.get(getCompetitionParticipantCookieName(code))
      ?.value;
    const participantSession = await updateCompetitionParticipantScore({
      code,
      token,
      roundKey,
      stationNumber,
      score,
    });

    if (!participantSession) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(participantSession, { status: 200 });
  } catch (error) {
    if (
      error instanceof Error &&
      [
        "Competition is not open",
        "Participant token is required",
        "Participant not found",
        "Score not found",
      ].includes(error.message)
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Error updating public competition score", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
