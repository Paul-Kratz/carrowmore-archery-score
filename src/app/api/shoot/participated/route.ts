import { getParticipatedShoots } from "@/functions/getParticipatedShoots";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET PARTICIPATED SHOOTS
export const GET = async () => {
  const session = await auth();
  if (!session || !session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shoots = await getParticipatedShoots(session.user.id as string);
    return NextResponse.json(shoots, { status: 200 });
  } catch (error) {
    console.error("Error fetching participated shoots", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
};
