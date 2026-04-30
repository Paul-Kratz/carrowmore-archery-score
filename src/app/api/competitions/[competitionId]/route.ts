import {
  getCompetitionDashboard,
  setCompetitionStatus,
} from "@/functions/competition";
import { isValidObjectId } from "@/helpers/isValidObjectId";
import { auth } from "@/lib/auth";
import { CompetitionStatus } from "@/models";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES = new Set(Object.values(CompetitionStatus));

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { competitionId } = await params;

    if (!isValidObjectId(competitionId)) {
      return NextResponse.json(
        { error: "Invalid competitionId" },
        { status: 400 },
      );
    }

    const competition = await getCompetitionDashboard({
      competitionId,
      userId: session.user.id,
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(competition, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.error("Error fetching competition", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { competitionId } = await params;
    const { status } = await request.json();

    if (!isValidObjectId(competitionId)) {
      return NextResponse.json(
        { error: "Invalid competitionId" },
        { status: 400 },
      );
    }

    if (typeof status !== "string" || !VALID_STATUSES.has(status as CompetitionStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const competition = await setCompetitionStatus({
      competitionId,
      userId: session.user.id,
      status: status as CompetitionStatus,
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(competition, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.error("Error updating competition", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
