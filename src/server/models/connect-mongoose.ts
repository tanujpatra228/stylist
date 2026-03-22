import mongoose from "mongoose"

let isConnected = false

export async function connectMongoose() {
  if (isConnected) return

  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error("MONGO_URI environment variable is not set")
  }

  await mongoose.connect(uri)
  isConnected = true
}
