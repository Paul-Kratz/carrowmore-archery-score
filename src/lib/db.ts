import { MongoClient, ServerApiVersion } from "mongodb";
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  return uri;
};

const createMongoClient = () => new MongoClient(getMongoUri(), options);

let client: MongoClient | undefined;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };

  client = globalWithMongo._mongoClient;

  if (!client) {
    client = createMongoClient();
    globalWithMongo._mongoClient = client;
  }
} else {
  client = undefined;
}

export const getMongoDbClient = async () => {
  if (client) {
    return client;
  }

  client = createMongoClient();
  return client;
};

export default getMongoDbClient;
