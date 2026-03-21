# AI Stylist — Development Roadmap

> A SaaS platform where users upload their wardrobe, and AI organizes items and suggests outfit pairings based on personality, season, occasion, and style preferences.

---

## Tech Stack

| Layer            | Technology                                                  |
| ---------------- | ----------------------------------------------------------- |
| Framework        | TanStack Start (React 19 + Nitro server)                    |
| Routing          | TanStack Router (file-based)                                |
| Data Fetching    | TanStack Query                                              |
| UI               | shadcn/ui + Tailwind CSS v4                                 |
| Database         | MongoDB Atlas (via Mongoose ODM)                            |
| Authentication   | Better Auth (email/password + OAuth)                        |
| File Storage     | Cloudinary (image upload, transformation, CDN)              |
| AI               | Adapter pattern — Claude API default, swappable to OpenAI/Gemini/etc. |
| Payments         | Stripe (subscriptions)                                      |
| Email            | Resend (transactional emails)                               |
| Deployment       | Vercel or Railway                                           |
| Validation       | Zod (shared client/server schemas)                          |

---

## Data Models (MongoDB/Mongoose)

```
User {
  _id, email, name, avatarUrl,
  subscription: { plan, stripeCustomerId, status },
  onboardingComplete: Boolean,
  createdAt, updatedAt
}

StyleProfile {
  _id, userId (ref),
  gender, ageRange, bodyType,
  stylePreferences: [String],     // e.g. ["minimalist", "streetwear", "classic"]
  colorPreferences: [String],
  avoidColors: [String],
  lifestyle: String,              // e.g. "corporate", "casual", "creative"
  climate: String,                // e.g. "tropical", "temperate", "cold"
  budget: String,                 // e.g. "budget", "mid-range", "luxury"
  questionnaire: [{               // raw Q&A history
    question: String,
    answer: String,
    askedAt: Date
  }],
  createdAt, updatedAt
}

WardrobeItem {
  _id, userId (ref),
  imageUrl: String,               // Cloudinary URL
  thumbnailUrl: String,           // Cloudinary transformed
  category: String,               // "tops", "bottoms", "footwear", "accessories", "outerwear", "dresses"
  subcategory: String,            // "t-shirt", "jeans", "sneakers", etc.
  colors: [String],               // detected dominant colors
  pattern: String,                // "solid", "striped", "floral", etc.
  season: [String],               // ["summer", "spring"]
  occasion: [String],             // ["casual", "work", "formal"]
  brand: String,
  material: String,
  aiMetadata: Object,             // raw AI analysis response
  tags: [String],                 // user + AI generated tags
  favorite: Boolean,
  createdAt, updatedAt
}

Outfit {
  _id, userId (ref),
  name: String,
  items: [{ itemId (ref), role: String }],  // role = "top", "bottom", "shoes", etc.
  occasion: String,
  season: String,
  aiGenerated: Boolean,
  aiReasoning: String,            // why AI suggested this combo
  rating: Number,                 // user rating 1-5
  saved: Boolean,
  wornDates: [Date],
  createdAt, updatedAt
}
```

---

## Phase 0 — Project Setup & Foundation

**Goal:** Get the project infrastructure ready before writing features.

### 0.1 — Clean Up & Configure Environment

- [ ] Remove Supabase credentials from `.env`, add MongoDB connection string
- [ ] Create `.env.example` with all required env vars (no values):
  ```
  MONGODB_URI=
  BETTER_AUTH_SECRET=
  CLOUDINARY_CLOUD_NAME=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=
  AI_PROVIDER=claude
  CLAUDE_API_KEY=
  # OPENAI_API_KEY=          # uncomment when using openai provider
  # GEMINI_API_KEY=           # uncomment when using gemini provider
  STRIPE_SECRET_KEY=
  STRIPE_WEBHOOK_SECRET=
  RESEND_API_KEY=
  ```
- [ ] Set up MongoDB Atlas free tier cluster
- [ ] Install core dependencies:
  ```bash
  npm install mongoose zod @tanstack/react-query better-auth
  ```

### 0.2 — Database Connection

