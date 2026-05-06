# Checkpoint 01
**Session:** Pre-Build / Research & Field Work
**Date:** May 6, 2026
**Milestone:** Session 14 — Research done, platform defended, Design Argument due

---

## What We Did This Session

- Defined the project scope: a mobile-first app for Marcia Frankel (grandmother/guardian) to manage fridge, freezer, and pantry inventory
- Connected the GitHub repo (https://github.com/jasmlnebryant/ForMarcia) to Claude Code
- Read and absorbed all project documents: Project 3 Instructions, Project 3 Scaffold, and the Marcia Interview transcript
- Evaluated tech stack and API options for the build
- Conducted and reviewed the Marcia interview (recorded via Otter.ai)
- Finalized the app's core feature set and input hierarchy based on interview findings
- Established the checkpoints system for tracking progress, resistance, and decisions

---

## Areas of Resistance

### Resistance 01 — Receipt vs. Barcode as Primary Input
**What AI produced:** After reading the interview summary, Claude interpreted Marcia's preference for barcode scanning as the *primary* input method, with receipt scanning as secondary.

**Why it was rejected:** Jasmine pushed back — she knows Marcia, and Marcia's intent was that receipt scanning is more efficient post-grocery-run (one scan logs everything). Barcode scanning is secondary, used for one-off items not captured on a receipt.

**What we did instead:** Flipped the hierarchy:
1. Receipt scan → primary (bulk logging after a grocery trip)
2. Barcode scan → secondary (single item additions)
3. Manual text entry → last resort fallback

**Why this matters:** This is a direct example of the designer knowing the user better than the tool. AI read the transcript; Jasmine read Marcia.

---

## Areas of Success

### Success 01 — Feature Reduction Based on Interview
Marcia explicitly said she does not want to track quantities — too much overhead. This eliminated the "track how long items take to be used up" feature from the original scaffold. Cutting scope early prevents building something she won't use. This aligns directly with the project's core fear: that she stops using the app after a few weeks.

### Success 02 — Home Screen Clarified by Marcia
Marcia's preference for the grocery list to be the first thing she sees when opening the app directly defines the app's home screen. This was not in the original scaffold — it came from the interview. The user shaped the design.

### Success 03 — Tech Stack Locked
Based on project requirements (live URL for submission) and Marcia's needs (iOS, simplicity, family sharing), the stack was decided:
- **Frontend:** React (mobile-first PWA, installable on her home screen)
- **Database / Real-time sync:** Firebase Firestore
- **Receipt scanning:** Veryfi API
- **Barcode / product lookup:** Open Food Facts API (free, no key required)
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Auth:** Minimal — link-based or Face ID where possible

---

## The App As It Stands (Design Intent)

**Three core screens:**
1. **Grocery List (Home)** — Marcia's confirmed list + family-suggested items she can approve or decline
2. **Pantry/Fridge Inventory** — Items added via receipt or barcode scan, color-coded by expiration proximity
3. **Expiration Alerts** — Toggleable, minimal notifications when items are close to expiring

**What this app is NOT:**
- A quantity tracker
- A recipe suggester
- A nutrition tool
- A complex multi-user system with role management

---

## Human Instructions: How to Build to This Point

These are the steps a human would take to replicate everything done up to this checkpoint.

### Step 1 — Create the GitHub Repo
1. Go to github.com and create a new repository named `ForMarcia`
2. Initialize it with a README and a license
3. Clone it to your local machine:
   ```
   git clone https://github.com/jasmlnebryant/ForMarcia.git
   ```

### Step 2 — Gather Your Documents
Collect and store the following in a local `docs` folder (outside the repo is fine):
- Project 3 Instructions (from Blackboard)
- Project 3 Scaffold (your written scaffold)
- Marcia Interview transcript (recorded and summarized via Otter.ai)

### Step 3 — Conduct the Interview
Interview Marcia in person. Record it (with permission) and run it through Otter.ai or similar for a transcript. Key things to capture:
- Her preferred input method (receipt vs. barcode vs. typing)
- Her relationship with notifications
- What she wants to see first when she opens the app
- What would make her stop using it
- Whether she wants family involvement and how much control she wants to retain

### Step 4 — Lock the Feature Set
Based on the interview, decide what's IN and what's OUT before touching any code.

**IN:**
- Receipt scanning (primary input)
- Barcode scanning (secondary input)
- Expiration date tracking with color-coded indicators
- Toggleable notifications
- Shared grocery list with Marcia's approval/decline control

**OUT:**
- Quantity tracking
- Consumption rate tracking
- Manual item entry as anything other than a last resort

### Step 5 — Decide the Platform
Choose React (PWA) over native SwiftUI for these reasons:
- The assignment requires a live URL — native iOS cannot provide one
- A PWA can be installed on Marcia's iPhone home screen and behave like an app
- React allows faster iteration for testing and feedback cycles

### Step 6 — Set Up the Checkpoints Folder
Create a `checkpoints/` folder in your GitHub repo. After each working session, write a checkpoint file documenting:
- What was done
- Areas of resistance (where you corrected or overrode AI)
- Areas of success
- Updated human instructions

---

## Next Up (Session 15 — Mon 5/11)
- Build begins
- Design Intent must be locked (it is — see above)
- AI translates spec into a working prototype
- Start with the Grocery List screen (home screen, highest priority to Marcia)
