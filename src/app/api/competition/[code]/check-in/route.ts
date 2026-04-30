import { checkInCompetitionParticipant } from "@/functions/competition";
import {
  COMPETITION_PARTICIPANT_COOKIE_MAX_AGE,
  getCompetitionParticipantCookieName,
} from "@/helpers/competition";
import { NextRequest, NextResponse } from "next/server";

const CHECK_IN_VALIDATION_ERRORS = new Set([
  "Competition is not open",
  "Participant name is required",
  "Participant names must be 50 characters or fewer",
  "Participant name already checked in",
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const { displayName } = await request.json();

    if (typeof displayName !== "string") {
      return NextResponse.json(
        { error: "Participant name is required" },
        { status: 400 },
      );
    }

    const checkIn = await checkInCompetitionParticipant({
      code,
      displayName,
    });

    if (!checkIn) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 },
      );
    }

    const response = NextResponse.json(
      {
        competition: checkIn.competition,
        participant: checkIn.participant,
      },
      { status: 201 },
    );

    response.cookies.set(
      getCompetitionParticipantCookieName(code),
      checkIn.token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: COMPETITION_PARTICIPANT_COOKIE_MAX_AGE,
        path: "/",
      },
    );

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const isValidationError = CHECK_IN_VALIDATION_ERRORS.has(errorMessage);

    if (!isValidationError) {
      console.error("Error checking in competition participant", error);
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: isValidationError ? 400 : 500 },
    );
  }
}
