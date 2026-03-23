import { GeminiProvider } from "./providers/gemini.provider"
import { OpenAIProvider } from "./providers/openai.provider"
import type {
  AIProvider,
  OutfitSuggestion,
  StyleProfileSummary,
  StylistConverseContext,
  StylistTurnResponse,
  SuggestionOptions,
  WardrobeItemSummary,
} from "./types"

function createProvider(name: string): AIProvider {
  switch (name) {
    case "gemini":
      return new GeminiProvider()
    case "openai":
      return new OpenAIProvider()
    default:
      throw new Error(`Unknown AI provider: ${name}`)
  }
}

class FallbackAIProvider implements AIProvider {
  private primary: AIProvider
  private fallback: AIProvider | null

  constructor(primaryName: string, fallbackName: string | null) {
    this.primary = createProvider(primaryName)
    this.fallback = fallbackName ? createProvider(fallbackName) : null
  }

  async stylistConverse(
    context: StylistConverseContext
  ): Promise<StylistTurnResponse> {
    try {
      return await this.primary.stylistConverse(context)
    } catch (error: unknown) {
      if (this.fallback && this.isRateLimitError(error)) {
        console.warn(
          `[AI] Primary provider rate limited, falling back to secondary`
        )
        return await this.fallback.stylistConverse(context)
      }
      throw error
    }
  }

  async generateOutfitSuggestions(
    wardrobeItems: WardrobeItemSummary[],
    styleProfile: StyleProfileSummary,
    options: SuggestionOptions
  ): Promise<OutfitSuggestion[]> {
    try {
      return await this.primary.generateOutfitSuggestions(
        wardrobeItems,
        styleProfile,
        options
      )
    } catch (error: unknown) {
      if (this.fallback && this.isRateLimitError(error)) {
        console.warn(
          `[AI] Primary provider rate limited, falling back to secondary`
        )
        return await this.fallback.generateOutfitSuggestions(
          wardrobeItems,
          styleProfile,
          options
        )
      }
      throw error
    }
  }

  async analyzeWardrobeItem(image: { url: string }) {
    try {
      return await this.primary.analyzeWardrobeItem(image)
    } catch (error: unknown) {
      if (this.fallback && this.isRateLimitError(error)) {
        console.warn(
          `[AI] Primary provider rate limited, falling back to secondary`
        )
        return await this.fallback.analyzeWardrobeItem(image)
      }
      throw error
    }
  }

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase()
      return (
        msg.includes("429") ||
        msg.includes("rate") ||
        msg.includes("quota") ||
        msg.includes("resource_exhausted")
      )
    }
    if (typeof error === "object" && error !== null) {
      const code = (error as Record<string, unknown>).status ??
        (error as Record<string, unknown>).code
      return code === 429 || code === "429"
    }
    return false
  }
}

let cachedProvider: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider

  const primary = process.env.AI_PROVIDER || "gemini"

  // Auto-detect fallback: if the other provider's API key exists, use it
  const fallback =
    primary === "gemini" && process.env.OPENAI_API_KEY
      ? "openai"
      : primary === "openai" && process.env.GEMINI_API_KEY
        ? "gemini"
        : null

  cachedProvider = fallback
    ? new FallbackAIProvider(primary, fallback)
    : createProvider(primary)

  return cachedProvider
}
