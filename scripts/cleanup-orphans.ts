/**
 * Script to clean up orphaned database records
 * Run with: ts-node scripts/cleanup-orphans.ts
 * Or call the API endpoint: POST /api/cleanup
 */

import { cleanupOrphanedRecords } from "../src/functions/cleanupOrphanedRecords";

async function main() {
  console.log("Starting cleanup of orphaned records...");
  const result = await cleanupOrphanedRecords();
  console.log(
    `✓ Deleted ${result.deletedShootsWithMissingCreators} shoots with missing creators`,
  );
  console.log(`✓ Deleted ${result.deletedRoundScores} orphaned round scores`);
  console.log(
    `✓ Deleted ${result.deletedParticipants} orphaned shoot participants`,
  );
  console.log("Cleanup complete!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Error during cleanup:", error);
  process.exit(1);
});
