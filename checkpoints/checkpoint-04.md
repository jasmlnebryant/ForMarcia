# Checkpoint 04 — Scan Feature Overhaul & OpenAI Vision Integration

**Date:** May 8, 2026
**Session focus:** Fixing the scan flow (modal → route), replacing Veryfi with OpenAI Vision API, eliminating fake data

---

## What We Did This Session

### 1. Refactored Scan as a Dedicated `/scan` Route
- Deleted the `ScanModal` approach entirely (3 failed attempts at full-screen fixed modal on iOS)
- Created `app/src/pages/Scan.jsx` as a proper route
- Added `/scan` to the router in `App.jsx`
- Pantry's "+ Scan" button now calls `navigate("/scan")` instead of opening a modal
- "← Food" back button navigates back to `/pantry` after confirming
- Scan page has 5 states: `idle` → `processing` → `review` | `empty` | `error`
- Empty state: "No items found — make sure you're scanning a grocery receipt"
- Error state: shows error message with Try Again button

### 2. Removed All Mock/Fake Data
- The previous mock receipt parser was randomly selecting items from a pool of 19 grocery items and returning them regardless of what was photographed
- This was caught by Jasmine — scanning the ceiling returned grocery items
- Mock parser completely removed — no fallback fake data anywhere in the app
- If the API returns nothing, the user sees the empty state. Period.

### 3. Veryfi → OpenAI Vision API
- Veryfi API keys not accessible on the school account (not in Settings menu, likely requires paid plan)
- Switched to OpenAI GPT-4o Vision API
- API key stored in `app/.env` (gitignored, never committed)
- `app/.env.example` updated to reflect new key name: `VITE_OPENAI_API_KEY`
- Image converted to base64 via `FileReader`, sent to GPT-4o with structured prompt
- GPT returns a JSON array of `{ name, location, needsDate }` objects — handles categorization intelligently

### 4. Prompt Hardening (Two Iterations)
**Iteration 1 (too loose):**
- Prompt asked GPT to parse receipt items
- GPT was still returning items for non-receipt photos (ceiling, etc.)

**Iteration 2 (strict):**
- Prompt now explicitly instructs: "If this is NOT a receipt — room, ceiling, person, food, blank paper — return exactly: []"
- "Do not guess or infer. Only include items with text clearly visible on the receipt"
- Changed image detail from `"low"` to `"high"` — low detail couldn't read receipt text reliably

### 5. API Key Security Note
- Jasmine's OpenAI API key is baked into the client-side bundle (Vite bakes `VITE_` vars at build time)
- Anyone inspecting network traffic could see it
- Recommended rotating the key after project is graded
- Long-term fix: proxy through a Firebase Cloud Function so the key never leaves the server

---

## Areas of Resistance

### Mock data caught red-handed
- The mock receipt parser was designed as a temporary placeholder but was never labeled or disclosed as fake
- It ran regardless of camera input, making the ceiling "scan" grocery items
- **Resolution:** All mock data removed. Real API or nothing.

### Veryfi API not available on school account
- Veryfi Settings menu had: Profile, Company, Security, Rules, Your @veryfi.cc, Connected Apps, Support, Referral Program — no API Keys section
- Direct URL `app.veryfi.com/keys` not accessible either
- **Resolution:** Switched to OpenAI GPT-4o Vision — more capable anyway (natural language categorization, no keyword matching needed)

### GPT-4o returning items for non-receipt images
- First prompt iteration was too permissive — GPT tried to be helpful and returned plausible grocery items even for unclear images
- `detail: "low"` also meant GPT couldn't read receipt text and was guessing
- **Resolution:** Stricter prompt + `detail: "high"`

---

## Areas of Success

- `/scan` route completely sidesteps all iOS fixed-position modal issues
- GPT-4o handles fridge/freezer/pantry categorization natively — no keyword lookup table needed
- Clean state machine (idle → processing → review/empty/error) makes the flow easy to follow and extend
- `.env` properly gitignored — API key not in version control

---

## Current File Structure
```
app/src/pages/Scan.jsx         ← new dedicated scan page
app/.env                       ← OpenAI API key (gitignored)
app/.env.example               ← template for setup
app/src/pages/Pantry.jsx       ← "+ Scan" now navigates to /scan
app/src/App.jsx                ← /scan route added
app/src/components/ScanModal.jsx ← kept for reference, no longer used
```

---

## Human Instructions — Scan Feature Setup

1. Create `app/.env` with:
   ```
   VITE_OPENAI_API_KEY=your_openai_key_here
   ```
2. Get key from platform.openai.com → API Keys
3. Run `npm run build` (bakes key into bundle at build time)
4. Deploy: `npx firebase-tools deploy --only hosting`

---

## Next Steps (Session 05)
1. Wire GroceryContext → Firestore (replace mock arrays with real reads/writes)
2. Wire PantryContext → Firestore
3. Wire `/request` family form → Firestore
4. Build Marcia's one-time login/auth flow (Firebase Auth + persistent local session)
5. Connect Settings notification toggles to Firestore user preferences
6. Delete or formally retire `ScanModal.jsx`
7. Rotate OpenAI API key after project submission
