# Phase 2: Printable/PDF Output — Handoff Spec

> **Purpose:** Teachers need to print daily and weekly plans for their classroom walls, plus downloadable activity cards. Some teachers use phones for planning, others print everything. We need to support both workflows.

---

## Context

- Phase 0 added loading skeletons, error boundaries, and OG metadata
- Phase 1 added share buttons, public preview routes, OG image generation (`@vercel/og`), and Instagram Story cards
- The `@vercel/og` / Satori pattern from Phase 1 can be reused for PDF-style image generation if needed
- The Vault already has asset types (`Printable`, `Signage`, `Guide`) and download links — but assets are currently manually uploaded. This phase adds auto-generated printables from curriculum data.

---

## 2.1 — Print Stylesheet + "Print Day" Button

**Goal:** Let teachers print the day view directly from their browser with clean, ink-friendly formatting.

**Files to modify:**
- `app/globals.css` — add `@media print` rules
- `app/(subscriber)/day/[date]/DayClient.tsx` — add "Print this day" button

**Print stylesheet rules:**
```css
@media print {
  /* Hide non-content elements */
  nav, .share-button, .print-button, footer,
  [data-hide-print] { display: none !important; }

  /* Reset backgrounds for ink-friendly printing */
  body { background: white !important; color: black !important; }

  /* Ensure cards don't break across pages */
  .daily-flow-card { break-inside: avoid; page-break-inside: avoid; }

  /* Show full content without scroll containers */
  .overflow-hidden, .overflow-auto { overflow: visible !important; }

  /* Clean typography */
  * { font-size: 12pt !important; line-height: 1.4 !important; }
  h1 { font-size: 18pt !important; }
  h2, h3 { font-size: 14pt !important; }

  /* Domain cards: stack vertically, remove shadows/animations */
  .daily-flow-card {
    box-shadow: none !important;
    border: 1px solid #ccc !important;
    margin-bottom: 12pt !important;
    padding: 8pt !important;
  }
}
```

**"Print this day" button:**
- Place in the DayClient header area (near the share button from Phase 1)
- Use `Printer` icon from Lucide
- `onClick={() => window.print()}`
- Add `data-hide-print` attribute so the button itself doesn't appear in the printout
- Bilingual label: "Print" / "Imprimir"

**Acceptance criteria:**
- Clicking "Print" opens the browser's native print dialog
- Printout is clean: no nav, no shadows, no decorative backgrounds
- All 6 domain cards fit nicely on 1-2 pages
- Materials lists and descriptions are fully visible (no truncation)
- Works in Chrome, Safari, Firefox

---

## 2.2 — PDF Generation for Individual Day Plans

**Goal:** Generate a downloadable PDF of a single day's curriculum plan, styled with Lua branding.

**Approach:** Use `@react-pdf/renderer` for client-side PDF generation. This gives full control over layout, fonts, and branding without needing a server-side headless browser.

**Install:**
```bash
npm install @react-pdf/renderer
```

**New files:**
- `components/pdf/DayPlanPDF.tsx` — React PDF document component
- `components/ui/DownloadPDFButton.tsx` — reusable button that triggers PDF generation + download

**PDF layout (A4 portrait, ~595x842 points):**

```
┌─────────────────────────────────┐
│  🌙 Lua                        │
│  ──────────────────────────     │
│  [Theme Name]                   │
│  [Weekday], [Full Date]         │
│  Philosophy: [Montessori/etc]   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🎨 Sensory Experience   │   │
│  │ [Activity Title]        │   │
│  │ [Description]           │   │
│  │ Materials: [list]       │   │
│  │ Duration: [time]        │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📖 Cognitive/Literacy   │   │
│  │ [Activity Title]        │   │
│  │ [Description]           │   │
│  │ Materials: [list]       │   │
│  └─────────────────────────┘   │
│                                 │
│  ... (4 more domain cards) ...  │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 👨‍👩‍👧 Parent Bridge        │   │
│  │ [Family message]        │   │
│  └─────────────────────────┘   │
│                                 │
│  ──────────────────────────     │
│  Generated by Lua • lualearn.com│
└─────────────────────────────────┘
```

