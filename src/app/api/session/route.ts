import { createNewSession } from "@/functions/createNewSession";
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

    const session = await createNewSession({
      userId,
      mode,
      participantIds,
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
