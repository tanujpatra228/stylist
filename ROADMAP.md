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
| File Storage     | Adapter pattern — Cloudinary default, swappable to S3/Supabase Storage/etc. |
| AI               | Adapter pattern — Gemini API default, swappable to Claude/OpenAI/etc. |
| Deployment       | Vercel or Railway                                           |
| Validation       | Zod (shared client/server schemas)                          |

---

## Data Models (MongoDB/Mongoose)

```
User {
  _id, email, name, avatarUrl,
  onboardingComplete: Boolean,
  createdAt, updatedAt
  // NOTE: Better Auth manages its own user/session/account collections.
  // This model extends Better Auth's user with app-specific fields.
  // Do NOT duplicate auth fields — link via Better Auth's userId.
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
  imageUrl: String,               // Public URL from storage provider
  thumbnailUrl: String,           // Transformed/resized URL from storage provider
  storageKey: String,             // Provider-specific key (for delete/transform operations)
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
  MONGO_URI=
  BETTER_AUTH_SECRET=
  BETTER_AUTH_URL=http://localhost:3000
  STORAGE_PROVIDER=cloudinary
  CLOUDINARY_CLOUD_NAME=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=
  # AWS_S3_BUCKET=              # uncomment when using s3 provider
  # AWS_S3_REGION=
  # AWS_ACCESS_KEY_ID=
  # AWS_SECRET_ACCESS_KEY=
  AI_PROVIDER=gemini
  GEMINI_API_KEY=
  # CLAUDE_API_KEY=           # uncomment when using claude provider
  # OPENAI_API_KEY=           # uncomment when using openai provider
  ```
- [ ] Set up MongoDB Atlas free tier cluster
- [ ] Install core dependencies:
  ```bash
  npm install mongoose zod better-auth
  ```
  > Note: TanStack Start uses `loader` + `serverFn` patterns for data fetching — you likely won't need `@tanstack/react-query` separately. The existing `@tanstack/react-router-ssr-query` handles SSR data bridging.

### 0.2 — Database Connection

- [ ] Create `src/server/db.ts` — Mongoose connection singleton
- [ ] Create Mongoose models in `src/server/models/`:
  - `user.model.ts`
  - `style-profile.model.ts`
  - `wardrobe-item.model.ts`
  - `outfit.model.ts`
- [ ] Define MongoDB indexes on models:
  - `WardrobeItem`: compound index on `{ userId, category }`, index on `{ userId, tags }`, index on `{ userId, season }` — these power the wardrobe grid filters
  - `Outfit`: index on `{ userId, occasion }`, index on `{ userId, createdAt }`
  - `StyleProfile`: unique index on `{ userId }`
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
│   ├── ai/              # AI adapter layer (see Phase 0.4)
│   │   ├── types.ts             # Interfaces: AIProvider, AIVisionProvider
│   │   ├── provider.ts          # Factory: getAIProvider()
│   │   ├── prompts/             # Prompt templates (item-analysis.ts, outfit-suggestion.ts)
│   │   └── providers/
│   │       ├── gemini.provider.ts
│   │       ├── claude.provider.ts   # (add when needed)
│   │       └── openai.provider.ts   # (add when needed)
│   ├── storage/          # Storage adapter layer (see Phase 0.5)
│   │   ├── types.ts             # Interface: StorageProvider
│   │   ├── provider.ts          # Factory: getStorageProvider()
│   │   └── providers/
│   │       ├── cloudinary.provider.ts
│   │       ├── s3.provider.ts       # (add when needed)
│   │       └── supabase.provider.ts # (add when needed)
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

// Image input can be a public URL or raw bytes — providers handle conversion internally
type ImageInput = { url: string } | { buffer: Buffer; mimeType: string }

