import { z } from "zod"

export const uiHintOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  imageUrl: z.string().optional(),
})

export const uiHintsSchema = z.object({
  inputType: z.enum([
    "text",
    "single-select",
    "multi-select",
    "image-grid",
    "color-picker",
    "slider",
    "free-text",
  ]),
  options: z.array(uiHintOptionSchema).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  placeholder: z.string().optional(),
})

export const stylistTurnResponseSchema = z.object({
  message: z.string(),
  images: z.array(z.string()).optional(),
  uiHints: uiHintsSchema,
  extractedData: z.record(z.string(), z.any()).optional(),
  sessionComplete: z.boolean().optional(),
  updatedSummary: z.string().optional(),
})

export const stylistMessageSchema = z.object({
  role: z.enum(["stylist", "user"]),
  content: z.string(),
  images: z.array(z.string()).optional(),
  uiHints: uiHintsSchema.optional(),
  extractedData: z.record(z.string(), z.any()).optional(),
  timestamp: z.date(),
})

export const itemAnalysisResultSchema = z.object({
  category: z.string(),
  subcategory: z.string(),
  colors: z.array(z.string()),
  pattern: z.string(),
  material: z.string(),
  season: z.array(z.string()),
  occasion: z.array(z.string()),
  brand: z.string().nullable(),
  tags: z.array(z.string()),
  confidence: z.number(),
})

export type UiHintsInput = z.infer<typeof uiHintsSchema>
export type StylistTurnResponseInput = z.infer<typeof stylistTurnResponseSchema>
export type StylistMessageInput = z.infer<typeof stylistMessageSchema>
export type ItemAnalysisResultInput = z.infer<typeof itemAnalysisResultSchema>
