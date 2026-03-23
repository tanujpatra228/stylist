import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { getAuth } from "../auth"
import * as outfitService from "../services/outfit.service"

async function getAuthenticatedUserId(): Promise<string> {
  const auth = await getAuth()
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({
    headers: headers as unknown as Headers,
  })
  if (!session) throw new Error("Unauthorized")
  return session.user.id
}

export const generateOutfitSuggestions = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      occasion?: string
      season?: string
      mood?: string
      specificItemId?: string
      count?: number
    }) => d
  )
  .handler(async ({ data }) => {
    const userId = await getAuthenticatedUserId()
    return outfitService.generateSuggestions(userId, data)
  })

export const getUserOutfits = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await getAuthenticatedUserId()
    return outfitService.getUserOutfits(userId)
  }
)

export const getOutfitDetail = createServerFn({ method: "GET" })
  .inputValidator((d: { outfitId: string }) => d)
  .handler(async ({ data }) => {
    return outfitService.getOutfit(data.outfitId)
  })

export const rateOutfit = createServerFn({ method: "POST" })
  .inputValidator((d: { outfitId: string; rating: number }) => d)
  .handler(async ({ data }) => {
    await getAuthenticatedUserId()
    return outfitService.rateOutfit(data.outfitId, data.rating)
  })

export const toggleOutfitSaved = createServerFn({ method: "POST" })
  .inputValidator((d: { outfitId: string }) => d)
  .handler(async ({ data }) => {
    await getAuthenticatedUserId()
    return outfitService.toggleSaved(data.outfitId)
  })

export const markOutfitWorn = createServerFn({ method: "POST" })
  .inputValidator((d: { outfitId: string }) => d)
  .handler(async ({ data }) => {
    await getAuthenticatedUserId()
    return outfitService.markWorn(data.outfitId)
  })

export const deleteOutfit = createServerFn({ method: "POST" })
  .inputValidator((d: { outfitId: string }) => d)
  .handler(async ({ data }) => {
    await getAuthenticatedUserId()
    return outfitService.deleteOutfit(data.outfitId)
  })

export const getOutfitStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await getAuthenticatedUserId()
    const outfitCount = await outfitService.getOutfitCount(userId)
    return { outfitCount }
  }
)
