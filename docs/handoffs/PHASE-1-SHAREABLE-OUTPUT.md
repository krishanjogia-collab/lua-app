# Phase 1: Shareable Output — Handoff Spec

> **Purpose:** Make Lua's output shareable on Instagram, WhatsApp, and Facebook. The creator's primary distribution channel is social media and educator community groups. Right now, any link shared anywhere shows a blank preview and requires login to see anything. This phase fixes that.

---

## Context & Patterns from Phase 0

- **Bilingual pattern:** Use `lang === 'en' ? '...' : '...'` ternary throughout UI copy
- **Animation pattern:** `motion.div` with staggered delays (`delay: i * 0.01`)
- **OG metadata:** Root layout already has static OG tags + `/og-default.png` placeholder (from Phase 0.5)
- **Middleware:** Auth enforced on all non-public routes. We need to add public preview routes that bypass auth

---

## 1.1 — Web Share API + Fallback Share Buttons

**Goal:** Let subscribers share daily plans and Parent Bridge snippets directly from the app to WhatsApp, Instagram, etc.

**Files to modify:**
- `app/(subscriber)/day/[date]/DayClient.tsx`
- `components/subscriber/ParentBridgeSnippet.tsx`
- New: `components/ui/ShareButton.tsx`

**Implementation:**

Create a reusable `ShareButton` component:

```tsx
// components/ui/ShareButton.tsx
'use client'

interface ShareButtonProps {
  title: string
  text: string
  url: string
}
```

**Behavior:**
1. Check `navigator.share` support
2. If supported (most mobile browsers): use Web Share API with `{ title, text, url }`
3. If not supported (desktop): show a dropdown/popover with:
   - "Copy Link" (clipboard)
   - "Share on WhatsApp" (`https://wa.me/?text=...`)
   - "Share on Facebook" (`https://www.facebook.com/sharer/sharer.php?u=...`)
4. After successful share/copy, show a brief toast/confirmation ("Link copied!" or "Shared!")

**Where to place it:**
- **DayClient:** Add a share button in the day header area (next to the date title). Share URL should point to the public preview route (task 1.2). Share text should be: "[Theme Name] — Day [N]: [Sub-theme]. Check out today's Pre-K activities!"
- **ParentBridgeSnippet:** Add share button next to the existing "Copy to Clipboard" button. Share the Parent Bridge text + link to the public preview

**Styling:**
- Use existing Button component patterns
- Terracotta accent for the share icon
- Use `Share2` icon from Lucide

**Acceptance criteria:**
- Share button appears on every day view and every Parent Bridge snippet
- On mobile: tapping opens the native share sheet
- On desktop: shows copy link + WhatsApp + Facebook options
- Brief confirmation toast on successful share/copy
- Works in both EN and PT language modes

---

## 1.2 — Public Preview Routes

**Goal:** Create unauthenticated preview pages for daily plans so that:
1. OG scrapers (WhatsApp, Facebook, iMessage, Slack) can render rich link previews
2. Non-subscribers can see a teaser of the curriculum (drives conversion)

**New files:**
- `app/preview/day/[planId]/[date]/page.tsx` — public preview page
- `app/api/og/day/route.tsx` — dynamic OG image endpoint (see task 1.3)

**Middleware update:**
Add `/preview` to the public routes list in `middleware.ts`:
```tsx
const publicRoutes = ['/login', '/auth/processing', '/api/auth', '/preview', '/api/og']
```

**Preview page design:**

The preview shows a **teaser** of the day's curriculum — enough to be valuable as a preview, but not the full content (to incentivize subscribing):

```
┌──────────────────────────────────────┐
│  🌙 Lua                             │
│  [Theme Name] — [Month Year]        │
│  [Weekday], [Date]                  │
│                                      │
│  Today's Learning Domains:           │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │🎨    │ │📖    │ │🏃    │        │
│  │Sensory│ │Cogni.│ │Physic│        │
│  └──────┘ └──────┘ └──────┘        │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │🤝    │ │🌍    │ │👨‍👩‍👧  │        │
│  │Social│ │Cultur│ │Parent│        │
│  └──────┘ └──────┘ └──────┘        │
│                                      │
│  "Today we explored ocean creatures  │
│   through sensory bins and..."       │
│                                      │
│  [Subscribe to see full activities]  │
│  [Log in if you're a subscriber]     │
└──────────────────────────────────────┘
```