- [ ] Create `src/server/db.ts` — Mongoose connection singleton
- [ ] Create Mongoose models in `src/server/models/`:
  - `user.model.ts`
  - `style-profile.model.ts`
  - `wardrobe-item.model.ts`
  - `outfit.model.ts`
- [ ] Create Zod schemas in `src/shared/schemas/` that mirror the models (used for validation on both client and server)
- [ ] Test DB connection via a simple server function

### 0.3 — Project Structure

Set up the folder structure you'll use throughout the project:

```
src/
├── components/
│   ├── ui/              # shadcn primitives (already exists)
│   ├── layout/          # Shell, Sidebar, Navbar, Footer
│   ├── wardrobe/        # Wardrobe-specific components
│   ├── outfits/         # Outfit-specific components
│   ├── onboarding/      # Questionnaire components
│   └── common/          # Shared components (ImageUpload, Rating, etc.)
├── hooks/               # Custom React hooks
├── lib/                 # Client utilities
├── server/
│   ├── models/          # Mongoose models
│   ├── ai/              # AI adapter layer (see below)
│   │   ├── types.ts             # Interfaces: AIProvider, AIVisionProvider
│   │   ├── provider.ts          # Factory: getAIProvider()
│   │   ├── prompts/             # Prompt templates (item-analysis.ts, outfit-suggestion.ts)
│   │   └── providers/
│   │       ├── claude.provider.ts
│   │       ├── openai.provider.ts   # (add when needed)
│   │       └── gemini.provider.ts   # (add when needed)
│   ├── services/        # Business logic (wardrobe.service, outfit.service, etc.)
│   ├── functions/       # TanStack server functions (API layer)
│   └── db.ts            # DB connection
├── shared/
│   ├── schemas/         # Zod schemas (shared client/server)
│   ├── types/           # TypeScript types
│   └── constants.ts     # App-wide constants (categories, seasons, etc.)
├── routes/              # File-based routes
├── styles.css
└── router.tsx
```

### 0.4 — AI Adapter Layer

**Goal:** All AI calls go through a provider-agnostic interface. Switching from Claude to OpenAI/Gemini should require only a new provider file and an env var change — zero changes to business logic.

- [ ] Create `src/server/ai/types.ts` — define the contracts:

```typescript
// The core interfaces every AI provider must implement

interface ItemAnalysisResult {
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

interface OutfitSuggestion {
  name: string
  items: { itemId: string; role: string }[]
  occasion: string
  season: string
  reasoning: string
}

interface AIVisionProvider {
  analyzeWardrobeItem(imageUrl: string): Promise<ItemAnalysisResult>
}

interface AITextProvider {
  generateOutfitSuggestions(
    wardrobeItems: WardrobeItemSummary[],
    styleProfile: StyleProfileSummary,
    options: SuggestionOptions
  ): Promise<OutfitSuggestion[]>

  generateStyleAdvice(
    styleProfile: StyleProfileSummary,
    question: string
  ): Promise<string>
}

// A provider can implement one or both
interface AIProvider extends AIVisionProvider, AITextProvider {}
```

- [ ] Create `src/server/ai/providers/claude.provider.ts` — implements `AIProvider` using `@anthropic-ai/sdk`
- [ ] Create `src/server/ai/provider.ts` — factory that reads `AI_PROVIDER` env var and returns the correct provider:

```typescript
// provider.ts
import { ClaudeProvider } from "./providers/claude.provider"
import type { AIProvider } from "./types"

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "claude"

  switch (provider) {
    case "claude":
      return new ClaudeProvider()
    // case "openai":
    //   return new OpenAIProvider()
    // case "gemini":
    //   return new GeminiProvider()
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}
```

- [ ] Create `src/server/ai/prompts/` — store prompt templates separately from provider logic:
  - `item-analysis.ts` — the system/user prompt for wardrobe item recognition
  - `outfit-suggestion.ts` — the prompt for generating outfit pairings
  - `style-advice.ts` — the prompt for general style Q&A
  - Prompts are **provider-agnostic** plain strings. Each provider formats them into its own API shape.
- [ ] Add `AI_PROVIDER=claude` to `.env.example`
- [ ] Add Zod schemas for `ItemAnalysisResult` and `OutfitSuggestion` in `src/shared/schemas/ai.schema.ts` — used to validate AI responses regardless of provider

