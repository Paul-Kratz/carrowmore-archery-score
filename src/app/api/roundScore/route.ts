import { updateRound } from "@/functions/updateRound";
import { isValidObjectId } from "@/helpers/isValidObjectId";
import { NextRequest, NextResponse } from "next/server";
import { getShoot } from "@/functions/getShoot";
import { getShootAccess } from "@/functions/getShootAccess";
import { auth } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { participantId, shootId, roundNumber, score } = body;

    if (!participantId || !shootId) {
      return NextResponse.json(
        { error: "Missing required fields: participantId, shootId" },
        { status: 400 },
      );
    }

    if (!isValidObjectId(participantId) || !isValidObjectId(shootId)) {
      return NextResponse.json(
        { error: "Invalid participantId or shootId" },
        { status: 400 },
      );
    }

    const access = await getShootAccess({
      shootId,
      userId: session.user.id,
    });

    if (!access.exists) {
      return NextResponse.json({ error: "Shoot not found" }, { status: 404 });
    }

    if (!access.isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await updateRound(
      participantId,
      shootId,
      roundNumber,
      score,
    );

    if (result && "matchedCount" in result && result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Round score not found" },
        { status: 404 },
      );
    }

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