**What to show (teaser):**
- Theme name + date
- The 6 domain icons/labels (showing WHAT areas are covered)
- First ~50 characters of one activity description (a taste, not the full plan)
- Parent Bridge snippet (this is marketing — it shows parents the quality)

**What to hide (gated):**
- Full activity descriptions
- Materials lists
- Duration details
- Bilingual content toggle

**Data fetching:**
- Use Supabase service role key (server-side) to fetch the plan regardless of RLS
- Only fetch published plans (`is_published = true`)
- Return 404 for unpublished plans

**Page metadata (per-page OG tags):**
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  // Fetch plan + day data
  return {
    title: `${theme} — ${formattedDate} | Lua`,
    description: `Pre-K activities: ${domainNames.join(', ')}. ${truncatedDescription}`,
    openGraph: {
      title: `${theme} — ${formattedDate}`,
      description: `Today's Pre-K curriculum covers ${domainNames.join(', ')}`,
      images: [{ url: `/api/og/day?planId=${planId}&date=${date}`, width: 1200, height: 630 }],
    },
  }
}
```

**Acceptance criteria:**
- `/preview/day/[planId]/[date]` loads without authentication
- Shows teaser content for published plans
- Returns 404 for unpublished or nonexistent plans
- Has proper per-page OG metadata
- Includes CTA buttons to subscribe or log in
- Works in both languages (detect from query param `?lang=pt` or default to EN)
- No sensitive data exposed (no user info, no full curriculum)

---

## 1.3 — Dynamic OG Image Generation

**Goal:** When a daily plan link is shared on WhatsApp/Facebook/iMessage, the preview card shows a beautiful, branded image — not just text.

**New file:** `app/api/og/day/route.tsx`

**Tech:** Use `@vercel/og` (which uses Satori under the hood) for edge-rendered OG images. This generates an image on-the-fly from JSX.

**Install:**
```bash
npm install @vercel/og
```

**Image design (1200x630px):**

```
┌─────────────────────────────────────────────┐
│  [Cream background #FFFDD0]                 │
│                                              │
│  🌙 Lua                    [Terracotta bar] │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │  [Theme Name]                       │    │
│  │  "Deep Sea Exploration"             │    │
│  │                                     │    │
│  │  Monday, March 10                   │    │
│  │                                     │    │
│  │  🎨 Sensory  📖 Cognitive  🏃 Physical │
│  │  🤝 Social   🌍 Cultural   👨‍👩‍👧 Parent  │
│  └─────────────────────────────────────┘    │
│                                              │
│  Pre-K Curriculum  •  luaapp.com            │
└─────────────────────────────────────────────┘
```

**API route:**
```tsx
import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const planId = searchParams.get('planId')
  const date = searchParams.get('date')

  // Fetch plan data (use service role for server-side)
  // Build the image using JSX

  return new ImageResponse(
    (
      <div style={{ /* cream background, brand fonts, domain icons */ }}>
        {/* Theme name, date, domain labels */}
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

**Font loading:** Satori supports loading custom fonts. Load Lexend for headers if possible, otherwise fall back to Inter/system fonts.

**Acceptance criteria:**
- `/api/og/day?planId=xxx&date=2026-03-10` returns a 1200x630 PNG
- Image uses brand colors (cream background, terracotta accents, sage domain labels)
- Shows theme name, date, and 6 domain labels
- Renders correctly in WhatsApp, Facebook, iMessage, and Slack link previews
- Falls back gracefully if plan data is missing (show generic Lua branding)
- Edge runtime for fast response times

---

## 1.4 — Instagram Story Share Card

**Goal:** Generate a vertical (9:16, 1080x1920px) image that your wife can share as an Instagram Story or WhatsApp Status to promote daily curriculum.

**This is the highest-impact marketing asset.** When shared in educator Facebook/WhatsApp groups, this is what drives traffic to the app.

**Approach options (pick one):**

### Option A: Server-rendered image (like OG but 9:16)
- New API route: `app/api/share-card/day/route.tsx`
- Same `@vercel/og` / Satori approach but at 1080x1920
- User taps "Share to Stories" → downloads the image → opens Instagram/WhatsApp to share

### Option B: Client-side canvas rendering
- Use `html-to-image` or `html2canvas` to render a styled div as an image
- More flexible for complex layouts, but heavier client-side

**Recommendation:** Start with Option A (server-rendered). It's simpler, works offline (the image is a URL), and can be shared as a link that auto-generates the image.

**Story card design (1080x1920px):**

```
┌───────────────────────┐
│ [Cream background]    │
│                       │
│    🌙 Lua             │
│                       │
│ ┌───────────────────┐ │
│ │                   │ │
│ │  [Theme Name]     │ │
│ │  "Deep Sea        │ │
│ │   Exploration"    │ │
│ │                   │ │
│ │  Day 5 of 20      │ │
│ │  Monday, Mar 10   │ │
│ │                   │ │
│ └───────────────────┘ │
│                       │
│  Today's Activities:  │
│                       │
│  🎨 Seaweed Sensory  │
│     Bin               │
│                       │
│  📖 Ocean Counting   │
│     with Shells       │
│                       │
│  🏃 Wave Runner      │
│     Obstacle Course   │
│                       │
│  🤝 Coral Reef       │
│     Group Mural       │
│                       │
│  🌍 Sea Creatures    │
│     Around the World  │
│                       │
│  ─────────────────── │
│  👨‍👩‍👧 Parent Bridge:   │
│  "Today your child    │
│   explored ocean life │
│   through touch and   │
│   movement..."        │
│                       │
│  [Swipe up to see     │
│   full plan]          │
│                       │
│  lua.app/preview/...  │
└───────────────────────┘
```

**Share flow:**
1. User taps "Share as Story" button on DayClient
2. App fetches the image from `/api/share-card/day?planId=xxx&date=xxx`
3. On mobile: Use Web Share API with the image file (if `navigator.share` supports files)
4. Fallback: Download the image to device, user manually shares to Instagram/WhatsApp

**Acceptance criteria:**
- `/api/share-card/day?planId=xxx&date=xxx` returns a 1080x1920 PNG
- Uses brand colors and typography
- Shows theme, date, all 6 activity titles, and Parent Bridge snippet
- Image is visually appealing enough that educators would want to share it
- "Share as Story" button appears on DayClient (next to the regular share button from 1.1)
- Download fallback works on all devices

---

## Implementation Order

These tasks have dependencies:

1. **1.2 first** (public preview routes) — needed before share buttons have a URL to share
2. **1.3 second** (OG images) — preview routes need OG images for link previews to work
3. **1.1 third** (share buttons) — now there's a shareable URL with a good preview
4. **1.4 last** (story cards) — builds on the same data fetching + image generation patterns

---

## Dependencies & Packages

```bash
npm install @vercel/og
```

No other new dependencies needed. Web Share API is native. WhatsApp/Facebook share links are just URL patterns.

---

## Testing Checklist

- [ ] Share a preview link on WhatsApp → shows branded card with image
- [ ] Share a preview link on iMessage → shows branded card
- [ ] Share a preview link on Facebook → shows branded card
- [ ] Share a preview link on Slack → shows branded card
- [ ] Open preview link in incognito browser → shows teaser content, no auth required
- [ ] Open preview link for unpublished plan → shows 404
- [ ] Tap "Share" on iPhone → native share sheet opens
- [ ] Tap "Share" on desktop → copy link + WhatsApp/Facebook options
- [ ] Download story card image → 1080x1920 PNG with correct content
- [ ] Share story card to Instagram Stories → looks good, readable text
- [ ] All above work in both EN and PT
