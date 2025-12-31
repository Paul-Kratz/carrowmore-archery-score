import { createNewShoot } from "@/functions/createNewShoot";
import { updateShoot } from "@/functions/updateShoot";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, mode, participantIds } = body;

    if (!userId || !mode || !participantIds) {
      return NextResponse.json(
        { error: "Missing required fields: userId, mode, participantIds" },
        { status: 400 }
      );
    }

    const shoot = await createNewShoot({
      userId,
      mode,
      participantIds,
    });

    return NextResponse.json(shoot, { status: 201 });
  } catch (error) {
    console.error("Error creating shoot:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { shootId, notes, completed } = body;

    if (!shootId) {
      return NextResponse.json(
        { error: "Missing required field: shootId" },
        { status: 400 }
      );
    }

    const shoot = await updateShoot({
      shootId,
      notes,
      completed,
    });

    return NextResponse.json(shoot, { status: 200 });
  } catch (error) {
    console.error("Error updating shoot:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
