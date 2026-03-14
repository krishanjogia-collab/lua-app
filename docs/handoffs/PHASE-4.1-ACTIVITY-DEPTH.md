# Phase 4.1: Execution-Ready Activity Cards

## Problem
Current activity cards contain a title, one paragraph, a flat materials list, and a duration string. This is inspiration-level content — no better than asking ChatGPT. An educator still needs to figure out HOW to run each activity. The SME framework (SME-EDUCATOR.md) already describes what rich activities look like, but the generation pipeline doesn't ask for it and the data model can't hold it.

Additionally, bilingual (EN/PT) content is hardcoded as mandatory. This excludes English-only educators and makes the product feel niche rather than universal.

## Goals
1. Expand the activity schema so each card is classroom-ready
2. Make bilingual content opt-in via profile settings
3. Update the Gemini generation prompt to produce richer output
4. Redesign the activity card UI to surface depth without overwhelming

---

## 1. Schema Changes

### `lib/types.ts` — New `DomainActivity` interface

Replace the current interface:
```ts
// CURRENT (thin)
interface DomainActivity {
  title: string
  activity: string
  materials: string[]
  duration: string
  en: string
  pt: string
}
```

With:
```ts
// NEW (classroom-ready)
interface DomainActivity {
  title: string
  description: string                // 1-2 sentence overview for scanning
  steps: string[]                    // Ordered execution steps
  materials: MaterialItem[]
  duration: {
    setup: string                    // "5 min"
    activity: string                 // "15-20 min"
    cleanup: string                  // "5 min"
  }
  group_size: string                 // "4-5 children" | "Whole class" | "Pairs"
  space: 'indoor' | 'outdoor' | 'both'
  differentiation: {
    easier: string                   // For younger 3s or children needing support
    harder: string                   // For school-ready 5s or advanced learners
  }
  safety_note?: string               // Allergy, choking, supervision warnings
  cleanup_protocol?: string          // "Wipe tables with sanitizing solution"
  transition_cue?: string            // "When the timer rings, we wash our hands for..."
  assessment_cue?: string            // "Watch for children who can sort by two attributes"
  vocabulary: string[]               // Key English vocabulary for this activity
  home_extension?: string            // Suggested home activity (for parent_bridge domain)

  // Bilingual fields — only populated when educator has bilingual_mode enabled
  description_pt?: string
  steps_pt?: string[]
  vocabulary_pt?: string[]
}

interface MaterialItem {
  item: string
  quantity?: string                  // "2 cups", "1 per child"
  substitute?: string               // "corn starch if wheat allergy"
}
```

### `lib/types.ts` — Profile additions

```ts
// Add to Profile interface
bilingual_mode: boolean              // default false
secondary_language?: 'pt'           // future: 'es', 'fr', etc.
```

### Supabase migration

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bilingual_mode BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS secondary_language TEXT DEFAULT NULL
    CHECK (secondary_language IN ('pt'));
```

### Backward compatibility

Existing `daily_data` JSONB in `curriculum_plans` will still have the old shape. The UI and types must handle both:
- If `activity.steps` exists → render new rich card
- If `activity.activity` exists (old string field) → render legacy card (paragraph mode)
- If `activity.en` / `activity.pt` exist (old bilingual fields) → map to `description` / `description_pt`

Add helpers:
```ts
function isRichActivity(a: any): a is DomainActivity {
  return Array.isArray(a.steps)
}

// Map legacy fields to new schema for rendering
function getActivityDescription(a: any, lang: Language): string {
  if (isRichActivity(a)) {
    return lang === 'pt' && a.description_pt ? a.description_pt : a.description
  }
  // Legacy: fall back to en/pt fields
  return lang === 'en' ? a.en : a.pt
}

function getActivityDuration(a: any): string {
  if (typeof a.duration === 'object' && a.duration.activity) {
    const d = a.duration
    const parts = [d.setup, d.activity, d.cleanup].filter(Boolean)
    return parts.join(' + ')  // "5 min + 20 min + 10 min"
  }
  return a.duration || ''  // Legacy: plain string
}

