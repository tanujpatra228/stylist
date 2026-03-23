import OpenAI from "openai"
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

const MODEL = "gpt-5-nano"

export class OpenAIProvider implements AIProvider {
  private client: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set")
    }
    this.client = new OpenAI({ apiKey })
  }

  async stylistConverse(
    context: StylistConverseContext
  ): Promise<StylistTurnResponse> {
    const systemPrompt = getStylistSystemPrompt(context.sessionType)

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ]

    // Add conversation history
    for (const msg of context.conversationHistory) {
      messages.push({
        role: msg.role === "stylist" ? "assistant" : "user",
        content: msg.content,
      })
    }

    // If first turn, add context message
    if (context.conversationHistory.length === 0) {
      messages.push({
        role: "user",
        content: this.buildContextMessage(context),
      })
    }

    const response = await this.client.chat.completions.create({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    })

    const text = response.choices[0]?.message?.content ?? ""

    try {
      const parsed = JSON.parse(text) as StylistTurnResponse
      return parsed
    } catch {
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

    if (
      context.currentProfile &&
      Object.keys(context.currentProfile).length > 0
    ) {
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

    const response = await this.client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: OUTFIT_SUGGESTION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    })

    const text = response.choices[0]?.message?.content ?? ""
    const parsed = JSON.parse(text)
    return parsed.suggestions as OutfitSuggestion[]
  }

  async analyzeWardrobeItem(image: ImageInput): Promise<ItemAnalysisResult> {
    const response = await this.client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: ITEM_ANALYSIS_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this clothing item:" },
            { type: "image_url", image_url: { url: image.url } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    })

    const text = response.choices[0]?.message?.content ?? ""
    return JSON.parse(text) as ItemAnalysisResult
  }
}
