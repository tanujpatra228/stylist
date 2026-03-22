import { connectMongoose } from "../models/connect-mongoose"
import { StyleProfile } from "../models/style-profile.model"
import { StylistSession } from "../models/stylist-session.model"
import { getAIProvider } from "../ai/provider"
import { stylistTurnResponseSchema } from "@/shared/schemas/ai.schema"
import type { SessionType, ConversationMessage } from "../ai/types"
import type { IStylistMessage } from "../models/stylist-session.model"

const MAX_TURNS: Record<SessionType, number> = {
  onboarding: 7,
  detailed: 15,
  "profile-edit": 10,
  "wardrobe-review": 10,
}

export async function startSession(userId: string, type: SessionType) {
  await connectMongoose()

  // Get or create style profile
  let profile = await StyleProfile.findOne({ userId })
  if (!profile) {
    profile = await StyleProfile.create({ userId, traits: {}, summary: "" })
  }

  // Create session
  const session = await StylistSession.create({
    userId,
    type,
    status: "active",
    messages: [],
    profileSnapshotBefore: profile.traits || {},
  })

  // Get first AI message
  const aiResponse = await getAIProvider().stylistConverse({
    sessionType: type,
    conversationHistory: [],
    currentProfile: (profile.traits as Record<string, unknown>) || null,
    turnCount: 0,
    maxTurns: MAX_TURNS[type],
  })

  // Validate response
  const validated = stylistTurnResponseSchema.parse(aiResponse)

  // Save AI message to session
  session.messages.push({
    role: "stylist",
    content: validated.message,
    uiHints: validated.uiHints,
    extractedData: validated.extractedData,
    timestamp: new Date(),
  })
  await session.save()

  return {
    sessionId: session._id.toString(),
    turnResponse: validated,
    turnCount: 1,
    maxTurns: MAX_TURNS[type],
  }
}

export async function respondToStylist(
  sessionId: string,
  userResponse: string
) {
  await connectMongoose()

  const session = await StylistSession.findById(sessionId)
  if (!session) throw new Error("Session not found")
  if (session.status !== "active") throw new Error("Session is not active")

  // Append user message
  session.messages.push({
    role: "user",
    content: userResponse,
    timestamp: new Date(),
  })

  // Build conversation history
  const conversationHistory: ConversationMessage[] = session.messages.map(
    (msg: IStylistMessage) => ({
      role: msg.role,
      content: msg.content,
      images: msg.images,
    })
  )

  // Get current profile
  const profile = await StyleProfile.findOne({ userId: session.userId })
  const currentTraits = (profile?.traits as Record<string, unknown>) || {}

  // Count user turns (not total messages)
  const userTurns = session.messages.filter(
    (m: IStylistMessage) => m.role === "user"
  ).length
  const maxTurns = MAX_TURNS[session.type as SessionType]

  // Call AI
  const aiResponse = await getAIProvider().stylistConverse({
    sessionType: session.type as SessionType,
    conversationHistory,
    currentProfile: currentTraits,
    turnCount: userTurns,
    maxTurns,
  })

  const validated = stylistTurnResponseSchema.parse(aiResponse)

  // Merge extracted data into profile
  if (validated.extractedData && profile) {
    const updatedTraits = deepMerge(currentTraits, validated.extractedData)
    profile.traits = updatedTraits
    profile.markModified("traits")

    if (validated.sessionComplete && validated.updatedSummary) {
      profile.summary = validated.updatedSummary
    }

    await profile.save()
  }

  // Append AI message to session
  session.messages.push({
    role: "stylist",
    content: validated.message,
    uiHints: validated.uiHints,
    extractedData: validated.extractedData,
    timestamp: new Date(),
  })

  // Mark session complete if AI says so
  if (validated.sessionComplete) {
    session.status = "completed"
  }

  await session.save()

  return {
    sessionId: session._id.toString(),
    turnResponse: validated,
    turnCount: userTurns + 1,
    maxTurns,
    isComplete: !!validated.sessionComplete,
  }
}

export async function resumeSession(sessionId: string) {
  await connectMongoose()

  const session = await StylistSession.findById(sessionId)
  if (!session) throw new Error("Session not found")

  const maxTurns = MAX_TURNS[session.type as SessionType]
  const userTurns = session.messages.filter(
    (m: IStylistMessage) => m.role === "user"
  ).length

  // Get the last stylist message for current uiHints
  const lastStylistMessage = [...session.messages]
    .reverse()
    .find((m: IStylistMessage) => m.role === "stylist")

  return {
    sessionId: session._id.toString(),
    messages: session.messages.map((m: IStylistMessage) => ({
      role: m.role,
      content: m.content,
      images: m.images,
      uiHints: m.uiHints,
      timestamp: m.timestamp,
    })),
    currentUiHints: lastStylistMessage?.uiHints,
    turnCount: userTurns,
    maxTurns,
    status: session.status,
    type: session.type,
  }
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target }

  for (const key of Object.keys(source)) {
    if (key === "_overwrites") continue

    const sourceVal = source[key]
    const targetVal = result[key]

    if (
      sourceVal &&
      typeof sourceVal === "object" &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === "object" &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>
      )
    } else {
      result[key] = sourceVal
    }
  }

  return result
}
