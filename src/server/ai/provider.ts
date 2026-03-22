import { GeminiProvider } from "./providers/gemini.provider"
import type { AIProvider } from "./types"

let cachedProvider: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider

  const provider = process.env.AI_PROVIDER || "gemini"

  switch (provider) {
    case "gemini":
      cachedProvider = new GeminiProvider()
      break
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }

  return cachedProvider
}
