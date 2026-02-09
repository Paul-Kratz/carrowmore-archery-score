import { cleanupOrphanedRecords } from "@/functions/cleanupOrphanedRecords";
import { NextResponse } from "next/server";

export async function POST() {
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
      { status: 500 }
    );
  }
}