**Key rules for the adapter:**

1. **Services never import a provider directly** — they call `getAIProvider()` and use the interface
2. **Prompts live in `prompts/`**, not inside provider files — prompts are reusable across providers
3. **Each provider handles its own SDK** — Claude uses `@anthropic-ai/sdk`, OpenAI would use `openai`, etc.
4. **AI responses are always validated with Zod** — providers return raw results, the service layer validates
5. **Adding a new provider** = one new file in `providers/` + one new case in `provider.ts` + install its SDK

---

## Phase 1 — Authentication

**Goal:** Users can sign up, log in, and access protected routes.

### 1.1 — Better Auth Setup

- [ ] Install Better Auth: `npm install better-auth`
- [ ] Create `src/server/auth.ts` — configure Better Auth with MongoDB adapter
- [ ] Set up email/password authentication
- [ ] Create `src/lib/auth-client.ts` — client-side auth helpers
- [ ] Add auth middleware to protect routes

### 1.2 — Auth Pages

- [ ] Install shadcn components: `input`, `label`, `card`, `form`, `separator`, `toast`
- [ ] Create route `src/routes/login.tsx` — login page
- [ ] Create route `src/routes/signup.tsx` — signup page
- [ ] Create route `src/routes/forgot-password.tsx`
- [ ] Add redirect logic: unauthenticated → login, authenticated → dashboard

### 1.3 — Auth Layout & Guards

- [ ] Create authenticated layout route `src/routes/_authenticated.tsx`
  - This is a TanStack Router layout route — all child routes require auth
  - Use `beforeLoad` to check session, redirect to `/login` if not authenticated
- [ ] Create public layout route `src/routes/_public.tsx` for login/signup pages
- [ ] Test the full auth flow end-to-end

### 1.4 — OAuth (Optional, do later if needed)

- [ ] Add Google OAuth provider to Better Auth config
- [ ] Add "Sign in with Google" button to login/signup pages

---

## Phase 2 — App Shell & Navigation

**Goal:** Build the main app layout that all authenticated pages live inside.

### 2.1 — Layout Components

- [ ] Install shadcn: `sidebar`, `avatar`, `dropdown-menu`, `sheet`, `tooltip`
- [ ] Create `src/components/layout/app-sidebar.tsx` — collapsible sidebar with navigation links:
  - Dashboard
  - My Wardrobe
  - Outfits
  - Style Profile
  - Settings
- [ ] Create `src/components/layout/app-header.tsx` — top bar with user avatar dropdown (profile, settings, logout)
- [ ] Create `src/components/layout/app-shell.tsx` — combines sidebar + header + main content area

### 2.2 — Route Structure

Create the route files (empty placeholder components for now):

- [ ] `src/routes/_authenticated/dashboard.tsx`
- [ ] `src/routes/_authenticated/wardrobe/index.tsx`
- [ ] `src/routes/_authenticated/wardrobe/$itemId.tsx`
- [ ] `src/routes/_authenticated/outfits/index.tsx`
- [ ] `src/routes/_authenticated/outfits/$outfitId.tsx`
- [ ] `src/routes/_authenticated/profile.tsx`
- [ ] `src/routes/_authenticated/settings.tsx`
- [ ] `src/routes/_authenticated/onboarding.tsx`

### 2.3 — Dashboard Page (Basic)

- [ ] Show welcome message with user's name
- [ ] Show stats cards: total items, total outfits, profile completion %
- [ ] "Quick actions" section: Upload item, Get outfit suggestion, Complete profile
- [ ] This page will be enhanced later — keep it simple for now

---

## Phase 3 — Onboarding & Style Profile

**Goal:** Collect the user's style preferences through an interactive questionnaire.

### 3.1 — Questionnaire Flow

