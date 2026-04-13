import { createNewShoot } from "@/functions/createNewShoot";
import { deleteShoot } from "@/functions/deleteShoot";
import { getShootAccess } from "@/functions/getShootAccess";
import { isValidObjectId } from "@/helpers/isValidObjectId";
import { updateShoot } from "@/functions/updateShoot";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const VALID_MODES = new Set(["yellow", "red"]);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { mode, participantIds } = body;

    if (!mode || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "Missing required fields: mode, participantIds" },
        { status: 400 },
      );
    }

    if (
      typeof mode !== "string" ||
      !VALID_MODES.has(mode) ||
      !participantIds.every(
        (participantId) =>
          typeof participantId === "string" && isValidObjectId(participantId),
      )
    ) {
      return NextResponse.json(
        { error: "Invalid mode or participantIds" },
        { status: 400 },
      );
    }

    const shoot = await createNewShoot({
      userId: session.user.id,
      mode: mode as "yellow" | "red",
      participantIds,
    });

    return NextResponse.json(shoot, { status: 201 });
  } catch (error) {
    console.error("Error creating shoot:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
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

    await updateShoot({
      shootId,
      notes,
      completed,
    });

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

    await deleteShoot(shootId);

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
