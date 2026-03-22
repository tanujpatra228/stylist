import { Db, MongoClient } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase() {
  if (cachedDb && cachedClient) {
    return { db: cachedDb, client: cachedClient }
  }

  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error("MONGO_URI environment variable is not set")
  }

  const client = new MongoClient(uri)
  await client.connect()

  cachedClient = client
  cachedDb = client.db()

  return { db: cachedDb, client: cachedClient }
}

export { connectToDatabase }
