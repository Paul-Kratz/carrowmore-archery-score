import { getCreatedShoots } from "@/functions/getCreatedShoots";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await auth();
  if (!session || !session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shoots = await getCreatedShoots(session.user.id as string);
    return NextResponse.json(shoots, { status: 200 });
  } catch (error) {
    console.error("Error fetching created shoots", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
};