**Styling:**
- Use brand colors: cream background sections, terracotta headers, sage domain labels
- Lexend font for headers (register with `@react-pdf/renderer`'s Font.register)
- Inter for body text
- Domain cards with light borders and subtle background tints
- Footer with Lua branding + URL

**Language:**
- Render in the user's currently selected language (EN or PT)
- Include the bilingual label for the domain name (e.g., "Sensory Experience / Experiencia Sensorial")

**Download button placement:**
- DayClient header area, next to Print and Share buttons
- `Download` icon from Lucide
- Label: "Download PDF" / "Baixar PDF"
- On click: generate PDF client-side using `@react-pdf/renderer`'s `pdf()` function, create a blob URL, trigger download

**Filename format:** `lua-[theme]-[date].pdf` (e.g., `lua-deep-sea-exploration-2026-03-10.pdf`)

**Acceptance criteria:**
- Tapping "Download PDF" generates and downloads a branded PDF
- PDF renders all 6 domain activities with full descriptions and materials
- Parent Bridge message is included
- Brand colors and typography are correct
- Works on mobile (downloads to device) and desktop
- PDF file size is reasonable (<500KB for text-only plans)

---

## 2.3 — Weekly Plan PDF Bundle

**Goal:** Generate a multi-page PDF containing a full week's curriculum (cover page + 5 daily plans).

**New file:**
- `components/pdf/WeeklyPlanPDF.tsx` — extends DayPlanPDF pattern for multiple days

**Where to trigger:**
- Add a "Download Week" button to the CalendarClient view
- When the user is viewing the calendar, they can select a week and download all 5 days as a single PDF

**PDF structure:**
```
Page 1: Cover Page
  - Lua branding
  - Theme name
  - Week range (e.g., "March 10-14, 2026")
  - Philosophy
  - Week-at-a-glance: 5 rows showing date + sub-theme for each day

Pages 2-6: Daily Plans
  - One page per day, same layout as 2.2
  - Page header: "Day [N] of 5 — [Weekday], [Date]"
```

**Selecting a week:**
- On the calendar, add a "Download This Week" button that appears when hovering/tapping a week row
- Determine the week from the calendar grid (Monday-Friday)
- Only include days that have curriculum data (skip days without entries)

**Acceptance criteria:**
- Weekly PDF generates with cover page + up to 5 daily pages
- Cover page shows the week overview
- Each daily page matches the individual day PDF layout
- File size stays reasonable (<2MB for a full week)
- Filename: `lua-[theme]-week-[startdate].pdf`

---

## 2.4 — Auto-Generated Printable Activity Cards

**Goal:** Generate individual, cut-out-friendly activity cards that teachers can print, laminate, and use in their classroom. These are the cards that go on station labels, activity trays, or get sent home with kids.

**New file:**
- `components/pdf/ActivityCardsPDF.tsx`

**Card layout (4 cards per A4 page, landscape orientation):**

Each card is approximately half-page width, quarter-page height with a dashed cut line:

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ┬ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│ 🎨 Sensory        │ 📖 Cognitive      │
│ [Title]           │ [Title]           │
│ [Short desc]      │ [Short desc]      │
│ Materials:        │ Materials:        │
│ • item 1          │ • item 1          │
│ • item 2          │ • item 2          │
│ Duration: 20 min  │ Duration: 15 min  │
├ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│ 🏃 Physical       │ 🤝 Social         │
│ [Title]           │ [Title]           │
│ ...               │ ...               │
└ ─ ─ ─ ─ ─ ─ ─ ─ ┴ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

**Design details:**
- Dashed border around each card (cut lines)
- Domain icon + color-coded header (each domain gets its own accent color)
- Large, readable font (teachers print these for their walls)
- Minimal text — title, 2-3 line description, materials list, duration
- Lua logo small in corner of each card

**Where to trigger:**
- Add "Download Activity Cards" button on DayClient (next to PDF download)
- Use `Scissors` icon from Lucide (communicates "cut these out")
- Label: "Activity Cards" / "Cartoes de Atividade"

**Acceptance criteria:**
- Generates a single-page PDF with 4-6 activity cards (one per domain)
- Cards have dashed cut lines
- Each card is color-coded by domain
- Font is large enough to read from 2-3 feet away (for classroom display)
- Prints well in both color and black-and-white

---

## Implementation Order

1. **2.1 first** — quickest win, zero dependencies
2. **2.2 second** — establishes the PDF component pattern
3. **2.4 third** — reuses the PDF pattern for a different layout
4. **2.3 last** — composes multiple day PDFs into a bundle

---

## Dependencies

```bash
npm install @react-pdf/renderer
```

No other new dependencies. `@react-pdf/renderer` handles font registration, page layout, and blob generation client-side.

**Note:** `@react-pdf/renderer` can be heavy (~500KB). If bundle size becomes an issue, consider lazy-loading the PDF components with `dynamic(() => import(...), { ssr: false })`.

---

## Testing Checklist

- [ ] "Print" button opens native print dialog with clean output
- [ ] Print output has no nav, no shadows, no button artifacts
- [ ] Day PDF downloads correctly on iPhone Safari
- [ ] Day PDF downloads correctly on Chrome desktop
- [ ] Day PDF has correct brand colors and typography
- [ ] Day PDF renders all 6 domains + Parent Bridge
- [ ] Day PDF works in both EN and PT
- [ ] Weekly PDF has cover page + 5 daily pages
- [ ] Activity cards PDF has 4-6 cards with dashed cut lines
- [ ] Activity cards are readable at arm's length when printed
- [ ] All PDFs have reasonable file size (<500KB single day, <2MB weekly)
- [ ] Download buttons appear correctly on mobile (don't crowd the header)
