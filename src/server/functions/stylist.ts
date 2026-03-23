import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { getAuth } from "../auth"
import * as stylistService from "../services/stylist.service"
import type { SessionType } from "../ai/types"

async function getAuthenticatedSession() {
  const auth = await getAuth()
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({
    headers: headers as unknown as Headers,
  })
  if (!session) throw new Error("Unauthorized")
  return { auth, session }
}

async function getAuthenticatedUserId(): Promise<string> {
  const { session } = await getAuthenticatedSession()
  return session.user.id
}

export const startStylistSession = createServerFn({ method: "POST" })
  .inputValidator((d: { type: SessionType }) => d)
  .handler(async ({ data }) => {
    const userId = await getAuthenticatedUserId()
    return stylistService.startSession(userId, data.type)
  })

export const sendStylistMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { sessionId: string; message: string }) => d)
  .handler(async ({ data }) => {
    await getAuthenticatedUserId()
    return stylistService.respondToStylist(data.sessionId, data.message)
  })

export const resumeStylistSession = createServerFn({ method: "GET" })
  .inputValidator((d: { sessionId: string }) => d)
  .handler(async ({ data }) => {
    await getAuthenticatedUserId()
    return stylistService.resumeSession(data.sessionId)
  })

export const completeOnboarding = createServerFn({ method: "POST" }).handler(
  async () => {
    const userId = await getAuthenticatedUserId()
    const { ObjectId } = await import("mongodb")
    const { connectToDatabase } = await import("../db")
    const { db } = await connectToDatabase()
    await db.collection("user").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { onboardingComplete: true } }
    )
    return { success: true }
  }
)

export const getStyleProfile = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await getAuthenticatedUserId()
    const { connectMongoose } = await import("../models/connect-mongoose")
    const { StyleProfile } = await import("../models/style-profile.model")
    await connectMongoose()
    const profile = await StyleProfile.findOne({ userId })
    if (!profile) return null
    return {
      traits: profile.traits as Record<string, string>,
      summary: profile.summary as string,
    }
  }
)
