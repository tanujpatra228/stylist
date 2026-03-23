import mongoose, { Schema, type Document } from "mongoose"

export interface IOutfitItem {
  itemId: string
  role: string
}

export interface IOutfit extends Document {
  userId: string
  name: string
  items: IOutfitItem[]
  occasion: string
  season: string
  aiGenerated: boolean
  aiReasoning: string
  rating: number | null
  saved: boolean
  wornDates: Date[]
  createdAt: Date
  updatedAt: Date
}

const outfitItemSchema = new Schema<IOutfitItem>(
  {
    itemId: { type: String, required: true },
    role: { type: String, required: true },
  },
  { _id: false }
)

const outfitSchema = new Schema<IOutfit>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    items: [outfitItemSchema],
    occasion: { type: String, required: true },
    season: { type: String, required: true },
    aiGenerated: { type: Boolean, default: true },
    aiReasoning: { type: String, default: "" },
    rating: { type: Number, default: null },
    saved: { type: Boolean, default: false },
    wornDates: [{ type: Date }],
  },
  { timestamps: true }
)

outfitSchema.index({ userId: 1, occasion: 1 })
outfitSchema.index({ userId: 1, createdAt: -1 })

export const Outfit =
  mongoose.models.Outfit ||
  mongoose.model<IOutfit>("Outfit", outfitSchema)
