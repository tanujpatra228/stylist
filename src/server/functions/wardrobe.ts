import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { getAuth } from "../auth"
import * as wardrobeService from "../services/wardrobe.service"

async function getAuthenticatedUserId(): Promise<string> {
  const auth = await getAuth()
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({
    headers: headers as unknown as Headers,
  })
  if (!session) throw new Error("Unauthorized")
  return session.user.id
}

export const getUploadSignature = createServerFn({ method: "POST" }).handler(
  async () => {
    const userId = await getAuthenticatedUserId()
    return wardrobeService.getUploadSignature(userId)
  }
)

export const saveWardrobeItem = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { publicUrl: string; storageKey: string }) => d
  )
  .handler(async ({ data }) => {
    const userId = await getAuthenticatedUserId()
    return wardrobeService.analyzeAndSave(
      userId,
      data.publicUrl,
      data.storageKey
    )
  })

export const getUserWardrobeItems = createServerFn({ method: "GET" })
  .inputValidator((d: { category?: string }) => d)
  .handler(async ({ data }) => {
    const userId = await getAuthenticatedUserId()
    return wardrobeService.getUserItems(userId, data)
  })

export const getWardrobeItem = createServerFn({ method: "GET" })
  .inputValidator((d: { itemId: string }) => d)
  .handler(async ({ data }) => {
    return wardrobeService.getItem(data.itemId)
  })

export const updateWardrobeItem = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { itemId: string; updates: Record<string, unknown> }) => d
  )
  .handler(async ({ data }) => {
    await getAuthenticatedUserId()
    return wardrobeService.updateItem(data.itemId, data.updates)
  })

export const deleteWardrobeItem = createServerFn({ method: "POST" })
  .inputValidator((d: { itemId: string }) => d)
  .handler(async ({ data }) => {
    await getAuthenticatedUserId()
    return wardrobeService.deleteItem(data.itemId)
  })

export const toggleWardrobeFavorite = createServerFn({ method: "POST" })
  .inputValidator((d: { itemId: string }) => d)
  .handler(async ({ data }) => {
    await getAuthenticatedUserId()
    return wardrobeService.toggleFavorite(data.itemId)
  })

export const getWardrobeStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await getAuthenticatedUserId()
    const itemCount = await wardrobeService.getItemCount(userId)
    return { itemCount }
  }
)
