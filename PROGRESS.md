# AI Stylist — Development Progress

> Track implementation progress here. Update this file as phases and tasks are completed. Do NOT modify ROADMAP.md for progress tracking.

---

## Overall Status

| Phase | Name                        | Status         |
| ----- | --------------------------- | -------------- |
| 0     | Project Setup & Foundation  | Partial        |
| 1     | Authentication              | Done (no OAuth) |
| 2     | App Shell & Navigation      | Done           |
| 3     | Stylist Onboarding          | Not Started    |
| 4     | Outfit Suggestions & Premium| Not Started    |

---

## Phase 0 — Project Setup & Foundation

### 0.1 — Clean Up & Configure Environment
- [x] Remove Supabase credentials, add MongoDB connection string
- [x] Create `.env.example` with all required env vars
- [x] Set up MongoDB Atlas free tier cluster
- [x] Install core dependencies (`mongoose`, `zod`, `better-auth`) — _done as Phase 1 prerequisite_

### 0.2 — Database Connection
- [x] Create `src/server/db.ts` — native MongoDB connection — _done as Phase 1 prerequisite_
- [ ] Create Mongoose models in `src/server/models/` — _deferred to when each model is needed_
- [ ] Define MongoDB indexes on models — _deferred_
- [ ] Create Zod schemas in `src/shared/schemas/` — _auth schema done in Phase 1_

### 0.3 — Project Structure
- [x] Base folder structure (`src/components/ui/`, `src/lib/`, `src/routes/`)
- [x] Extended structure (`src/server/`, `src/shared/`, etc.) — _created in Phase 1_

### 0.4 — AI Adapter Layer
- [ ] Create `src/server/ai/types.ts`
- [ ] Create `src/server/ai/provider.ts`
- [ ] Create `src/server/ai/providers/gemini.provider.ts`
- [ ] Create prompt templates in `src/server/ai/prompts/`

### 0.5 — Storage Adapter Layer
- [ ] Create `src/server/storage/types.ts`
- [ ] Create `src/server/storage/provider.ts`
- [ ] Create `src/server/storage/providers/cloudinary.provider.ts`

---

## Phase 1 — Authentication

### 1.1 — Better Auth Setup
- [x] Install dependencies (`better-auth`, `mongodb`, `mongoose`, `zod`)
- [x] Create `src/server/db.ts` — MongoDB connection singleton (native driver + top-level await)
- [x] Create `src/server/auth.ts` — Better Auth config with MongoDB adapter
- [x] Create `src/lib/auth-client.ts` — client-side auth helpers
- [x] Create `src/server/auth.functions.ts` — server functions for session checks
- [x] Create `server/routes/api/auth/[...all].ts` — Nitro catch-all handler for Better Auth

### 1.2 — Auth Pages
- [x] Install shadcn components (`input`, `label`, `card`, `separator`, `sonner`)
- [x] Create `src/shared/schemas/auth.schema.ts` — Zod validation schemas
- [x] Create `src/routes/_public/login.tsx` — login page
- [x] Create `src/routes/_public/signup.tsx` — signup page
- [x] Create `src/routes/_public/forgot-password.tsx` — forgot password page (placeholder, no email transport)
- [x] Add redirect logic (unauthenticated → login, authenticated → dashboard)

### 1.3 — Auth Layout & Guards
- [x] Create `src/routes/_public.tsx` — public layout route
- [x] Create `src/routes/_authenticated.tsx` — authenticated layout route
- [x] Create `src/routes/_authenticated/dashboard.tsx` — placeholder dashboard
- [x] Update `src/routes/index.tsx` — root redirect logic
- [x] Update `src/routes/__root.tsx` — add Toaster
- [x] End-to-end auth flow verified

### 1.4 — OAuth (Optional)
- [ ] Add Google OAuth provider to Better Auth config
- [ ] Add "Sign in with Google" button

---

## Phase 2 — App Shell & Navigation

### 2.1 — Layout Components
- [x] Install shadcn components (`sidebar`, `avatar`, `dropdown-menu`, `sheet`, `tooltip`)
- [x] Create `src/components/layout/app-sidebar.tsx` — collapsible sidebar with nav links
- [x] Create `src/components/layout/app-header.tsx` — top bar with user avatar dropdown
- [x] Create `src/components/layout/app-shell.tsx` — combines sidebar + header + content

### 2.2 — Route Structure
- [x] `src/routes/_authenticated/wardrobe/index.tsx` — placeholder
- [x] `src/routes/_authenticated/wardrobe/$itemId.tsx` — placeholder
- [x] `src/routes/_authenticated/outfits/index.tsx` — placeholder
- [x] `src/routes/_authenticated/outfits/$outfitId.tsx` — placeholder
- [x] `src/routes/_authenticated/profile.tsx` — placeholder
- [x] `src/routes/_authenticated/settings.tsx` — placeholder
- [x] `src/routes/_authenticated/onboarding.tsx` — placeholder

### 2.3 — Dashboard Page (Basic)
- [x] Welcome message with user name
- [x] Stats cards (wardrobe items, outfits, style profile — hardcoded zeros)
- [x] Quick actions (upload item, get outfit suggestion, chat with stylist)

## Phase 3 — Stylist Onboarding
> Not started. See ROADMAP.md for details.

## Phase 4 — Outfit Suggestions & Premium
> Not started. See ROADMAP.md for details.

---

## Notes & Decisions

| Date       | Decision                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| 2026-03-22 | Phase 0 deps installed as Phase 1 prerequisites instead of separately    |
| 2026-03-22 | Using controlled state + Zod safeParse for forms (no react-hook-form)    |
| 2026-03-22 | Forgot password page is placeholder — email transport configured later   |
| 2026-03-22 | Mongoose models deferred to when each feature needs them                 |
| 2026-03-22 | Auth API route uses Nitro server route (`server/routes/`) not TanStack file route (no `createAPIFileRoute` in this version) |
| 2026-03-22 | Better Auth needs native `mongodb` driver, not Mongoose — both coexist pointing at same Atlas cluster |
| 2026-03-22 | Nitro `serverDir: "./server"` must be set in vite.config.ts for server routes to be picked up |
| 2026-03-22 | DB connection uses lazy init (not top-level await) to avoid breaking Vite's client bundle |
| 2026-03-22 | Mobile-first approach for all frontend — most users on mobile devices |
