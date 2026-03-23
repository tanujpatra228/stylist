import { connectMongoose } from "../models/connect-mongoose"
import { WardrobeItem } from "../models/wardrobe-item.model"
import { getAIProvider } from "../ai/provider"
import { getStorageProvider } from "../storage/provider"
import { itemAnalysisResultSchema } from "@/shared/schemas/ai.schema"

const PROJECT_FOLDER = "ai-stylist/wardrobe"

export async function getUploadSignature(userId: string) {
  const folder = `${PROJECT_FOLDER}/${userId}`
  return getStorageProvider().getSignedUploadUrl({ folder })
}

export async function analyzeAndSave(
  userId: string,
  publicUrl: string,
  storageKey: string
) {
  await connectMongoose()

  const thumbnailUrl = getStorageProvider().getThumbnailUrl(storageKey, {
    width: 300,
    height: 300,
  })

  const aiResult = await getAIProvider().analyzeWardrobeItem({ url: publicUrl })
  const validated = itemAnalysisResultSchema.parse(aiResult)

  const item = await WardrobeItem.create({
    userId,
    imageUrl: publicUrl,
    thumbnailUrl,
    storageKey,
    category: validated.category,
    subcategory: validated.subcategory,
    colors: validated.colors,
    pattern: validated.pattern,
    material: validated.material,
    season: validated.season,
    occasion: validated.occasion,
    brand: validated.brand,
    aiMetadata: validated,
    tags: validated.tags,
  })

  return {
    id: item._id.toString(),
    imageUrl: item.imageUrl,
    thumbnailUrl: item.thumbnailUrl,
    category: item.category,
    subcategory: item.subcategory,
    colors: item.colors,
    pattern: item.pattern,
    material: item.material,
    season: item.season,
    occasion: item.occasion,
    brand: item.brand,
    tags: item.tags,
    favorite: item.favorite,
  }
}

export async function getUserItems(
  userId: string,
  filters?: { category?: string }
) {
  await connectMongoose()

  const query: Record<string, string> = { userId }
  if (filters?.category && filters.category !== "all") {
    query.category = filters.category
  }

  const items = await WardrobeItem.find(query).sort({ createdAt: -1 })

  return items.map((item) => ({
    id: item._id.toString(),
    imageUrl: item.imageUrl,
    thumbnailUrl: item.thumbnailUrl,
    category: item.category,
    subcategory: item.subcategory,
    colors: item.colors,
    pattern: item.pattern,
    tags: item.tags,
    favorite: item.favorite,
  }))
}

export async function getItem(itemId: string) {
  await connectMongoose()

  const item = await WardrobeItem.findById(itemId)
  if (!item) throw new Error("Item not found")

  return {
    id: item._id.toString(),
    userId: item.userId,
    imageUrl: item.imageUrl,
    thumbnailUrl: item.thumbnailUrl,
    storageKey: item.storageKey,
    category: item.category,
    subcategory: item.subcategory,
    colors: item.colors,
    pattern: item.pattern,
    material: item.material,
    season: item.season,
    occasion: item.occasion,
    brand: item.brand || null,
    tags: item.tags,
    favorite: item.favorite,
    createdAt: item.createdAt.toISOString(),
  }
}

export async function updateItem(
  itemId: string,
  updates: Record<string, unknown>
) {
  await connectMongoose()

  const item = await WardrobeItem.findByIdAndUpdate(
    itemId,
    { $set: updates },
    { new: true }
  )
  if (!item) throw new Error("Item not found")

  return { success: true }
}

export async function deleteItem(itemId: string) {
  await connectMongoose()

  const item = await WardrobeItem.findById(itemId)
  if (!item) throw new Error("Item not found")

  await getStorageProvider().delete(item.storageKey)
  await WardrobeItem.findByIdAndDelete(itemId)

  return { success: true }
}

export async function toggleFavorite(itemId: string) {
  await connectMongoose()

  const item = await WardrobeItem.findById(itemId)
  if (!item) throw new Error("Item not found")

  item.favorite = !item.favorite
  await item.save()

  return { favorite: item.favorite }
}

export async function getItemCount(userId: string) {
  await connectMongoose()
  return WardrobeItem.countDocuments({ userId })
}
