import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { connectToDatabase } from "./db"

function createAuth(db: import("mongodb").Db, client: import("mongodb").MongoClient) {
  return betterAuth({
    database: mongodbAdapter(db, { client }),

    emailAndPassword: {
      enabled: true,
    },

    user: {
      additionalFields: {
        onboardingComplete: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
      },
    },

    plugins: [tanstackStartCookies()],
  })
}

type Auth = ReturnType<typeof createAuth>

let authInstance: Auth | null = null

export async function getAuth(): Promise<Auth> {
  if (authInstance) return authInstance

  const { db, client } = await connectToDatabase()
  authInstance = createAuth(db, client)

  return authInstance
}
