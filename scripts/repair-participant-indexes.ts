import path from "node:path";
import { config as loadEnv } from "dotenv";
import { connectMongoose } from "../src/lib/mongoose";
import { RoundScore, ShootParticipant } from "../src/models/mongoose";

loadEnv({ path: path.resolve(process.cwd(), ".env.local"), override: false });
loadEnv({ path: path.resolve(process.cwd(), ".env"), override: false });

async function ensureIndex(
  collection: {
    collectionName: string;
    dropIndex: (name: string) => Promise<unknown>;
    createIndex: (
      key: Record<string, 1 | -1>,
      options: Record<string, unknown>,
    ) => Promise<string>;
  },
  indexName: string,
  key: Record<string, 1 | -1>,
  options: Record<string, unknown>,
) {
  try {
    await collection.dropIndex(indexName);
    console.log(`Dropped ${collection.collectionName}.${indexName}`);
  } catch (error) {
    const codeName =
      error && typeof error === "object" && "codeName" in error
        ? String(error.codeName)
        : null;

    if (codeName !== "IndexNotFound") {
      throw error;
    }
  }

  const createdName = await collection.createIndex(key, options);
  console.log(`Created ${collection.collectionName}.${createdName}`);
}

async function main() {
  await connectMongoose();

  await ensureIndex(
    ShootParticipant.collection,
    "shoot_1_user_1",
    { shoot: 1, user: 1 },
    {
      unique: true,
      name: "shoot_1_user_1",
      partialFilterExpression: { user: { $type: "objectId" } },
    },
  );

  await ensureIndex(
    ShootParticipant.collection,
    "shoot_1_guestNameNormalized_1",
    { shoot: 1, guestNameNormalized: 1 },
    {
      unique: true,
      name: "shoot_1_guestNameNormalized_1",
      partialFilterExpression: { guestNameNormalized: { $type: "string" } },
    },
  );

  await ensureIndex(
    RoundScore.collection,
    "shoot_1_user_1_roundNumber_1",
    { shoot: 1, user: 1, roundNumber: 1 },
    {
      unique: true,
      name: "shoot_1_user_1_roundNumber_1",
      partialFilterExpression: { user: { $type: "objectId" } },
    },
  );

  await ensureIndex(
    RoundScore.collection,
    "shoot_1_participant_1_roundNumber_1",
    { shoot: 1, participant: 1, roundNumber: 1 },
    {
      unique: true,
      name: "shoot_1_participant_1_roundNumber_1",
      partialFilterExpression: { participant: { $type: "objectId" } },
    },
  );
}

main()
  .then(() => {
    console.log("Participant indexes repaired");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to repair participant indexes:", error);
    process.exit(1);
  });