function getActivityMaterials(a: any): { item: string; quantity?: string; substitute?: string }[] {
  if (!a.materials?.length) return []
  if (typeof a.materials[0] === 'string') {
    // Legacy: string[] → MaterialItem[]
    return a.materials.map((m: string) => ({ item: m }))
  }
  return a.materials
}
```

---

## IMPORTANT: Compatibility with Phase 5 Gamification (AG's recent work)

AG added gamification checkboxes to `DailyFlowCard.tsx`. The redesign MUST preserve:

1. **Props**: `planId`, `date`, `initialCompleted` — keep these unchanged
2. **Server action**: `toggleDomainCompletion` in `app/actions/gamification.ts` — no changes needed, it works with domain keys not content
3. **Completion button**: Currently at bottom of card. In the new collapsed/expanded design, the completion button MUST stay visible in the collapsed state. Teachers shouldn't need to expand a card just to mark it done.
4. **`completedDomains` prop** in `DayClient.tsx` — keep this unchanged

### Field mapping for legacy data:
- Old `domain.en` / `domain.pt` → use `getActivityDescription()` helper above
- Old `domain.materials: string[]` → use `getActivityMaterials()` helper above
- Old `domain.duration: string` → use `getActivityDuration()` helper above
- Old `domain.activity: string` → ignore (redundant with `en`), not used in current card

---

## 2. Gemini Prompt Changes

### `lib/gemini.ts` — Specialist Agent prompt update

The `generateCurriculum` function needs a new parameter: `bilingualMode: boolean`

The specialist prompt JSON schema changes from:
```json
{
  "date": "YYYY-MM-DD",
  "title": "Short engaging title",
  "activity": "Detailed educator instructions",
  "materials": ["item1", "item2"],
  "duration": "20 minutes",
  "en": "Full narrative in English",
  "pt": "Descrição completa em português"
}
```

To:
```json
{
  "date": "YYYY-MM-DD",
  "title": "Short engaging title (max 6 words)",
  "description": "1-2 sentence overview a busy teacher can scan in 5 seconds",
  "steps": [
    "Step 1: Set up the station by...",
    "Step 2: Invite children to...",
    "Step 3: Model the activity by...",
    "Step 4: Observe and scaffold...",
    "Step 5: Transition to cleanup..."
  ],
  "materials": [
    { "item": "sensory bin", "quantity": "1 large", "substitute": null },
    { "item": "dried rice", "quantity": "4 cups", "substitute": "dried pasta for different texture" },
    { "item": "scoops and funnels", "quantity": "1 per child", "substitute": null }
  ],
  "duration": {
    "setup": "5 min",
    "activity": "20 min",
    "cleanup": "10 min"
  },
  "group_size": "4-5 children at the station",
  "space": "indoor",
  "differentiation": {
    "easier": "Use larger scoops. Reduce number of materials to 2.",
    "harder": "Add counting cards. Ask children to sort by size before pouring."
  },
  "safety_note": "Supervise closely if using small items. Not suitable for children who mouth objects.",
  "cleanup_protocol": "Have children help transfer rice back to container. Sweep floor. Wipe table.",
  "transition_cue": "When you hear the rain stick, it's time to pour your rice back into the big bin!",
  "assessment_cue": "Watch for children demonstrating 1:1 correspondence when filling containers.",
  "vocabulary": ["pour", "scoop", "texture", "full", "empty"]
}
```

### Bilingual conditional block

Only added to the prompt when `bilingualMode === true`:
```
BILINGUAL MODE: This educator uses bilingual EN/PT curriculum.
For EACH activity, also include these additional fields:
  "description_pt": "Natural Brazilian Portuguese translation of description"
  "steps_pt": ["Portuguese translation of each step, same order"]
  "vocabulary_pt": ["Portuguese equivalent of each vocabulary word"]

