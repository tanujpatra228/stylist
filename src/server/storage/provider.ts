import { CloudinaryProvider } from "./providers/cloudinary.provider"
import type { StorageProvider } from "./types"

let cachedProvider: StorageProvider | null = null

export function getStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider

  const provider = process.env.STORAGE_PROVIDER || "cloudinary"

  switch (provider) {
    case "cloudinary":
      cachedProvider = new CloudinaryProvider()
      break
    default:
      throw new Error(`Unknown storage provider: ${provider}`)
  }

  return cachedProvider
}
