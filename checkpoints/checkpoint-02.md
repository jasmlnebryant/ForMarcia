# Checkpoint 02
**Session:** Design & Build — Session 14/15
**Date:** May 6, 2026
**Milestone:** App scaffolded, designed, deployed, and live

---

## What We Did This Session

- Conducted and reviewed Marcia interview (Otter.ai transcript)
- Locked final feature set based on interview findings
- Set up GitHub SSH authentication
- Created checkpoints system in the repo
- Scaffolded React + Vite PWA inside the ForMarcia repo
- Installed Firebase, React Router, Lucide icons, firebase-tools
- Created Firebase project (ForMarcia, Spark plan — free)
- Wired Firebase credentials into config.js
- Set up Firebase Hosting and deployed live app
- Built design system from reference images (warm cream, olive green, rounded cards)
- Built and deployed all three core screens: Grocery List, Food/Pantry, Settings
- Added bottom nav with icons (no emojis)
- Created SVG cartoon illustrations of all three dogs: Dash, Gracie, Mako
- Incorporated dogs as mascots on login screen and empty states
- Expanded color palette to be vibrant and bubbly (coral, teal, lavender, peach)
- Added /login route for direct access

**Live URL:** https://formarcia.web.app
**Login screen:** https://formarcia.web.app/login
**Family request view:** https://formarcia.web.app/request

---

## Areas of Resistance

### Resistance 01 — Platform: iOS vs. Web
**What AI produced:** Initially scaffolded a React PWA and recommended staying web.

**What happened:** User pushed for iOS (native). Claude presented Expo as the best path. User then reconsidered and returned to the web PWA approach after understanding that a PWA can be installed on Marcia's iPhone home screen via Safari → "Add to Home Screen."

**What we did instead:** Kept the React PWA. The tradeoff (limited push notifications) was accepted. The live URL requirement of the assignment also supports this decision.

**Why this matters:** Platform decision was driven by the user's understanding of Marcia's needs, not default assumptions.

### Resistance 02 — Receipt vs. Barcode as Primary Input (carried from Checkpoint 01)
**What AI produced:** Read the Otter.ai interview and concluded barcode scanning was primary.

**Why it was rejected:** Jasmine corrected this — receipt scanning is more efficient post-grocery-run. Barcode is secondary for one-off items.

**What we did instead:** Receipt scan = primary, barcode = secondary, manual entry = last resort.

### Resistance 03 — Emojis in Navigation
**What AI produced:** Initial nav bar used emojis (🛒, 🗄, ❄️) as icons.

**Why it was rejected:** User wanted clean icons, not emojis. More polished and appropriate for a real app.

**What we did instead:** Installed Lucide React and replaced all emojis with proper SVG icons (FileText, Apple, Settings). Renamed "Pantry" to "Food."

### Resistance 04 — Badge Placement
**What AI produced:** Placed the red notification badge next to the "Grocery List" h1 heading.

**Why it was rejected:** User specified the badge should sit next to "Requests" — the section it actually refers to, not the whole page title.

**What we did instead:** Moved badge to sit inline next to the "Requests" section label.

---

## Areas of Success

### Success 01 — Design System from Reference Images
Pulled a cohesive design language from five reference images: warm cream background (#FDF8F2), olive green primary (#3E8B35), heavy rounded corners, card-based layout, expiration color system (green/amber/red pills). Expanded with coral, teal, lavender, and peach accents to match Marcia's bubbly personality.

### Success 02 — Dog Mascots
Created three distinct SVG cartoon illustrations of Dash (goldendoodle), Gracie (black fluffy), and Mako (Boxer) based on actual photos. Each dog has breed-accurate colors and key identifying features:
- Dash: fluffy golden bumpy-edge head, floppy ears, curly tail
- Gracie: dark fur, brown muzzle, pink tongue out, bright eyes
- Mako: square Boxer head, brown/white markings, white blaze, wrinkled brow

Dogs appear on the login screen (all three together) and empty states (Gracie on grocery list, Dash on pantry).

### Success 03 — Live Deployment
App is live at formarcia.web.app on Firebase Hosting (free Spark plan). SSH authentication configured for clean git pushes. CI-style workflow: build → deploy → push all from Claude Code.

### Success 04 — Settings Page
Built notification settings page with working toggle switches for 4 notification types, plus a family share link section. All state is local for now — will connect to Firebase in the next session.

---

## Current App Structure

```
app/
├── src/
│   ├── App.jsx                      ← routing (Marcia vs family, /login direct route)
│   ├── index.css                    ← full design system
│   ├── components/
│   │   ├── BottomNav.jsx            ← List / Food / Settings tabs with Lucide icons
│   │   └── dogs/
│   │       ├── DogDash.jsx          ← Goldendoodle SVG
│   │       ├── DogGracie.jsx        ← Black fluffy dog SVG
│   │       └── DogMako.jsx          ← Boxer SVG
│   ├── context/
│   │   └── AuthContext.jsx          ← Firebase persistent auth
│   ├── firebase/
│   │   └── config.js                ← Firebase credentials
│   └── pages/
│       ├── GroceryList.jsx          ← Home screen (mocked data)
│       ├── Pantry.jsx               ← Fridge/Freezer/Pantry tabs (mocked data)
│       ├── FamilyRequest.jsx        ← Family member request form
│       ├── Settings.jsx             ← Notification toggles + share link
│       └── Login.jsx                ← One-time setup screen with all 3 dogs
```

---

## Human Instructions: How to Build to This Point

### Step 1 — Prerequisites
- Node.js installed (v18+)
- Git configured with SSH key added to GitHub
- Firebase account (free, using Google account)

### Step 2 — Clone the repo and install dependencies
```bash
git clone git@github.com:jasmlnebryant/ForMarcia.git
cd ForMarcia/app
npm install
```

### Step 3 — Create Firebase project
1. Go to firebase.google.com → Create project → name it "ForMarcia"
2. Add a Web App → register it → copy the firebaseConfig object
3. Enable Firestore Database (Start in test mode)
4. Enable Authentication → Email/Password

### Step 4 — Wire in Firebase credentials
Paste your firebaseConfig values into `app/src/firebase/config.js`

### Step 5 — Set up Firebase Hosting
Create `app/firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```
Create `app/.firebaserc`:
```json
{ "projects": { "default": "formarcia" } }
```

### Step 6 — Install firebase-tools locally
```bash
npm install firebase-tools --save-dev
npx firebase-tools login
```

### Step 7 — Build and deploy
```bash
npm run build
npx firebase-tools deploy --only hosting
```

### Step 8 — Add dog SVG components
Create `src/components/dogs/DogDash.jsx`, `DogGracie.jsx`, `DogMako.jsx` as SVG React components representing the actual dogs.

### Step 9 — Future: connect Firestore
Replace mocked data arrays in GroceryList.jsx and Pantry.jsx with real Firestore reads/writes. Connect notification toggle state in Settings.jsx to Firestore user preferences.

---

## What's Still Mocked (to be built next)
- Grocery list items (hardcoded — needs Firestore)
- Pantry inventory items (hardcoded — needs Firestore)
- Family request form (logs to console — needs Firestore write)
- Notification toggles (local state — needs Firestore user prefs)
- Receipt scanning (Veryfi API — not yet integrated)
- Barcode scanning (Open Food Facts API — not yet integrated)
- Marcia's login/auth flow (bypassed — needs Firebase Auth)

## Next Up (Session 15 — Mon 5/11)
- Wire Firestore to grocery list (real add/remove/approve)
- Wire family request form to Firestore
- Build Marcia's one-time login flow
- Begin receipt scanning integration (Veryfi)
