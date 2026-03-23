import type {
  WardrobeItemSummary,
  StyleProfileSummary,
  SuggestionOptions,
} from "../types"

export function buildOutfitSuggestionPrompt(
  items: WardrobeItemSummary[],
  profile: StyleProfileSummary,
  options: SuggestionOptions
): string {
  const count = options.count || 2

  const itemsList = items
    .map(
      (item) =>
        `- ID: ${item.id} | ${item.category}/${item.subcategory} | Colors: ${item.colors.join(", ")} | Pattern: ${item.pattern} | Material: ${item.material} | Season: ${item.season.join(", ")} | Occasion: ${item.occasion.join(", ")} | Tags: ${item.tags.join(", ")}`
    )
    .join("\n")

  const constraints: string[] = []
  if (options.occasion) constraints.push(`Occasion: ${options.occasion}`)
  if (options.season) constraints.push(`Season: ${options.season}`)
  if (options.mood) constraints.push(`Mood/vibe: ${options.mood}`)
  if (options.specificItemId) {
    constraints.push(
      `Must include this item: ${options.specificItemId}`
    )
  }

  return `Create ${count} outfit suggestion(s) from the wardrobe items listed below.

## USER STYLE PROFILE
${profile.summary || "No style summary available."}

## AVAILABLE WARDROBE ITEMS
${itemsList}

## CONSTRAINTS
${constraints.length > 0 ? constraints.join("\n") : "No specific constraints - suggest versatile outfits."}

## RULES
- ONLY use items from the list above. Reference them by their exact ID.
- Each outfit needs at minimum a top and bottom (or a dress). Footwear and accessories are optional but encouraged.
- Assign each item a role: "top", "bottom", "shoes", "outerwear", "accessory", "dress"
- Explain WHY these items work together (color coordination, style matching, occasion fit)
- Give each outfit a short, descriptive name
- Set the occasion and season based on the items and constraints
- Keep reasoning concise (2-3 sentences max)
- NEVER use em-dashes. Use hyphens or commas instead.
- If there aren't enough items for a complete outfit, still suggest the best combination possible`
}

export const OUTFIT_SUGGESTION_SYSTEM_PROMPT = `You are a fashion stylist creating outfit combinations from a user's wardrobe. You must respond with valid JSON.

## RESPONSE FORMAT
{
  "suggestions": [
    {
      "name": "Smart Casual Monday",
      "items": [
        {"itemId": "abc123", "role": "top"},
        {"itemId": "def456", "role": "bottom"},
        {"itemId": "ghi789", "role": "shoes"}
      ],
      "occasion": "work",
      "season": "fall",
      "reasoning": "The navy blazer pairs well with the gray chinos for a polished office look. The brown loafers add a classic touch."
    }
  ]
}

## RULES
- Only reference item IDs that exist in the provided wardrobe list
- Each suggestion must have a name, items array, occasion, season, and reasoning
- Items array must have itemId (exact ID from the list) and role
- Reasoning should explain color coordination, style matching, and why it works for the occasion
- NEVER use em-dashes
- Generate the exact number of suggestions requested`
