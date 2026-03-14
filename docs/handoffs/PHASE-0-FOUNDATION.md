# Phase 0: Foundation Sprint — Handoff Spec

> **Purpose:** Fix technical debt and app hygiene before building new features. These are small, independent tasks that can mostly be parallelized.

---

## 0.1 — Replace `input[type="month"]` with Custom Month Picker

**Problem:** `<input type="month">` has poor/broken support on iOS Safari. Since the primary user (creator) will likely use an iPhone, this is a blocker for Studio usability on mobile.

**File:** `app/studio/StudioClient.tsx`

**Current code (approximate):**
```tsx
<input type="month" value={monthYear} onChange={...} />
```

**Solution:** Replace with a custom select-based month picker. Two dropdowns (Month + Year) or a single dropdown with formatted options like "March 2026". Keep it simple — no need for a date picker library.

**Acceptance criteria:**
- Works correctly on iOS Safari, Android Chrome, and desktop browsers
- Maintains the same `monthYear` format (`YYYY-MM`) used by the rest of the app
- Visually consistent with the existing UI (terracotta accents, rounded corners, soft shadows)

---

## 0.2 — Error Boundaries Around Gemini Generation

**Problem:** If Gemini fails (rate limit, timeout, malformed response), the app has no graceful handling. The generation API route at `app/api/generate-curriculum/route.ts` has basic try/catch but the client-side (`StudioClient.tsx`) doesn't handle all failure modes well.

**Solution:**
- Add a React Error Boundary component wrapping the Studio and Review pages
- In `StudioClient.tsx`, ensure the generation button shows clear error states: "Generation failed — please try again" with a retry button
- In `gemini.ts`, add timeout handling (e.g., 60-second timeout per agent call) and better error messages for common Gemini failures
- Log errors to console with enough detail to debug

**Acceptance criteria:**
- Gemini timeout → user sees friendly error + retry button
- Gemini rate limit → user sees "Please wait a moment and try again"
- Malformed JSON response → app doesn't crash, shows error state
- No unhandled promise rejections in any generation flow

---

## 0.3 — Skeleton/Shimmer Loading States

**Problem:** Content pops in abruptly on Calendar, Day, and Vault views. No visual loading feedback.

**Files:**
- `app/(subscriber)/calendar/CalendarClient.tsx`
- `app/(subscriber)/day/[date]/DayClient.tsx`
- `app/(subscriber)/vault/VaultClient.tsx`

**Solution:** Add skeleton placeholder components that match the shape of the content they replace. Use Tailwind's `animate-pulse` with `bg-gray-200` rounded blocks.

**Patterns:**
- Calendar: 7-column grid of rounded rectangles
- Day view: Stack of card-shaped rectangles (matching DailyFlowCard dimensions)
- Vault: Grid of card-shaped rectangles (matching AssetCard dimensions)

**Acceptance criteria:**
- Each view shows skeleton placeholders while data loads
- Skeletons match the approximate dimensions of real content
- Smooth transition from skeleton to real content (no layout shift)

---

## 0.4 — Fix Calendar Touch Targets

**Problem:** Calendar day cells use `grid-cols-7` with `gap-1.5` and `aspect-square`. On a 375px screen with padding, each cell is ~45px — below the 48px minimum recommended touch target.

**File:** `components/subscriber/CalendarGrid.tsx`

**Solution:** Ensure minimum 44-48px touch targets. Options:
- Reduce horizontal padding on the calendar container on small screens
- Adjust gap spacing
- Use `min-h-[48px]` on cells
- Or allow horizontal scroll on very narrow screens (less preferred)

**Acceptance criteria:**
- Day cells are at least 44px on a 375px viewport
- Calendar remains usable and visually balanced
- No horizontal overflow

---

## 0.5 — OpenGraph + Twitter Card Metadata

**Problem:** Any link shared on WhatsApp, Facebook, Instagram, Slack, or iMessage shows a blank preview. No OG tags exist.

**File:** `app/layout.tsx` (root metadata) + individual page files for per-page metadata

**Solution:** Add metadata export to root layout:
```tsx
export const metadata: Metadata = {
  title: 'Lua — Pre-K Curriculum for Educators',
  description: 'AI-powered, bilingual Pre-K curriculum planning. Daily activities covering all developmental domains.',
  openGraph: {
    title: 'Lua — Pre-K Curriculum for Educators',
    description: 'AI-powered, bilingual Pre-K curriculum planning.',
    type: 'website',
    // Add a static OG image to public/ for now
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lua — Pre-K Curriculum for Educators',
    description: 'AI-powered, bilingual Pre-K curriculum planning.',
    images: ['/og-default.png'],
  },
}
```

**Also needed:** Create a simple static OG image (`public/og-default.png`, 1200x630) using the brand colors and logo/wordmark. Placeholder is fine — we'll add dynamic OG images in Phase 1.

**Acceptance criteria:**
- Sharing the app URL on WhatsApp/iMessage/Slack shows a branded preview card
- Title, description, and image all render correctly
- No broken image links

---

## 0.6 — Set Up `public/` Directory

**Problem:** `public/` only contains `favicon.svg`. No apple-touch-icon, no web manifest, no standard assets.

**Solution:** Add to `public/`:
- `favicon.ico` (16x16, 32x32) — use terracotta (#E2725B) as the primary color
- `apple-touch-icon.png` (180x180)
- `favicon-32x32.png`, `favicon-16x16.png`
- `og-default.png` (1200x630) — static OG image with brand colors + "Lua" wordmark
- `manifest.json` — basic web app manifest (name, short_name, icons, theme_color, background_color). This is a lightweight PWA prep, not full offline support.

**Acceptance criteria:**
- Favicon shows correctly in browser tabs
- Apple-touch-icon shows when adding to iOS home screen
- Web manifest loads without errors

---

## 0.7 — Improve Empty States

**Problem:** When no curriculum is published for a subscriber's month, they see: "No curriculum available. Your curriculum for this month is not yet ready. Please check back soon." — generic and unhelpful.

**Files:**
- `app/(subscriber)/calendar/CalendarClient.tsx`
- `app/(subscriber)/vault/VaultClient.tsx`

**Solution:** Replace generic empty states with warm, helpful messages:

**Calendar (no plan):**
> "Your curriculum is being crafted! Your teacher is preparing an amazing month of activities. You'll see your daily plans here as soon as they're ready."

**Vault (no assets):**
> "Resources are on the way! Printables, guides, and classroom signage for this month will appear here once your curriculum is published."

Optionally add a simple illustration (a plant growing, a pencil drawing, etc.) using inline SVG or an icon from Lucide.

**Acceptance criteria:**
- Empty states feel warm and on-brand (not like error messages)
- Copy aligns with the educator persona from SME-EDUCATOR.md
- No layout shift when content eventually loads
