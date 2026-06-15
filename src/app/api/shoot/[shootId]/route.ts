import { getShootWithAccess } from "@/functions/getShoot";
import { isValidObjectId } from "@/helpers/isValidObjectId";
import { formatResponse } from "@/helpers/formatResponse";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ shootId: string }> },
) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { shootId } = await params;

  if (!isValidObjectId(shootId)) {
    return NextResponse.json({ error: "Invalid shootId" }, { status: 400 });
  }

  try {
    const access = await getShootWithAccess({
      shootId,
      userId: session.user.id,
    });

    if (!access.exists) {
      return NextResponse.json({ error: "Shoot not found" }, { status: 404 });
    }

    if (!access.isCreator && !access.isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(formatResponse(access.shoot), { status: 200 });
  } catch (error) {
    console.error("Error fetching shoot", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
};
