import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import data from "../../../../../scripts/cleanedHistoricalData.json";
import { loadHistoricalData } from "@/functions/loadHistoricalData";

const disabled = true;
export const GET = async () => {
  const session = await auth();
  if (!session || !session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.id !== "695cc283b49cc001400b092d") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (disabled) {
    return NextResponse.json(
      { error: "This endpoint is disabled" },
      { status: 503 },
    );
  }

  try {
    const stats = await loadHistoricalData(data);
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error loading historical data", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
};