Portuguese translations must be natural and culturally appropriate, NOT literal.
Use Brazilian Portuguese conventions.
```

When `bilingualMode === false`, these fields are omitted entirely from the prompt and the expected JSON schema.

### Domain-specific prompt enhancements

Update each specialist's prompt to request domain-appropriate detail:

**sensory_layout:**
> "Specify exact bin/station contents with quantities. Include setup diagram description (left-to-right station flow). Flag materials requiring extra supervision. Include cleanup protocol with sanitization steps."

**cognitive_literacy:**
> "Include specific book titles or song names where applicable. Vocabulary must include 4-6 theme words. Include assessment cue for pre-literacy milestones (letter recognition, phonemic awareness, 1:1 correspondence)."

**physical_outdoor:**
> "Provide BOTH indoor (rainy day) and outdoor versions. Specify space requirements (e.g., '10ft x 10ft clear area'). Include movement transition to next activity."

**social_emotional:**
> "Specify group size explicitly. Include emotional vocabulary words. Describe teacher role (facilitator vs. participant). Include de-escalation note for common conflicts."

**cultural_global:**
> "Name specific books, songs, or traditions by title and origin. Follow secular framing by default. Include 'Adapt to your classroom community' note. Never reduce cultures to costumes or food."

**parent_bridge:**
> "Write 2-3 sentence parent message explaining developmental purpose in warm family-friendly language. Include one home extension activity requiring NO special materials. If bilingual mode is on, provide the message in both EN and PT."

---

## 3. UI Changes — Activity Card Redesign

### `components/subscriber/DailyFlowCard.tsx`

Replace the current single-paragraph card with an expandable card:

**Collapsed state (default):**
- Domain icon + domain label
- Activity title (bold)
- Description (1-2 sentences)
- Duration badge: "35 min total"
- Group size badge: "4-5 children"
- Space badge: "Indoor" / "Outdoor" / "Both"
- Expand chevron

**Expanded state (on tap/click):**
- Everything from collapsed PLUS:
- **Steps** — numbered list with checkboxes (connects to gamification)
- **Materials** — table with item, quantity, substitutes
- **Differentiation** — "Easier" / "Harder" toggle or side-by-side
- **Safety note** — yellow/amber alert box (if present)
- **Cleanup** — collapsible section
- **Transition cue** — quote-styled block
- **Assessment cue** — teacher observation prompt
- **Vocabulary** — pill/chip row of words
- If bilingual: toggle to show PT translations inline

**Design tokens:**
- Collapsed: `bg-white rounded-3xl shadow-soft p-4` (compact)
- Expanded: same card grows, sections separated by `border-t border-cream-200`
- Badges: `rounded-full px-2.5 py-0.5 text-xs font-inter`
  - Duration: `bg-terracotta-50 text-terracotta-700`
  - Group size: `bg-sage-50 text-sage-700`
  - Space: `bg-cream-200 text-espresso`
- Safety note: `bg-amber-50 border border-amber-200 rounded-xl p-3`
- Steps: numbered list, each step has a subtle checkbox (ties to Phase 5 gamification)
- Vocabulary pills: `bg-cream-200 text-espresso rounded-full px-3 py-1 text-xs`

### Legacy fallback

If `isRichActivity(activity)` is false, render the current paragraph-style card unchanged. This ensures existing generated plans still display correctly.

---

## 4. Profile & Onboarding Updates

### Onboarding flow (Phase 3.7)
Add a step: "Would you like bilingual curriculum (English + Portuguese)?"
- Default: No (English only)
- Yes → sets `bilingual_mode = true`, `secondary_language = 'pt'`
- This step should feel natural, not like a gate

### Settings page (future)
Allow toggling bilingual mode on/off at any time.

### Marketing / Landing page
- Lead with: "Expert Pre-K curriculum, ready to teach"
- Bilingual is a feature bullet: "Optional bilingual support (EN/PT)" — NOT the headline
- Don't exclude English-only educators from the value prop

---

## 5. Mock Data Update

### `lib/mock-data.ts`

Update `MOCK_DAILY_DATA` to include at least 1 day with the new rich schema so the UI can be developed and tested without hitting Gemini.

Example mock activity (sensory_layout):
```ts
{
  title: "Starlight Sensory Station",
  description: "Children explore a space-themed sensory bin with moon sand, star confetti, and scooping tools.",
  steps: [
    "Cover the table with a dark cloth or black butcher paper to set the 'night sky' scene.",
    "Fill the sensory bin with moon sand (8 cups flour + 1 cup baby oil).",
    "Add silver star confetti, small planet figurines, and glow-in-the-dark stars.",
    "Invite 4 children at a time. Model scooping and pouring: 'I'm filling my crater!'",
    "Ask open-ended questions: 'What does the moon sand feel like? Is it heavy or light?'",
    "When the rain stick sounds, guide children to pour sand back and wash hands."
  ],
  materials: [
    { item: "Large sensory bin", quantity: "1" },
    { item: "Moon sand (flour + baby oil)", quantity: "8 cups flour, 1 cup oil", substitute: "Cloud dough or kinetic sand" },
    { item: "Star confetti", quantity: "1 bag" },
    { item: "Small scoops and funnels", quantity: "1 per child" },
    { item: "Planet figurines", quantity: "5-6", substitute: "Painted rocks" },
    { item: "Dark cloth/butcher paper", quantity: "1 sheet" }
  ],
  duration: { setup: "10 min", activity: "20 min", cleanup: "10 min" },
  group_size: "4 children at a time",
  space: "indoor" as const,
  differentiation: {
    easier: "Remove figurines to reduce distraction. Use only 2 scooping tools. Focus on the tactile experience.",
    harder: "Add counting cards ('scoop 3 stars'). Introduce size sorting: big planets vs. small stars."
  },
  safety_note: "Moon sand contains flour — check for wheat allergies. Substitute with corn starch. Supervise to prevent ingestion.",
  cleanup_protocol: "Children help scoop sand back into bin. Wipe table with damp cloth then sanitizer. Sweep floor.",
  transition_cue: "When you hear the rain stick, it's time to pour your moon sand back into the big crater!",
  assessment_cue: "Observe fine motor control during scooping. Note children who use descriptive language (soft, grainy, sparkly).",
  vocabulary: ["texture", "pour", "scoop", "crater", "orbit"]
}
```

---

## 6. Implementation Order

1. **Update `lib/types.ts`** — new DomainActivity, MaterialItem, Profile additions, backward compat helper
2. **Update `lib/mock-data.ts`** — rich mock data for at least 1 day
3. **Redesign `DailyFlowCard.tsx`** — collapsed/expanded card with all new fields, legacy fallback
4. **Update `lib/gemini.ts`** — new specialist prompts, bilingual conditional, expanded JSON schema
5. **Update `app/api/generate-curriculum/route.ts`** — pass bilingualMode from profile
6. **Run Supabase migration** — bilingual_mode + secondary_language columns
7. **Update onboarding flow** — add bilingual opt-in step
8. **Update landing page copy** — lead with expertise, bilingual as feature bullet
9. **Test generation** — generate one plan with new prompts, verify output quality
10. **Iterate with Luana** — show her a real generated activity card, get feedback

## Out of Scope
- Multiple secondary languages (Spanish, French) — future
- Activity editing/customization by teachers — future
- Activity rating/feedback loop to improve generation — future
- Photo/illustration generation for activities — future