- [ ] Install shadcn: `radio-group`, `checkbox`, `select`, `progress`, `slider`, `badge`
- [ ] Design the questionnaire as a multi-step wizard (5–8 steps):
  1. **Basics** — gender, age range, body type
  2. **Lifestyle** — work environment, daily routine, social activities
  3. **Style Identity** — show image grids, user picks styles they like (minimalist, bohemian, streetwear, classic, etc.)
  4. **Color Preferences** — favorite colors, colors to avoid (visual color picker grid)
  5. **Occasions** — what do they dress for most? (work, casual, dates, events)
  6. **Climate** — where they live, seasonal considerations
  7. **Budget** — spending range per item
  8. **Inspirations** — optional free text about style icons or brands they like
- [ ] Create `src/components/onboarding/questionnaire-wizard.tsx` — multi-step form container with progress bar
- [ ] Create individual step components in `src/components/onboarding/steps/`

### 3.2 — Server Functions & Persistence

- [ ] Create server function `saveStyleProfile` — saves/updates the StyleProfile document
- [ ] Create server function `getStyleProfile` — fetches the current user's profile
- [ ] Wire up the wizard to save progress on each step (so users can resume)
- [ ] Mark `onboardingComplete: true` on User when wizard finishes

### 3.3 — Profile View & Edit

- [ ] Create `src/routes/_authenticated/profile.tsx` — displays saved style profile
- [ ] Allow editing individual sections without re-doing the whole wizard
- [ ] Show a "retake questionnaire" option

---

## Phase 4 — Wardrobe Management

**Goal:** Users can upload wardrobe items, AI recognizes them, and items are organized.

### 4.1 — Image Upload

- [ ] Install Cloudinary SDK: `npm install cloudinary`
- [ ] Create `src/server/services/cloudinary.service.ts` — upload, delete, transform images
- [ ] Create server function `getUploadSignature` — generates a signed Cloudinary upload URL (direct browser upload)
- [ ] Create `src/components/common/image-upload.tsx` — drag-and-drop / click-to-upload component
  - Shows upload progress
  - Preview before confirming
  - Supports multiple files

### 4.2 — AI Item Recognition (via Adapter)

- [ ] Install the default provider SDK: `npm install @anthropic-ai/sdk`
- [ ] Implement `analyzeWardrobeItem` in `ClaudeProvider` (from Phase 0.4):
  - Uses the prompt template from `src/server/ai/prompts/item-analysis.ts`
  - Sends image URL to Claude Vision API
  - Returns raw `ItemAnalysisResult`
- [ ] Create `src/server/services/wardrobe.service.ts` — business logic layer:
  - Calls `getAIProvider().analyzeWardrobeItem(imageUrl)`
  - Validates response with Zod `ItemAnalysisResultSchema`
  - Maps result to a WardrobeItem document
  - **Never imports Claude SDK directly** — only uses the `AIVisionProvider` interface
- [ ] Create server function `uploadWardrobeItem`:
  1. Receive image URL from Cloudinary
  2. Call `wardrobeService.analyzeAndSave(imageUrl)`
  3. Return the created item
- [ ] Write the item-analysis prompt template — be specific about the JSON structure you want back, include examples of good responses

### 4.3 — Wardrobe Grid View

- [ ] Install shadcn: `dialog`, `tabs`, `scroll-area`, `skeleton`
- [ ] Create `src/routes/_authenticated/wardrobe/index.tsx`:
  - Grid of item thumbnails (responsive: 2 cols mobile, 3 tablet, 4+ desktop)
  - Filter bar: by category, color, season, occasion
  - Sort: newest, oldest, category
  - Search by tags
  - "Add Item" floating action button
- [ ] Create `src/components/wardrobe/item-card.tsx` — thumbnail + category badge + color dots
- [ ] Create `src/components/wardrobe/item-filters.tsx` — filter controls
- [ ] Create `src/components/wardrobe/upload-dialog.tsx` — modal for uploading new items

### 4.4 — Item Detail View

- [ ] Create `src/routes/_authenticated/wardrobe/$itemId.tsx`:
  - Full-size image
  - All metadata (category, colors, pattern, season, etc.)
  - Edit metadata (user can correct AI mistakes)
  - Delete item (with confirmation)
  - "Find outfits with this item" button
  - Toggle favorite

### 4.5 — Bulk Upload

- [ ] Enhance upload dialog to accept multiple images
- [ ] Process them in parallel (or queue) through AI recognition
- [ ] Show progress for each item
- [ ] Let user review and correct AI results before final save

