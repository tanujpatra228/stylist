import { GoogleGenAI } from "@google/genai"
import { getStylistSystemPrompt } from "../prompts/stylist-conversation"
import { ITEM_ANALYSIS_PROMPT } from "../prompts/item-analysis"
import {
  OUTFIT_SUGGESTION_SYSTEM_PROMPT,
  buildOutfitSuggestionPrompt,
} from "../prompts/outfit-suggestion"
import type {
  AIProvider,
  ImageInput,
  ItemAnalysisResult,
  OutfitSuggestion,
  StyleProfileSummary,
  StylistConverseContext,
  StylistTurnResponse,
  SuggestionOptions,
  WardrobeItemSummary,
} from "../types"

const MODEL = "gemini-2.5-flash"

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }
    this.ai = new GoogleGenAI({ apiKey })
  }

  async stylistConverse(
    context: StylistConverseContext
  ): Promise<StylistTurnResponse> {
    const systemPrompt = getStylistSystemPrompt(context.sessionType)

    const contents = context.conversationHistory.map((msg) => ({
      role: msg.role === "stylist" ? "model" : "user",
      parts: [{ text: msg.content }],
    }))

    // Add context about current profile and turn info as a user message prefix
    const contextMessage = this.buildContextMessage(context)
    if (contents.length === 0) {
      // First turn  - send context as user message to kick off the conversation
      contents.push({
        role: "user",
        parts: [{ text: contextMessage }],
      })
    }

    const response = await this.ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.8,
        maxOutputTokens: 4096,
      },
    })

    const text = response.text ?? ""

    try {
      const parsed = JSON.parse(text) as StylistTurnResponse
      return parsed
    } catch {
      // If JSON parsing fails, return a fallback response
      return {
        message:
          text ||
          "I'd love to learn more about your style! Could you tell me a bit about yourself?",
        uiHints: {
          inputType: "free-text",
          placeholder: "Tell me about your style...",
        },
      }
    }
  }

  private buildContextMessage(context: StylistConverseContext): string {
    const parts: string[] = [
      `[Session info: type=${context.sessionType}, turn=${context.turnCount + 1}/${context.maxTurns}]`,
    ]

    if (context.currentProfile && Object.keys(context.currentProfile).length > 0) {
      parts.push(
        `[Current style profile: ${JSON.stringify(context.currentProfile)}]`
      )
    } else {
      parts.push("[This is a new user with no existing style profile.]")
    }

    parts.push("Please start the conversation with your first question.")

    return parts.join("\n")
  }

  async generateOutfitSuggestions(
    wardrobeItems: WardrobeItemSummary[],
    styleProfile: StyleProfileSummary,
    options: SuggestionOptions
  ): Promise<OutfitSuggestion[]> {
    const userPrompt = buildOutfitSuggestionPrompt(
      wardrobeItems,
      styleProfile,
      options
    )

    const response = await this.ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: OUTFIT_SUGGESTION_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    })

    const text = response.text ?? ""
    const parsed = JSON.parse(text)
    return parsed.suggestions as OutfitSuggestion[]
  }

  async analyzeWardrobeItem(image: ImageInput): Promise<ItemAnalysisResult> {
    const response = await this.ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: "Analyze this clothing item:" },
            {
              fileData: {
                fileUri: image.url,
                mimeType: "image/jpeg",
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: ITEM_ANALYSIS_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    })

    const text = response.text ?? ""
    return JSON.parse(text) as ItemAnalysisResult
  }
}
