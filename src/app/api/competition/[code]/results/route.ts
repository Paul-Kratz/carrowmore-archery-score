import { getCompetitionResults } from "@/functions/competition";
import { CompetitionStatus } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const results = await getCompetitionResults(code);

  if (!results) {
    return NextResponse.json(
      { error: "Competition not found" },
      { status: 404 },
    );
  }

  if (results.status !== CompetitionStatus.finished) {
    return NextResponse.json(
      { error: "Results are not available yet" },
      { status: 403 },
    );
  }

  return NextResponse.json(results, { status: 200 });
}
