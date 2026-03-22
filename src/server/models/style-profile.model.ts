import mongoose, { Schema, type Document } from "mongoose"

export interface IStyleProfile extends Document {
  userId: string
  traits: Record<string, unknown>
  summary: string
  createdAt: Date
  updatedAt: Date
}

const styleProfileSchema = new Schema<IStyleProfile>(
  {
    userId: { type: String, required: true },
    traits: { type: Schema.Types.Mixed, default: {} },
    summary: { type: String, default: "" },
  },
  { timestamps: true }
)

styleProfileSchema.index({ userId: 1 }, { unique: true })

export const StyleProfile =
  mongoose.models.StyleProfile ||
  mongoose.model<IStyleProfile>("StyleProfile", styleProfileSchema)
