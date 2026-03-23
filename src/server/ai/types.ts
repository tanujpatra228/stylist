export type InputType =
  | "text"
  | "single-select"
  | "multi-select"
  | "image-grid"
  | "color-picker"
  | "slider"
  | "free-text"

export interface UiHintOption {
  label: string
  value: string
  imageUrl?: string
}

export interface UiHints {
  inputType: InputType
  options?: UiHintOption[]
  min?: number
  max?: number
  placeholder?: string
}

export interface StylistTurnResponse {
  message: string
  images?: string[]
  uiHints: UiHints
  extractedData?: Record<string, unknown>
  sessionComplete?: boolean
  updatedSummary?: string
}

export type SessionType =
  | "onboarding"
  | "detailed"
  | "profile-edit"
  | "wardrobe-review"

export interface ConversationMessage {
  role: "stylist" | "user"
  content: string
  images?: string[]
}

export interface StylistConverseContext {
  sessionType: SessionType
  conversationHistory: ConversationMessage[]
  currentProfile: Record<string, unknown> | null
  turnCount: number
  maxTurns: number
}

export interface ImageInput {
  url: string
}

export interface ItemAnalysisResult {
  category: string
  subcategory: string
  colors: string[]
  pattern: string
  material: string
  season: string[]
  occasion: string[]
  brand: string | null
  tags: string[]
  confidence: number
}

export interface WardrobeItemSummary {
  id: string
  category: string
  subcategory: string
  colors: string[]
  pattern: string
  material: string
  season: string[]
  occasion: string[]
  tags: string[]
}

export interface StyleProfileSummary {
  summary: string
  traits: Record<string, unknown>
}

export interface SuggestionOptions {
  occasion?: string
  season?: string
  specificItemId?: string
  mood?: string
  count?: number
}

export interface OutfitSuggestion {
  name: string
  items: { itemId: string; role: string }[]
  occasion: string
  season: string
  reasoning: string
}

export interface AITextProvider {
  stylistConverse(
    context: StylistConverseContext
  ): Promise<StylistTurnResponse>

  generateOutfitSuggestions(
    wardrobeItems: WardrobeItemSummary[],
    styleProfile: StyleProfileSummary,
    options: SuggestionOptions
  ): Promise<OutfitSuggestion[]>
}

export interface AIVisionProvider {
  analyzeWardrobeItem(image: ImageInput): Promise<ItemAnalysisResult>
}

export interface AIProvider extends AITextProvider, AIVisionProvider {}