---

## Phase 5 — AI Outfit Suggestions

**Goal:** The core feature — AI generates outfit pairings from the user's wardrobe.

### 5.1 — Outfit Generation Service (via Adapter)

- [ ] Create `src/server/services/outfit.service.ts` — business logic layer:
  - `generateOutfitSuggestions(userId, options)`:
    1. Fetch user's StyleProfile and WardrobeItems from DB
    2. Build `WardrobeItemSummary[]` and `StyleProfileSummary` (lightweight DTOs for the AI — no images, just metadata)
    3. Call `getAIProvider().generateOutfitSuggestions(items, profile, options)`
    4. Validate response with Zod `OutfitSuggestionSchema`
    5. Map validated suggestions to Outfit documents, save to DB
    6. **Never imports any AI SDK directly**
- [ ] Implement `generateOutfitSuggestions` in `ClaudeProvider`:
  - Uses prompt template from `src/server/ai/prompts/outfit-suggestion.ts`
  - Passes wardrobe items + style profile as structured context
  - Returns raw `OutfitSuggestion[]`
- [ ] Write the outfit-suggestion prompt template:
  - Include user's style preferences, body type, lifestyle
  - List available items with IDs so AI can reference them
  - Specify occasion/season/mood constraints
  - Instruct: only suggest items the user owns, explain pairings
- [ ] Handle edge cases: not enough items, missing categories, conflicting styles

### 5.2 — Outfit Suggestion UI

- [ ] Install shadcn: `carousel`, `accordion`
- [ ] Create `src/routes/_authenticated/outfits/index.tsx`:
  - "Generate New Outfit" button with options:
    - Occasion selector (work, casual, date night, formal, etc.)
    - Season selector
    - Specific item to build around (optional)
    - Mood/vibe free text (optional)
  - List of previously generated/saved outfits
  - Filter: saved only, AI generated, user created
- [ ] Create `src/components/outfits/outfit-card.tsx`:
  - Visual layout showing all items in the outfit (grid of thumbnails)
  - Occasion + season badges
  - AI reasoning excerpt
  - Save / rate / "worn today" actions
- [ ] Create `src/components/outfits/generation-dialog.tsx` — the form for requesting new suggestions

### 5.3 — Outfit Detail View

- [ ] Create `src/routes/_authenticated/outfits/$outfitId.tsx`:
  - All items displayed with their images
  - AI reasoning (why these items go together)
  - Rate outfit (1–5 stars)
  - Mark as "worn" with date
  - Swap individual items (show alternatives from wardrobe)
  - Delete outfit

### 5.4 — Smart Suggestions

