import { createNewShoot } from "@/functions/createNewShoot";
import { deleteShoot } from "@/functions/deleteShoot";
import { isValidObjectId } from "@/helpers/isValidObjectId";
import {
  CREATE_SHOOT_VALIDATION_ERRORS,
  isShootParticipantInput,
} from "@/helpers/shootParticipantInput";
import { updateShoot } from "@/functions/updateShoot";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { CLUBS, getClubPegColors } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const body = await request.json();
    const { participantIds, guestNames = [], clubId, participants } = body;
    const club = typeof clubId === "string" ? CLUBS[clubId] : undefined;
    const allowedPegColors = getClubPegColors(club);
    const participantInputsProvided = Array.isArray(participants);

    if (
      !clubId ||
      (!participantInputsProvided &&
        (!Array.isArray(participantIds) || !Array.isArray(guestNames)))
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: participants or participantIds, guestNames, clubId",
        },
        { status: 400 },
      );
    }

    if (
      !club ||
      (participantInputsProvided &&
        !(participants as unknown[]).every((participant) =>
          isShootParticipantInput(participant, allowedPegColors),
        )) ||
      (!participantInputsProvided &&
        (!participantIds.every(
          (participantId: unknown) =>
            typeof participantId === "string" && isValidObjectId(participantId),
        ) ||
          !guestNames.every(
            (guestName: unknown) => typeof guestName === "string",
          )))
    ) {
      return NextResponse.json(
        {
          error: "Invalid participants, participantIds, guestNames, or clubId",
        },
        { status: 400 },
      );
    }

    const shoot = await createNewShoot({
      userId: currentUserId,
      participantIds: participantInputsProvided ? undefined : participantIds,
      guestNames: participantInputsProvided ? undefined : guestNames,
      participants: participantInputsProvided ? participants : undefined,
      clubId,
    });

    return NextResponse.json(shoot, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const isValidationError = CREATE_SHOOT_VALIDATION_ERRORS.has(errorMessage);

    if (!isValidationError) {
      console.error("Error creating shoot:", error);
    }

    return NextResponse.json(
      { error: errorMessage },
      {
        status: isValidationError ? 400 : 500,
      },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { shootId, notes, completed } = body;

    if (!shootId) {
      return NextResponse.json(
        { error: "Missing required field: shootId" },
        { status: 400 },
      );
    }

    if (typeof shootId !== "string" || !isValidObjectId(shootId)) {
      return NextResponse.json({ error: "Invalid shootId" }, { status: 400 });
    }

    const result = await updateShoot({
      shootId,
      userId: session.user.id,
      notes,
      completed,
    });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Shoot not found or forbidden" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Shoot updated successfully" },
      { status: 200 },
    );
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shootId = searchParams.get("shootId");

    if (!shootId) {
      return NextResponse.json(
        { error: "Missing required query parameter: shootId" },
        { status: 400 },
      );
    }

    if (!isValidObjectId(shootId)) {
      return NextResponse.json({ error: "Invalid shootId" }, { status: 400 });
    }

    const result = await deleteShoot({
      shootId,
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Shoot not found or forbidden" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Shoot deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting shoot:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
