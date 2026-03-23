import mongoose, { Schema, type Document } from "mongoose"

export interface IWardrobeItem extends Document {
  userId: string
  imageUrl: string
  thumbnailUrl: string
  storageKey: string
  category: string
  subcategory: string
  colors: string[]
  pattern: string
  material: string
  season: string[]
  occasion: string[]
  brand: string | null
  aiMetadata: Record<string, unknown>
  tags: string[]
  favorite: boolean
  createdAt: Date
  updatedAt: Date
}

const wardrobeItemSchema = new Schema<IWardrobeItem>(
  {
    userId: { type: String, required: true },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    storageKey: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: "" },
    colors: [{ type: String }],
    pattern: { type: String, default: "solid" },
    material: { type: String, default: "" },
    season: [{ type: String }],
    occasion: [{ type: String }],
    brand: { type: String, default: null },
    aiMetadata: { type: Schema.Types.Mixed, default: {} },
    tags: [{ type: String }],
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true }
)

wardrobeItemSchema.index({ userId: 1, category: 1 })
wardrobeItemSchema.index({ userId: 1, tags: 1 })
wardrobeItemSchema.index({ userId: 1, season: 1 })

export const WardrobeItem =
  mongoose.models.WardrobeItem ||
  mongoose.model<IWardrobeItem>("WardrobeItem", wardrobeItemSchema)
