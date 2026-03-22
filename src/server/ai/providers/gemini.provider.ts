import { GoogleGenAI } from "@google/genai"
import { getStylistSystemPrompt } from "../prompts/stylist-conversation"
import type {
  AIProvider,
  ImageInput,
  ItemAnalysisResult,
  StylistConverseContext,
  StylistTurnResponse,
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

  async analyzeWardrobeItem(_image: ImageInput): Promise<ItemAnalysisResult> {
    throw new Error("analyzeWardrobeItem not implemented  - coming in Phase 4")
  }
}
