import { getPublicCompetition } from "@/functions/competition";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const competition = await getPublicCompetition(code);

  if (!competition) {
    return NextResponse.json(
      { error: "Competition not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(competition, { status: 200 });
}
