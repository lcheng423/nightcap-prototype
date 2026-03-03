# Plan: Add intention flow (after plus button)

## Overview

When the user taps the **plus** button in the nav, they go to an **Add intention** screen (from Figma). After submitting, they see a **confirmation** screen. Tapping the primary button on confirmation returns them to the **tab they came from** (e.g. "For you" → `/`, "Today" → `/today`, "Threads" → `/threads`).

---

## 1. Flow summary

```
[Any tab: /, /today, /threads]
    → tap Plus
[Add intention screen]  (Figma 4362-12200)
    → tap "Add" (with intention entered)
[Confirmation screen]  (design TBD – you said "this screen as confirmation")
    → tap enabled button
[Back to tab they came from]
```

---

## 2. Routing and navigation

- **New route (SvelteKit):** Add a route that lives **outside** the tabs so it’s a full-screen flow (like reflection/insight). Examples:
  - `src/routes/add/+page.svelte` – single route that can show step 1 (form) or step 2 (confirmation) via local state, or
  - `src/routes/add/+page.svelte` (form) and `src/routes/add/confirm/+page.svelte` (confirmation) with redirect after "Add".

- **Plus button:**  
  - **Option A:** Change the plus from `<button>` to a link: `href="/add?from=/today"` etc., and set `from` from current path (`$page.url.pathname`).  
  - **Option B:** Keep it a button and use `goto('/add?from=' + encodeURIComponent($page.url.pathname))`.  
  Use the same `from` (or `returnTo`) everywhere so confirmation can redirect back.

- **Return:** On the confirmation screen, the primary button calls `goto(from)` or `goto(returnTo)` (with a fallback to `/` if missing).

---

## 3. Add intention screen (Figma 4362-12200)

Implement from [Figma](https://www.figma.com/design/LnY8Rit7AwBUeWW1L5SgTd/Winter-2026?node-id=4362-12200). Stack is Svelte + existing CSS (no Tailwind). Match layout and tokens (e.g. `#423530`, `#f7f0e1`, DIN / SF Rounded) to the rest of the app.

- **Chrome:**
  - Status bar (reuse existing asset).
  - **Left:** Back button (chevron) → `goto(from)` or history back.
  - **Center:** White pill with label **"fuzzy time"**.
  - **Right:** More menu (three dots); can be no-op or a menu later.

- **Main card (rounded, ~386px wide, cream bg):**
  - Top: band-aid-style icon (🩹) + optional thread label (e.g. "Mental health") on the right.
  - Placeholder / hint text: *"This could be about mindfulness, relationships, health, perspective, focus"* and suggestion lines (*"Intend to be present..."*, *"I will choose to listen..."*, etc.) in muted style.
  - Label: **"INTENTION"** (uppercase).
  - Bottom row:
    - **Left:** Two circular buttons – gallery (photo) and gradient/theme (can be visual-only for now).
    - **Right:** **"Add"** button (dark pill, white text). On tap: validate (e.g. intention not empty), then go to confirmation (next step or next route).

- **Input:** Use a **textarea** (or contenteditable) for the intention text so the **native keyboard** appears on focus. No need to implement the full custom keyboard from Figma for the first version; the design can show the card with a text area that scrolls or grows. Optional: autocomplete pills above keyboard ("The", "the", "to") as static or simple suggestions.

- **Layout:** Card centered horizontally; back/pill/more in a fixed header; card scrollable if needed when keyboard is open.

---

## 4. Confirmation screen

- **Design:** You said “it’ll be this screen as confirmation” but didn’t attach a second Figma link. Next step is to either:
  - Share the Figma link (or node-id) for the confirmation screen, or  
  - Describe it (title, body copy, single primary button, any secondary action).

- **Behavior:**
  - One **enabled primary button** (e.g. “Done” or “Back to For you”).
  - On tap: **navigate back to the tab the user came from** using the `from` (or `returnTo`) value we saved when opening the add flow (e.g. `goto(from)` with fallback to `/`).

- **Data:** If the confirmation should show the intention they just added, pass it via query, state, or a small client-side store when navigating from Add → Confirmation.

---

## 5. Passing “where to return to”

- When opening the add flow from the plus button, set **`from`** to the current path:
  - On `/` (For you) → `from=/`
  - On `/today` → `from=/today`
  - On `/threads` → `from=/threads`

- **Options:**
  - **Query:** Plus links to `/add?from=/today`. Add page reads `$page.url.searchParams.get('from')`; after "Add" go to `/add/confirm?from=/today` (or show confirmation in same page). Confirmation button does `goto(from)`.
  - **Session/local state:** Store `returnTo` in sessionStorage when entering `/add` from the nav; confirmation reads it and clears it after navigating. Use query if you want shareable/back-button-friendly URLs.

Recommendation: **query param `from`** for simplicity and so back button and refresh behave predictably.

---

## 6. Implementation order

1. **Routing:** Create `src/routes/add/+page.svelte` (and optionally `src/routes/add/confirm/+page.svelte`). Ensure add flow is outside `(tabs)` so it’s full-screen (reuse phone chrome if desired, or full bleed like reflection).
2. **Plus button:** Update NavBar so plus navigates to `/add?from=<current path>` (or equivalent with `goto`).
3. **Add intention page:** Implement layout and UI from Figma (header, card, placeholder text, intention input, gallery/gradient buttons, Add button). Wire Add → navigate to confirmation (same page state or new route) and pass `from` (and optionally intention text).
4. **Confirmation page:** Once design is provided, implement one screen with primary button that calls `goto(from)` (or `returnTo`).
5. **Return:** Ensure confirmation primary button uses the stored `from`/`returnTo` and falls back to `/` if missing.

---

## 7. Open questions

- **Confirmation screen:** Need Figma link or node-id (or a short description) to implement.
- **Keyboard:** Use native keyboard only for v1; custom keyboard from Figma can be a later enhancement.
- **Persistence:** For the prototype, intentions can be in-memory or localStorage; no backend required unless you want it.
