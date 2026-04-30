import { createCompetitionParticipantRestoreLink } from "@/functions/competition";
import { isValidObjectId } from "@/helpers/isValidObjectId";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ competitionId: string; participantId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { competitionId, participantId } = await params;

    if (!isValidObjectId(competitionId) || !isValidObjectId(participantId)) {
      return NextResponse.json(
        { error: "Invalid competitionId or participantId" },
        { status: 400 },
      );
    }

    const restoreLink = await createCompetitionParticipantRestoreLink({
      competitionId,
      userId: session.user.id,
      participantId,
      origin: request.nextUrl.origin,
    });

    if (!restoreLink) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ restoreLink }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (error instanceof Error && error.message === "Participant not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Error creating participant restore link", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
