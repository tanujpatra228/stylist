import mongoose, { Schema, type Document } from "mongoose"
import type { SessionType, UiHints } from "../ai/types"

export interface IStylistMessage {
  role: "stylist" | "user"
  content: string
  images?: string[]
  uiHints?: UiHints
  extractedData?: Record<string, unknown>
  timestamp: Date
}

export interface IStylistSession extends Document {
  userId: string
  type: SessionType
  status: "active" | "completed" | "abandoned"
  messages: IStylistMessage[]
  profileSnapshotBefore: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const stylistMessageSchema = new Schema<IStylistMessage>(
  {
    role: { type: String, required: true, enum: ["stylist", "user"] },
    content: { type: String, required: true },
    images: [{ type: String }],
    uiHints: { type: Schema.Types.Mixed },
    extractedData: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
)

const stylistSessionSchema = new Schema<IStylistSession>(
  {
    userId: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["onboarding", "detailed", "profile-edit", "wardrobe-review"],
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
    messages: [stylistMessageSchema],
    profileSnapshotBefore: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

stylistSessionSchema.index({ userId: 1, status: 1 })
stylistSessionSchema.index({ userId: 1, createdAt: -1 })

export const StylistSession =
  mongoose.models.StylistSession ||
  mongoose.model<IStylistSession>("StylistSession", stylistSessionSchema)
