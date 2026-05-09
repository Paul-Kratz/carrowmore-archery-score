import path from "node:path";
import { config as loadEnv } from "dotenv";
import { backfillShootClubIds } from "../src/functions/backfillShootClubIds";

loadEnv({ path: path.resolve(process.cwd(), ".env.local"), override: false });
loadEnv({ path: path.resolve(process.cwd(), ".env"), override: false });

async function main() {
  console.log("Backfilling missing shoot club ids...");
  const result = await backfillShootClubIds("carrowmore");
  console.log(`Matched ${result.matched} shoots`);
  console.log(`Updated ${result.modified} shoots`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  });
