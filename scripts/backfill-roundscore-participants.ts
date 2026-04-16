import path from "node:path";
import { config as loadEnv } from "dotenv";
import { backfillRoundScoreParticipants } from "../src/functions/backfillRoundScoreParticipants";

loadEnv({ path: path.resolve(process.cwd(), ".env.local"), override: false });
loadEnv({ path: path.resolve(process.cwd(), ".env"), override: false });

async function main() {
  console.log("Backfilling round score participant references...");
  const result = await backfillRoundScoreParticipants();
  console.log(`Scanned ${result.scanned} round scores`);
  console.log(`Updated ${result.updated} round scores`);
  console.log(`Unresolved ${result.unresolved} round scores`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  });
