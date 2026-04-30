import {
  createCompetition,
  getCompetitionsForAdmin,
} from "@/functions/competition";
import { auth } from "@/lib/auth";
import { Mode } from "@/models";
import { NextRequest, NextResponse } from "next/server";

const VALID_MODES = new Set(Object.values(Mode));
const CREATE_COMPETITION_VALIDATION_ERRORS = new Set([
  "Competition title is required",
  "Competition title must be 80 characters or fewer",
  "Competition date is invalid",
]);

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const competitions = await getCompetitionsForAdmin(session.user.id);

  return NextResponse.json(competitions, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, date, mode = Mode.yellow } = await request.json();

    if (typeof title !== "string" || typeof date !== "string") {
      return NextResponse.json(
        { error: "Invalid title or date" },
        { status: 400 },
      );
    }

    if (typeof mode !== "string" || !VALID_MODES.has(mode as Mode)) {
      return NextResponse.json(
        { error: "Invalid mode" },
        { status: 400 },
      );
    }

    const competition = await createCompetition({
      userId: session.user.id,
      title,
      date,
      mode: mode as Mode,
    });

    return NextResponse.json(competition, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const isValidationError =
      CREATE_COMPETITION_VALIDATION_ERRORS.has(errorMessage);

    if (!isValidationError) {
      console.error("Error creating competition", error);
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: isValidationError ? 400 : 500 },
    );
  }
}
