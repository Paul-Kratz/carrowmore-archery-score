import { getShootSummary } from "@/functions/getShootSummary";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ shootId: string }> },
) => {
  const session = await auth();
  if (!session || !session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { shootId } = await params;

  try {
    const shoots = await getShootSummary({ shootId, userId: session.user.id });
    return NextResponse.json(shoots, { status: 200 });
  } catch (error) {
    console.error("Error fetching shoot summary", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
};
