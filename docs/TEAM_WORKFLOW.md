# CommitGuard: Team Engineering Workflow & Sprint Protocol

**Document Version:** 1.0.0-SPRINT-SPEC  
**Hackathon Track:** Track 3 (Payments & Embedded Finance) — Problem 7: *Finance Where the Decision Happens*  
**Author:** Principal Engineering Manager & Technical Lead  
**Target Audience:** CommitGuard Hackathon Core Team (Frontend, Core Math, AI/Privacy Engineers)  

---

## 1. Team Roles & Modular Ownership

To prevent merge collisions and maximize execution velocity across the 48-hour sprint, the CommitGuard codebase is divided into **three decoupled, parallel engineering tracks**. Each track owns specific file paths and interface boundaries.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                ARCHITECTURAL OWNERSHIP                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  TRACK A: UI & EXTENSION              TRACK B: MATH & ENGINE          TRACK C: AI & STORAGE    │
│  (Lead: UI/Extension Engineer)       (Lead: Math Backend Engineer)   (Lead: AI/Privacy Eng)   │
│                                                                                        │
│  • src/extension/*                   • src/lib/financial-engine.ts   • src/app/api/explain/*  │
│  • src/components/CommitGuardWidget  • src/lib/policy-alerts.ts      • src/lib/llm-guardrail  │
│  • src/components/NeutralDirectory   • src/lib/types.ts (Math)       • src/lib/storage.ts     │
│  • src/app/page.tsx (POS Studio)     • tests/engine.test.ts          • tests/guardrail.test   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Track A: Interception Layer & Frontend
* **Owner:** Lead UI / Extension Engineer
* **Primary Scope:**
  1. **Chrome Extension (Manifest V3):** Injectable content script (`src/extension/content.ts`) targeting checkout prices, payment tenure dropdowns, and submission buttons on e-commerce and banking pages.
  2. **Embedded POS & Interceptor Modal:** High-polish Next.js components (`src/components/CommitGuardWidget.tsx`, `EmiBreakdownCard.tsx`, `LockInSimulator.tsx`).
  3. **Interactive Demo Studio:** Checkout simulation page (`src/app/page.tsx`) enabling judges to test real-world scenarios (e-commerce EMI, FD booking, Debt MF).
  4. **Neutral Directory View:** Sortable, unranked public rate card table (`src/components/NeutralDirectory.tsx`).
* **Contract with Other Tracks:** Consumes TypeScript calculation interfaces from Track B and narrative response schemas from Track C.

---

### Track B: Deterministic Financial Engine
* **Owner:** Lead Math & Core Backend Engineer
* **Primary Scope:**
  1. **Financial Engine Core (`src/lib/financial-engine.ts`):**
     * Newton-Raphson XIRR solver for Effective APR accounting for merchant discounts, processing fees, and 18% GST.
     * Lock-in vs. liquidity penalty calculator (contracted rate minus $0.50\% - 1.00\%$ premature exit fee).
     * Post-tax real yield engine ($R_{\text{nominal}} - \text{Inflation} - T_{\text{slab}}$).
     * Sovereign opportunity cost benchmark comparison against 91-day T-Bills and RBI repo rates.
  2. **Contextual Macro Rules (`src/lib/policy-alerts.ts`):** Hardcoded tax rules (Section 50AA Debt MF slab taxation, Section 111A 20% STCG, Section 194A TDS).
  3. **Unit Test Suite (`tests/engine.test.ts`):** 100% code coverage on mathematical formulas with Jest assertions verifying accuracy against banking amortization schedules.
* **Contract with Other Tracks:** Emits pure deterministic JSON output payloads consumed by Track A (UI) and Track C (LLM).

---

### Track C: LLM Guardrail Pipeline & Local Privacy Storage
* **Owner:** Lead AI & Privacy Engineer
* **Primary Scope:**
  1. **AI Explanation Endpoint (`src/app/api/explain/route.ts`):** Integration with Gemini API bounded by strict system prompt guardrails.
  2. **Prompt Guardrail & Output Validator (`src/lib/llm-guardrail.ts`):**
     * Enforces the 3-bullet schema (`bullet_1_hidden_friction`, `bullet_2_liquidity_horizon`, `bullet_3_neutral_baseline`).
     * Regex/heuristic anti-advisory filter that blocks subjective words (*"recommend"*, *"should buy"*, *"best choice"*).
  3. **Sandboxed Local Storage (`src/lib/storage.ts`):** Client-side `IndexedDB` wrapper managing user goals (e.g., 6-month vehicle fund) with zero remote telemetry.
  4. **Goal Volatility Heuristic:** Logic that flags when short-term capital is earmarked for illiquid or high-risk assets.
* **Contract with Other Tracks:** Receives raw math JSON from Track B, performs validation, and emits verified 3-bullet summaries to Track A.

---

## 2. Git Branching & Collaboration Protocol

### 2.1 Branch Topology

```text
main (Production-Ready / Judge-Deployable)
  │
  ├── feature/track-a-extension-ui ────► PR ──► main (Merged after smoke test)
  │
  ├── feature/track-b-math-engine ─────► PR ──► main (Merged after unit tests pass)
  │
  └── feature/track-c-llm-storage ─────► PR ──► main (Merged after guardrail validation)
```

* **`main`:** The holy grail branch. Must remain green, strictly typed, buildable, and ready to demo at any second.
* **`feature/<track-name>`:** Dedicated working branch for each engineer.

---

### 2.2 Step-by-Step Git Commands

#### Starting a New Feature / Session
```bash
# 1. Ensure main is clean and up to date
git checkout main
git pull origin main

# 2. Create and switch to your track's feature branch
git checkout -b feature/track-b-math-engine
```

#### Daily Syncing & Rebasing (Prevent Merge Hell)
```bash
# Sync local branch with latest main changes every 4-6 hours
git fetch origin
git rebase origin/main

# If conflicts occur, resolve them in files, then:
git add <resolved-file>
git rebase --continue
```

#### Pushing & Opening a Pull Request
```bash
# Push your track branch
git push -u origin feature/track-b-math-engine
```

---

### 2.3 Pull Request (PR) Policy & Quality Gates

Direct pushes to `main` are **strictly locked**. Every PR must satisfy the **Pre-Merge Checklist**:

```bash
# Mandatory Pre-Merge Local Verification:
npm run lint          # 0 ESLint errors
npm run build         # Next.js production build succeeds with 0 type errors
npm test              # All Jest math unit tests pass (100% green)
```

#### PR Self-Review Checklist:
- [ ] No `any` types in TypeScript declarations.
- [ ] No API keys, credentials, or personal secrets committed (`.env.local` in `.gitignore`).
- [ ] No mock console logs left in production loops.
- [ ] Fallback handling implemented (offline mode if API is unreachable).

---

### 2.4 Conventional Commit Standards

Commit messages must be concise, structured, and prefixed with standard conventional tags:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| `feat:` | New functional user capability | `feat(extension): implement checkout DOM mutation observer` |
| `math:` | Core financial formula or engine logic | `math(apr): implement Newton-Raphson XIRR solver for GST drag` |
| `guard:` | AI prompt guardrails or validation regex | `guard(llm): add anti-advisory heuristic token filter` |
| `ui:` | Component styling, layout, or animation | `ui(modal): add responsive 3-bullet tradeoff breakdown drawer` |
| `test:` | Adding or fixing test suites | `test(engine): add 18% GST amortization test cases` |
| `fix:` | Bug fix in existing functionality | `fix(storage): resolve IndexedDB transaction race condition` |
| `docs:` | Documentation updates | `docs(prd): update Section 50AA policy specification` |

---

## 3. High-Velocity 48-Hour Hackathon Sprint Schedule

```mermaid
gantt
    title 48-Hour Hackathon Sprint Milestones
    dateFormat  HH:mm
    axisFormat  %H:%M
    
    section Milestone 1
    Repo Setup & Shared Types Interface :00:00, 06:00
    
    section Milestone 2
    Track A: DOM Hook & POS UI Mockup   :06:00, 18:00
    Track B: Math Engine & Unit Tests   :06:00, 18:00
    Track C: Gemini Prompt & Storage     :06:00, 18:00
    
    section Milestone 3
    End-to-End Integration & Wiring     :24:00, 12:00
    Stress Testing High-Ticket Cart Scenarios :30:00, 06:00
    
    section Milestone 4
    Offline Fail-Safe Verification      :36:00, 06:00
    Pitch Deck & 90s Live Demo Rehearsal:42:00, 06:00
```

### Milestone 1: Hours 00–06 — Foundation & Interface Freeze
* [x] Initialize Next.js 14+ / TypeScript / Tailwind CSS repository.
* [x] Finalize and freeze `src/lib/types.ts` schemas (all 3 tracks agree on input/output models).
* [x] Set up Jest testing environment.
* [x] Author comprehensive documentation (`README.md`, `PRD.md`, `PROJECT_ANALYSIS.md`).

### Milestone 2: Hours 06–24 — Core Feature Build (Parallel Execution)
* **Track A:** Build Chrome Extension Manifest V3 scaffold (`content.ts`) and Next.js Point-of-Sale Studio (`src/app/page.tsx`).
* **Track B:** Implement pure mathematical engines in `src/lib/financial-engine.ts` (Effective APR, GST, Break Penalties, Real Yield) + write complete Jest test suite.
* **Track C:** Implement `/api/explain/route.ts` with Gemini API, create system prompt guardrail enforcer, and build `src/lib/storage.ts` for IndexedDB goal tracking.

### Milestone 3: Hours 24–36 — End-to-End Integration & Stress Testing
* [ ] Wire DOM Extractor $\rightarrow$ `financial-engine.ts` $\rightarrow$ `/api/explain` $\rightarrow$ `CommitGuardWidget.tsx`.
* [ ] Test Scenario 1: ₹80,000 Laptop on 12-month No-Cost EMI (verify 15.2% APR display + ₹1,438 GST drag).
* [ ] Test Scenario 2: ₹5,00,000 1-Year FD with 6-month goal conflict (verify early break penalty warning).
* [ ] Test Scenario 3: Debt Mutual Fund tax drag calculation under Section 50AA.
* [ ] Implement Goal Conflict banner when IndexedDB detects timeline mismatches.

### Milestone 4: Hours 36–48 — Demo Polish & Fail-Safe Hardening
* [ ] Implement **Offline Mock Fallback** in `/api/explain` to ensure 0% failure risk during live presentation.
* [ ] Conduct 5 dry-run rehearsals of the **90-Second Judge Demo**.
* [ ] Capture a 1080p 60fps backup screen recording of the complete workflow.
* [ ] Freeze code 4 hours before the final deadline.

---

## 4. Demo Safety Runbook & Fail-Safe Modes

During a live hackathon pitch, conference Wi-Fi latency, API quota exhaustion, or Chrome extension reload glitches can derail a presentation. CommitGuard implements a **multi-tier fail-safe architecture**.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MULTI-TIER FAIL-SAFE MATRIX                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  PRIMARY PATH: Live Gemini API (High-speed streaming narrative, <1.2s)      │
│         │                                                                   │
│         ▼ (If network times out after 1800ms OR API returns 429/500)        │
│                                                                             │
│  TIER 1 FALLBACK: Local Deterministic Template Generator                    │
│  Uses client-side rule templates populated with exact math engine outputs.  │
│  Zero network dependency. Latency: < 1ms.                                   │
│         │                                                                   │
│         ▼ (If Chrome extension is blocked on host browser during demo)       │
│                                                                             │
│  TIER 2 FALLBACK: Full-Screen Next.js Interactive POS Simulator Studio       │
│  Embedded checkout simulator running locally on http://localhost:3000.     │
│         │                                                                   │
│         ▼ (If hardware / power failure occurs)                              │
│                                                                             │
│  TIER 3 FALLBACK: High-Resolution Offline Backup Video Walkthrough          │
│  Pre-recorded 90-second MP4 demonstration showing exact user flow.          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.1 Deterministic Offline Fallback Implementation (`src/lib/llm-guardrail.ts`)

If the LLM API fails or takes $>1.8\text{s}$, the API automatically returns the deterministic template fallback:

```typescript
export function getDeterministicFallbackSummary(
  type: 'NO_COST_EMI' | 'FD_LOCKIN' | 'DEBT_MF',
  metrics: Record<string, number>
): {
  bullet_1_hidden_friction: string;
  bullet_2_liquidity_horizon: string;
  bullet_3_neutral_baseline: string;
  isFallback: boolean;
} {
  if (type === 'NO_COST_EMI') {
    return {
      bullet_1_hidden_friction: `While advertised at 0% interest, upfront processing fees (₹${metrics.processingFee || 199}) and 18% GST on interest charges (₹${metrics.totalGstDrag || 1438}) produce a true Effective APR of ${metrics.effectiveApr || 15.2}%.`,
      bullet_2_liquidity_horizon: `Committing to this ${metrics.tenureMonths || 12}-month installment locks ₹${metrics.monthlyEmi || 7303}/month, reducing your monthly liquid cashflow.`,
      bullet_3_neutral_baseline: `Paying upfront or selecting a shorter tenure eliminates ₹${metrics.totalFriction || 1637} in fee and tax friction compared to baseline yields.`,
      isFallback: true
    };
  }
  // Handlers for FD_LOCKIN and DEBT_MF...
  return {
    bullet_1_hidden_friction: `Contracted rate is subject to early withdrawal penalty of ${metrics.penaltyRate || 1.00}%.`,
    bullet_2_liquidity_horizon: `Liquidating at month ${metrics.exitMonth || 6} produces lower returns than a zero-penalty liquid fund.`,
    bullet_3_neutral_baseline: `Sovereign 91-day T-Bills provide superior capital preservation for short-term horizons.`,
    isFallback: true
  };
}
```

---

### 4.2 Live Pitch 5-Minute Setup Checklist

Complete this checklist 10 minutes before walking up to the judging table:

- [ ] **1. Server Running:** Verify `npm run dev` is active in background terminal on `http://localhost:3000`.
- [ ] **2. Chrome Extension Loaded:**
  - Open `chrome://extensions/`.
  - Enable *Developer mode* (top right toggle).
  - Click *Load unpacked* $\rightarrow$ Select `e:\CommitGuard\src\extension`.
  - Verify the CommitGuard icon is pinned in the browser toolbar.
- [ ] **3. Tabs Prepared:**
  - **Tab 1:** `http://localhost:3000` (Interactive POS Demo Studio with ₹80,000 laptop scenario).
  - **Tab 2:** Simulated Banking Deposit Booking Portal.
  - **Tab 3:** Neutral Directory & Goal Volatility sandbox view.
  - **Tab 4:** Backup Demo Video ready in VLC media player (minimized).
- [ ] **4. Network Configuration:** Set phone hotspot as primary Wi-Fi to avoid congested venue networks.
- [ ] **5. Zoom & Display:** Browser zoom set to 110% for crisp projector/laptop visibility.

---

### 4.3 90-Second Live Pitch Script for Judges

```text
[00:00 - 00:20] THE HOOK & TRACK FRAMING
"Judges, track 3 asks us to put finance where the decision happens.
Right now, every digital checkout uses frictionless design to hide expensive math.
Look at this screen: a ₹80,000 laptop with '0% No-Cost EMI'. To any consumer, this looks completely free."

[00:20 - 00:45] THE INTERCEPTION & DETERMINISTIC MATH
"Watch what happens when I click 'Proceed to Payment'.
[CLICK]
CommitGuard intercepts in under 50 milliseconds.
Look at the numbers computed in under 5ms:
This '0% loan' actually costs 15.2% Effective APR because the bank charges a ₹199 processing fee 
and 18% GST on the underlying interest every single month."

[00:45 - 01:10] AI TRANSLATOR & LOCAL PRIVACY
"Notice the 3-bullet summary: our AI doesn't give advice or pick stocks—it strictly translates 
the mathematical truth.
Furthermore, look at DevTools: ZERO network tracking. 
All goal tracking happens locally in sandboxed IndexedDB, protecting consumer privacy."

[01:10 - 01:30] CLOSING & IMPACT
"CommitGuard turns the moment of financial blindness into the moment of financial clarity.
Thank you, and we're ready for your questions!"
```

---
*End of Document — CommitGuard Team Workflow & Sprint Protocol (v1.0.0)*
