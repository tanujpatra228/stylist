import { connectMongoose } from "../models/connect-mongoose"
import { WardrobeItem } from "../models/wardrobe-item.model"
import { StyleProfile } from "../models/style-profile.model"
import { Outfit } from "../models/outfit.model"
import { getAIProvider } from "../ai/provider"
import { outfitSuggestionsResponseSchema } from "@/shared/schemas/ai.schema"
import type {
  SuggestionOptions,
  WardrobeItemSummary,
  StyleProfileSummary,
} from "../ai/types"
import type { IOutfitItem } from "../models/outfit.model"

export async function generateSuggestions(
  userId: string,
  options: SuggestionOptions
) {
  await connectMongoose()

  const [items, profile] = await Promise.all([
    WardrobeItem.find({ userId }),
    StyleProfile.findOne({ userId }),
  ])

  if (items.length < 3) {
    throw new Error(
      "You need at least 3 wardrobe items to generate outfit suggestions. Upload more items first."
    )
  }

  const wardrobeItems: WardrobeItemSummary[] = items.map((item) => ({
    id: item._id.toString(),
    category: item.category,
    subcategory: item.subcategory,
    colors: item.colors,
    pattern: item.pattern,
    material: item.material,
    season: item.season,
    occasion: item.occasion,
    tags: item.tags,
  }))

  const styleProfile: StyleProfileSummary = {
    summary: profile?.summary || "",
    traits: (profile?.traits as Record<string, unknown>) || {},
  }

  const rawSuggestions = await getAIProvider().generateOutfitSuggestions(
    wardrobeItems,
    styleProfile,
    options
  )

  // Wrap in expected format for Zod validation
  const validated = outfitSuggestionsResponseSchema.parse({
    suggestions: rawSuggestions,
  })

  // Filter out suggestions referencing non-existent items
  const validItemIds = new Set(wardrobeItems.map((i) => i.id))
  const validSuggestions = validated.suggestions.filter((s) =>
    s.items.every((item) => validItemIds.has(item.itemId))
  )

  // Save to DB
  const savedOutfits = await Promise.all(
    validSuggestions.map((s) =>
      Outfit.create({
        userId,
        name: s.name,
        items: s.items,
        occasion: s.occasion,
        season: s.season,
        aiGenerated: true,
        aiReasoning: s.reasoning,
      })
    )
  )

  // Return with item thumbnails
  return Promise.all(
    savedOutfits.map(async (outfit) => {
      const outfitItems = await Promise.all(
        outfit.items.map(async (oi: IOutfitItem) => {
          const wardrobeItem = await WardrobeItem.findById(oi.itemId)
          return {
            itemId: oi.itemId,
            role: oi.role,
            thumbnailUrl: wardrobeItem?.thumbnailUrl || "",
            category: wardrobeItem?.category || "",
          }
        })
      )
      return {
        id: outfit._id.toString(),
        name: outfit.name,
        items: outfitItems,
        occasion: outfit.occasion,
        season: outfit.season,
        aiReasoning: outfit.aiReasoning,
        rating: outfit.rating,
        saved: outfit.saved,
      }
    })
  )
}

export async function getUserOutfits(userId: string) {
  await connectMongoose()

  const outfits = await Outfit.find({ userId }).sort({ createdAt: -1 })

  return Promise.all(
    outfits.map(async (outfit) => {
      const outfitItems = await Promise.all(
        outfit.items.map(async (oi: IOutfitItem) => {
          const wardrobeItem = await WardrobeItem.findById(oi.itemId)
          return {
            itemId: oi.itemId,
            role: oi.role,
            thumbnailUrl: wardrobeItem?.thumbnailUrl || "",
            category: wardrobeItem?.category || "",
          }
        })
      )
      return {
        id: outfit._id.toString(),
        name: outfit.name,
        items: outfitItems,
        occasion: outfit.occasion,
        season: outfit.season,
        aiReasoning: outfit.aiReasoning,
        rating: outfit.rating,
        saved: outfit.saved,
      }
    })
  )
}

export async function getOutfit(outfitId: string) {
  await connectMongoose()

  const outfit = await Outfit.findById(outfitId)
  if (!outfit) throw new Error("Outfit not found")

  const outfitItems = await Promise.all(
    outfit.items.map(async (oi: IOutfitItem) => {
      const wardrobeItem = await WardrobeItem.findById(oi.itemId)
      return {
        itemId: oi.itemId,
        role: oi.role,
        thumbnailUrl: wardrobeItem?.thumbnailUrl || "",
        imageUrl: wardrobeItem?.imageUrl || "",
        category: wardrobeItem?.category || "",
        subcategory: wardrobeItem?.subcategory || "",
        colors: wardrobeItem?.colors || [],
      }
    })
  )

  return {
    id: outfit._id.toString(),
    name: outfit.name,
    items: outfitItems,
    occasion: outfit.occasion,
    season: outfit.season,
    aiGenerated: outfit.aiGenerated,
    aiReasoning: outfit.aiReasoning,
    rating: outfit.rating,
    saved: outfit.saved,
    wornDates: outfit.wornDates.map((d: Date) => d.toISOString()),
    createdAt: outfit.createdAt.toISOString(),
  }
}

export async function rateOutfit(outfitId: string, rating: number) {
  await connectMongoose()
  await Outfit.findByIdAndUpdate(outfitId, { rating })
  return { success: true }
}

export async function toggleSaved(outfitId: string) {
  await connectMongoose()
  const outfit = await Outfit.findById(outfitId)
  if (!outfit) throw new Error("Outfit not found")
  outfit.saved = !outfit.saved
  await outfit.save()
  return { saved: outfit.saved }
}

export async function markWorn(outfitId: string) {
  await connectMongoose()
  await Outfit.findByIdAndUpdate(outfitId, {
    $push: { wornDates: new Date() },
  })
  return { success: true }
}

export async function deleteOutfit(outfitId: string) {
  await connectMongoose()
  await Outfit.findByIdAndDelete(outfitId)
  return { success: true }
}

export async function getOutfitCount(userId: string) {
  await connectMongoose()
  return Outfit.countDocuments({ userId })
}
