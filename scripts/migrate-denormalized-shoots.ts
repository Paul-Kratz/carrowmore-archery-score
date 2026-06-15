import path from "node:path";
import { config as loadEnv } from "dotenv";
import { denormalizeShoots } from "../src/functions/denormalizeShoots";

loadEnv({ path: path.resolve(process.cwd(), ".env.local"), override: false });
loadEnv({ path: path.resolve(process.cwd(), ".env"), override: false });

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log(
    dryRun
      ? "Checking denormalized shoot migration..."
      : "Migrating shoots to denormalized records...",
  );
  const result = await denormalizeShoots({ dryRun });
  console.log(`✓ Found ${result.totalShoots} source shoots`);
  console.log(`✓ Prepared ${result.migratedShoots} denormalized shoots`);
  console.log(`✓ Matched ${result.matchedShoots} existing denormalized shoots`);
  console.log(`✓ Modified ${result.modifiedShoots} denormalized shoots`);
  console.log(`✓ Upserted ${result.upsertedShoots} denormalized shoots`);
  console.log(
    dryRun
      ? "Denormalized migration check complete."
      : "Denormalized migration complete.",
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("Denormalized migration failed:", error);
  process.exit(1);
});