- [ ] Add "Daily Suggestion" feature:
  - Consider local weather (use a free weather API or let user set today's weather)
  - Consider what they've worn recently (avoid repeats)
  - Consider their calendar/occasion if provided
- [ ] Show daily suggestion on the dashboard
- [ ] "Surprise me" button — random occasion, random mood

---

## Phase 6 — Polish & UX

**Goal:** Make the app feel complete and professional.

### 6.1 — Responsive Design

- [ ] Test and fix all pages on mobile (375px), tablet (768px), desktop (1280px+)
- [ ] Sidebar should collapse to bottom nav or hamburger on mobile
- [ ] Upload flow should work well on mobile (camera access)

### 6.2 — Loading & Error States

- [ ] Add skeleton loaders for wardrobe grid, outfit cards, profile sections
- [ ] Add empty states with helpful CTAs ("No items yet — upload your first piece!")
- [ ] Add error boundaries with retry buttons
- [ ] Toast notifications for all actions (upload success, outfit saved, etc.)

### 6.3 — Dark Mode

- [ ] shadcn already supports dark mode via CSS variables (already configured in styles.css)
- [ ] Add theme toggle in settings / header
- [ ] Persist preference

### 6.4 — Landing Page

- [ ] Create `src/routes/index.tsx` — public landing page
  - Hero section with value proposition
  - Feature highlights (AI wardrobe, style suggestions, etc.)
  - How it works (3 steps)
  - CTA to sign up
- [ ] Make it visually appealing — this is the first impression

---

## Phase 7 — Payments & Subscriptions

**Goal:** Monetize with a freemium model.

### 7.1 — Plan Structure

Define tiers:

| Feature              | Free       | Pro ($9/mo)      |
| -------------------- | ---------- | ---------------- |
| Wardrobe items       | 20         | Unlimited        |
| Outfit suggestions   | 3/month    | Unlimited        |
| AI item recognition  | 20         | Unlimited        |
| Style profile        | Yes        | Yes              |
| Priority AI          | No         | Yes              |

### 7.2 — Stripe Integration

- [ ] Install: `npm install stripe`
- [ ] Create `src/server/services/stripe.service.ts`
- [ ] Set up Stripe products and prices in Stripe Dashboard
- [ ] Create server function `createCheckoutSession` — redirects to Stripe Checkout
- [ ] Create server function `createBillingPortal` — for managing subscription
- [ ] Set up Stripe webhook endpoint to handle:
  - `checkout.session.completed` — activate subscription
  - `customer.subscription.updated` — plan changes
  - `customer.subscription.deleted` — cancellation
- [ ] Create `src/routes/_authenticated/settings.tsx` — billing section with current plan, upgrade/downgrade buttons

### 7.3 — Enforce Limits

- [ ] Create middleware/helper to check usage limits before:
  - Uploading items (check item count)
  - Generating outfits (check monthly generation count)
- [ ] Show upgrade prompts when limits are reached

---

## Phase 8 — Deployment

**Goal:** Ship it.

### 8.1 — Pre-Deployment

- [ ] Audit all environment variables are set
- [ ] Set up MongoDB Atlas production cluster (or use free tier to start)
- [ ] Set up Cloudinary production environment
- [ ] Review security: CORS, rate limiting, input validation
- [ ] Add basic rate limiting on AI endpoints (prevent abuse)

### 8.2 — Deploy

- [ ] Deploy to Vercel or Railway:
  - Vercel: `npm install @tanstack/start-vite-plugin` preset works out of the box
  - Railway: works well with Nitro server output
- [ ] Set all environment variables in deployment platform
- [ ] Set up custom domain
- [ ] Test full flow on production

### 8.3 — Monitoring

- [ ] Add error tracking (Sentry free tier)
- [ ] Monitor MongoDB Atlas metrics
- [ ] Set up uptime monitoring (Betterstack free tier)

---

## Development Order Summary

```
Phase 0  →  Foundation, DB, project structure         (2-3 days)
Phase 1  →  Authentication                            (2-3 days)
Phase 2  →  App shell, navigation, route stubs         (1-2 days)
Phase 3  →  Onboarding & style profile                 (3-4 days)
Phase 4  →  Wardrobe upload + AI recognition           (4-5 days)
Phase 5  →  AI outfit suggestions                      (4-5 days)
Phase 6  →  Polish, responsive, dark mode, landing     (3-4 days)
Phase 7  →  Payments (can skip for MVP launch)         (2-3 days)
Phase 8  →  Deployment                                 (1-2 days)
```

**MVP = Phases 0–5** — a working app where users can sign up, build a style profile, upload wardrobe items with AI recognition, and get AI outfit suggestions.

---

## Key Development Principles

1. **Build vertically, not horizontally** — finish one feature end-to-end (DB → server → UI) before starting the next
2. **Server functions are your API** — TanStack Start server functions replace the need for a separate API. Use them for all data mutations and queries
3. **Validate everywhere** — use Zod schemas shared between client and server. Never trust client input
4. **AI goes through the adapter** — services call `getAIProvider()`, never import `@anthropic-ai/sdk` or any SDK directly. Prompts live in `prompts/`, not in provider files. This is a hard rule — it makes switching providers a 1-file change
5. **AI prompts are your product** — spend time crafting and iterating on prompt templates. The quality of item recognition and outfit suggestions IS the product
6. **Start ugly, make it pretty** — get functionality working first, then polish. Don't spend a day on a button animation before the upload flow works
7. **Commit often** — small, working commits. One feature per PR if possible

---

## Useful Commands

```bash
npm run dev          # Start dev server (port 3000)
npx shadcn@latest add <component>   # Add shadcn components
npm run build        # Production build
npm run test         # Run tests
```
