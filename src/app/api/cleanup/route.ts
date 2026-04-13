import { cleanupOrphanedRecords } from "@/functions/cleanupOrphanedRecords";
import { auth } from "@/lib/auth";
import { getAdminUserId } from "@/lib/runtimeConfig";
import { NextResponse } from "next/server";

export async function POST() {
  const adminUserId = getAdminUserId();

  if (!adminUserId) {
    return NextResponse.json(
      { success: false, error: "This endpoint is disabled" },
      { status: 503 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (session.user.id !== adminUserId) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  try {
    const result = await cleanupOrphanedRecords();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error cleaning up orphaned records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cleanup orphaned records" },
      { status: 500 },
    );
  }
}