interface AIVisionProvider {
  analyzeWardrobeItem(image: ImageInput): Promise<ItemAnalysisResult>
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

- [ ] Create `src/server/ai/providers/gemini.provider.ts` — implements `AIProvider` using `@google/generative-ai`
- [ ] Create `src/server/ai/provider.ts` — singleton factory that reads `AI_PROVIDER` env var and returns the correct provider:

```typescript
// provider.ts
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
    // case "claude":
    //   cachedProvider = new ClaudeProvider()
    //   break
    // case "openai":
    //   cachedProvider = new OpenAIProvider()
    //   break
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }

  return cachedProvider
}
```

> **Why singleton?** Each provider initializes an SDK client. Creating a new instance per request wastes connections and memory. Cache it once.

- [ ] Create `src/server/ai/prompts/` — store prompt templates separately from provider logic:
  - `item-analysis.ts` — the system/user prompt for wardrobe item recognition
  - `outfit-suggestion.ts` — the prompt for generating outfit pairings
  - `style-advice.ts` — the prompt for general style Q&A
  - Prompts are **provider-agnostic** plain strings. Each provider formats them into its own API shape.
- [ ] Add `AI_PROVIDER=gemini` to `.env.example`
- [ ] Add Zod schemas for `ItemAnalysisResult` and `OutfitSuggestion` in `src/shared/schemas/ai.schema.ts` — used to validate AI responses regardless of provider

**Key rules for the adapter:**

1. **Services never import a provider directly** — they call `getAIProvider()` and use the interface
2. **Prompts live in `prompts/`**, not inside provider files — prompts are reusable across providers
3. **Each provider handles its own SDK** — Gemini uses `@google/generative-ai`, Claude would use `@anthropic-ai/sdk`, etc.
4. **AI responses are always validated with Zod** — providers return raw results, the service layer validates
5. **Adding a new provider** = one new file in `providers/` + one new case in `provider.ts` + install its SDK

### 0.5 — Storage Adapter Layer

**Goal:** All image storage operations go through a provider-agnostic interface. Switching from Cloudinary to S3/Supabase Storage should require only a new provider file and an env var change — zero changes to business logic.

- [ ] Create `src/server/storage/types.ts` — define the contracts:

```typescript
// The result returned after uploading an image
interface UploadResult {
  publicUrl: string         // Full public URL to the image
  thumbnailUrl: string      // Resized/transformed URL (provider handles how)
  storageKey: string        // Provider-specific identifier (Cloudinary public_id, S3 key, etc.)
  mimeType: string
  size: number              // bytes
}

// Options for generating a signed URL for direct browser upload
interface SignedUploadOptions {
  folder?: string           // e.g. "wardrobe/user123"
  maxFileSize?: number      // bytes
  allowedTypes?: string[]   // e.g. ["image/jpeg", "image/png", "image/webp"]
}

interface SignedUploadResult {
  uploadUrl: string         // The URL the browser POSTs/PUTs to
  fields?: Record<string, string>  // Additional form fields (S3 presigned POST needs these)
  publicUrl: string         // Where the file will be accessible after upload
  storageKey: string        // The key/id assigned to this upload
}

interface StorageProvider {
  // Server-side upload (Buffer → provider)
  upload(file: Buffer, options: {
    fileName: string
    mimeType: string
    folder?: string
  }): Promise<UploadResult>

  // Generate signed URL for direct browser upload (avoids sending files through your server)
  getSignedUploadUrl(options: SignedUploadOptions): Promise<SignedUploadResult>

  // Delete an image by its storage key
  delete(storageKey: string): Promise<void>

  // Get a thumbnail/transformed URL from an existing image
  getThumbnailUrl(storageKey: string, options: {
    width: number
    height: number
    fit?: "cover" | "contain"
  }): string
}
```

- [ ] Create `src/server/storage/providers/cloudinary.provider.ts` — implements `StorageProvider` using `cloudinary` SDK
  - `upload`: uses `cloudinary.uploader.upload_stream`
  - `getSignedUploadUrl`: uses `cloudinary.utils.api_sign_request` for signed direct uploads
  - `delete`: uses `cloudinary.uploader.destroy`
  - `getThumbnailUrl`: uses Cloudinary URL transformations (e.g. `c_fill,w_300,h_300`)
- [ ] Create `src/server/storage/provider.ts` — singleton factory:

```typescript
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
    // case "s3":
    //   cachedProvider = new S3Provider()
    //   break
    // case "supabase":
    //   cachedProvider = new SupabaseStorageProvider()
    //   break
    default:
      throw new Error(`Unknown storage provider: ${provider}`)
  }

  return cachedProvider
}
```

- [ ] Add `STORAGE_PROVIDER=cloudinary` to `.env.example`

**Key rules for the storage adapter:**

1. **Services never import `cloudinary` directly** — they call `getStorageProvider()` and use the interface
2. **`storageKey` is the portable identifier** — Cloudinary calls it `public_id`, S3 calls it a key, but your DB stores `storageKey` and the service layer doesn't care which provider assigned it
3. **Thumbnail generation is provider-specific** — Cloudinary does it via URL transforms (free, instant), S3 would need a Lambda or pre-generated thumbnails. The `getThumbnailUrl` method hides this difference
4. **Direct browser upload is critical for performance** — users upload images straight to the storage provider, not through your Nitro server. The `getSignedUploadUrl` method provides the signed URL for this
5. **Adding a new provider** = one new file in `providers/` + one new case in `provider.ts` + install its SDK

---

## Phase 1 — Authentication

**Goal:** Users can sign up, log in, and access protected routes.

### 1.1 — Better Auth Setup

- [ ] Create `src/server/auth.ts` — configure Better Auth with MongoDB adapter
  > Better Auth was already installed in Phase 0.1. It creates its own `user`, `session`, and `account` collections in MongoDB. Do NOT create a separate User Mongoose model for auth fields. Instead, extend Better Auth's user with app-specific fields (like `onboardingComplete`) via Better Auth's `additionalFields` config.
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
  - **Must render `<Outlet />` from `@tanstack/react-router`** for nested routes to appear
- [ ] Create public layout route `src/routes/_public.tsx` for login/signup pages
  - Also needs `<Outlet />`
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

### 4.1 — Image Upload (via Storage Adapter)

- [ ] Install the default provider SDK: `npm install cloudinary`
- [ ] Implement `CloudinaryProvider` from Phase 0.5 (if not already done)
- [ ] Create server function `getUploadSignature`:
  - Calls `getStorageProvider().getSignedUploadUrl({ folder: "wardrobe/<userId>" })`
  - Returns the signed URL + fields to the client
  - **Never imports `cloudinary` directly** — only uses the `StorageProvider` interface
- [ ] Create `src/components/common/image-upload.tsx` — drag-and-drop / click-to-upload component
  - Fetches signed URL from server, uploads directly to storage provider
  - Shows upload progress
  - Preview before confirming
  - Supports multiple files
- [ ] Create server function `deleteWardrobeItemImage`:
  - Calls `getStorageProvider().delete(storageKey)`
  - Used when deleting a wardrobe item

### 4.2 — AI Item Recognition (via Adapter)

- [ ] Install the default provider SDK: `npm install @google/generative-ai`
- [ ] Implement `analyzeWardrobeItem` in `GeminiProvider` (from Phase 0.4):
  - Uses the prompt template from `src/server/ai/prompts/item-analysis.ts`
  - Sends image to Gemini Vision API (Gemini accepts both URLs and inline base64 — the provider handles conversion from `ImageInput`)
  - Returns raw `ItemAnalysisResult`
- [ ] Create `src/server/services/wardrobe.service.ts` — business logic layer:
  - Calls `getAIProvider().analyzeWardrobeItem(imageUrl)`
  - Validates response with Zod `ItemAnalysisResultSchema`
  - Maps result to a WardrobeItem document
  - **Never imports Gemini SDK directly** — only uses the `AIVisionProvider` interface
- [ ] Create server function `uploadWardrobeItem`:
  1. Receive `publicUrl` and `storageKey` from the client (returned by the storage provider after direct upload)
  2. Generate `thumbnailUrl` via `getStorageProvider().getThumbnailUrl(storageKey, { width: 300, height: 300 })`
  3. Call `wardrobeService.analyzeAndSave(publicUrl, thumbnailUrl, storageKey)`
  4. Return the created item
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
- [ ] Implement `generateOutfitSuggestions` in `GeminiProvider`:
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

- [ ] Rework `src/routes/index.tsx` into a public landing page (this file already exists — replace its contents)
  - Hero section with value proposition
  - Feature highlights (AI wardrobe, style suggestions, etc.)
  - How it works (3 steps)
  - CTA to sign up
  - **Gotcha:** If the user is already logged in and visits `/`, redirect them to `/dashboard` via `beforeLoad`
- [ ] Make it visually appealing — this is the first impression

---

## Phase 7 — Deployment

**Goal:** Ship it.

### 7.1 — Pre-Deployment

- [ ] Audit all environment variables are set
- [ ] Set up MongoDB Atlas production cluster (or use free tier to start)
- [ ] Set up Cloudinary production environment (or whichever storage provider is active)
- [ ] Review security: CORS, rate limiting, input validation
- [ ] Add basic rate limiting on AI endpoints (prevent abuse — Gemini free tier has its own rate limits too)

### 7.2 — Deploy

- [ ] Deploy to Vercel or Railway:
  - Vercel: `npm install @tanstack/start-vite-plugin` preset works out of the box
  - Railway: works well with Nitro server output
- [ ] Set all environment variables in deployment platform
- [ ] Set up custom domain
- [ ] Test full flow on production

### 7.3 — Monitoring

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
Phase 7  →  Deployment                                 (1-2 days)
```

**MVP = Phases 0–5** — a working app where users can sign up, build a style profile, upload wardrobe items with AI recognition, and get AI outfit suggestions. The platform is free — no payment integration needed.

---

## Key Development Principles

1. **Build vertically, not horizontally** — finish one feature end-to-end (DB → server → UI) before starting the next
2. **Server functions are your API** — TanStack Start server functions replace the need for a separate API. Use them for all data mutations and queries
3. **Validate everywhere** — use Zod schemas shared between client and server. Never trust client input
4. **All external services go through adapters** — AI calls use `getAIProvider()`, storage calls use `getStorageProvider()`. Never import `@google/generative-ai`, `cloudinary`, or any provider SDK in service/route files. This makes switching providers a 1-file change
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
