import { updateRound } from "@/functions/updateRound";
import { validRoundNumber, validScore } from "@/helpers";
import { NextRequest, NextResponse } from "next/server";
import { getShoot } from "@/functions/getShoot";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, shootId, roundNumber, score } = body;

    if (!userId) {
      return NextResponse.json({ error: "User not valid" }, { status: 401 });
    }

    if (!validScore(score)) {
      return NextResponse.json(
        { error: "Invalid score value passed" },
        { status: 400 },
      );
    }

    if (!validRoundNumber(roundNumber)) {
      return NextResponse.json(
        { error: "Invalid roundNumber value passed" },
        { status: 400 },
      );
    }

    await updateRound(userId, shootId, roundNumber, score);

    const shoot = await getShoot({
      shootId,
    });

    return NextResponse.json(shoot, { status: 200 });
  } catch (error) {
    console.error("Error updating shoot:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
