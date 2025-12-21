import { updateRound } from "@/functions/updateRound";
import { validRoundNumber, validScore } from "@/helpers";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/functions/getSession";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, roundNumber, score } = body;

    if (!userId) {
      return NextResponse.json({ error: "User not valid" }, { status: 401 });
    }

    if (!sessionId || !roundNumber || !score) {
      return NextResponse.json(
        { error: "Missing required field: sessionId, roundNumber or score" },
        { status: 400 }
      );
    }

    if (!validScore(score)) {
      return NextResponse.json(
        { error: "Invalid score value passed" },
        { status: 400 }
      );
    }

    if (!validRoundNumber(roundNumber)) {
      return NextResponse.json(
        { error: "Invalid roundNumber value passed" },
        { status: 400 }
      );
    }

    const session = await getSession({
      sessionId,
      includeParticipants: true,
    });

    if (!session?.participants.find((p) => p.userId === userId)) {
      return NextResponse.json(
        { error: "You are not a part of this session" },
        { status: 400 }
      );
    }

    const round = await updateRound(userId, sessionId, roundNumber, score);

    return NextResponse.json(round, { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
