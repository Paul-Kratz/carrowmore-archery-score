import { updateCompetitionAdminScore } from "@/functions/competition";
import { validRoundNumber, validScore } from "@/helpers";
import { isCompetitionRoundKey } from "@/helpers/competition";
import { isValidObjectId } from "@/helpers/isValidObjectId";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { competitionId } = await params;
    const { participantId, roundKey, stationNumber, score } =
      await request.json();

    if (!isValidObjectId(competitionId) || !isValidObjectId(participantId)) {
      return NextResponse.json(
        { error: "Invalid competitionId or participantId" },
        { status: 400 },
      );
    }

    if (!isCompetitionRoundKey(roundKey)) {
      return NextResponse.json({ error: "Invalid roundKey" }, { status: 400 });
    }

    if (!validRoundNumber(stationNumber) || !validScore(score)) {
      return NextResponse.json(
        { error: "Invalid stationNumber or score" },
        { status: 400 },
      );
    }

    const competition = await updateCompetitionAdminScore({
      competitionId,
      userId: session.user.id,
      participantId,
      roundKey,
      stationNumber,
      score,
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(competition, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (error instanceof Error && error.message === "Score not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Error updating competition score", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
