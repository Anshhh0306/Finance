# 🛡️ CommitGuard Project History & Complete Development Log

> **Repository:** [Finance (Anshhh0306/Finance)](https://github.com/Anshhh0306/Finance)  
> **Track:** Payments & Embedded Finance  
> **Artifact:** Complete Chronicle of User Prompts, Architecture Decisions, Debugging Cycles, and Implemented Features.

---

## 📌 Executive Summary

CommitGuard is an **Embedded Financial Pre-Commitment Interceptor** designed to protect consumers at the exact psychological point of financial commitment (checkout and loan agreements). Over this session, the project evolved from an initial concept into a full-scale web demo prototype and ultimately into a **real-world Manifest V3 Browser Extension** running live on Chromium/Brave across multiple commercial platforms (Flipkart, Amazon, MakeMyTrip, Cleartrip, UpGrad, and Udemy).

---

## ⏱️ Chronological Session Timeline & Milestones

### Milestone 1: Performance & Zero-Latency Blueprint (`feature/ui-smoothness`)
- **User Prompt:** Build an Apple/Stripe-tier interactive experience with spring physics, sub-2ms deterministic TypeScript math calculations, zero layout shifts, and 60 FPS slider responsiveness.
- **Deliverables:**
  - Implemented pure TypeScript financial engine (`financial-engine.ts`) with Newton-Raphson internal rate of return (IRR) solver.
  - Added spring deceleration curves (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Built real-time `<1.2ms` execution latency badge and presentation hotkeys.

### Milestone 2: High-Fidelity Web Prototype & Judge's Demo Studio (`src/app/page.tsx`)
- **User Prompt:** Build a web prototype with a persistent 3-scenario switcher for hackathon judges:
  1. **Tab 1: Embedded E-Commerce Checkout:** Intercepting No-Cost EMI on a ₹80,000 laptop, demonstrating the true statutory 18% GST drag.
  2. **Tab 2: Embedded Vehicle Catalog:** Car dealership down-payment flow exposing loan interest lock-in vs. a high-yield SIP wealth projection.
  3. **Tab 3: Neutral Institutional Directory:** Regulatory benchmark comparison (FD premature exit penalties vs. liquid funds).
- **Deliverables:**
  - Complete Next.js App Router setup with Tailwind CSS, Lucide icons, and zero backend dependencies.
  - Interactive Amortization Proof Drawer and Illusion vs. Reality comparison toggle.

### Milestone 3: Pivot to Production Browser Extension (Manifest V3)
- **User Prompt:** *"we decided to make it as extension injection. what about it?"* + *"i dont have chrome, i have brave"*
- **Architecture Requirement:** Injecting a React component into live third-party sites using a **Shadow DOM (Shadow Root)** to guarantee zero CSS bleeding between the host site and Tailwind CSS.
- **Deliverables:**
  - `src/extension/manifest.json`: Manifest V3 configuration with `activeTab`, `storage`, and host permissions.
  - `src/extension/content.tsx`: Injected content script using an open Shadow Root (`commitguard-extension-root`).
  - `src/extension/CommitGuardModal.tsx`: Tailored modal mounted inside the Shadow Root.
  - Bundled standalone unpacked build in `src/extension/build/` loaded directly into Brave via `brave://extensions`.

### Milestone 4: Event Interception & Global Event Listener Fixes
- **User Feedback:** *"well it didnt work. i clicked each thing and in the last it came on crdit card details and all."*
- **Root Cause:** Host websites (Flipkart) use complex React synthetic event listeners that capture clicks before standard bubbling listeners can trigger.
- **Solution:**
  - Implemented a **Capturing Phase Window Listener** (`window.addEventListener('click', handler, true)`).
  - Intercepts clicks at the root DOM level *before* Flipkart or Amazon scripts can execute.
  - Added `e.preventDefault()`, `e.stopPropagation()`, and `e.stopImmediatePropagation()`.
  - Added fuzzy keyword recognition for checkout buttons (`place order`, `buy with emi`, `proceed to pay`, `continue with emi`).

### Milestone 5: Slider Alignment & Cancel/Proceed Isolation
- **User Feedback:** *"great work its showing but the slider is having a bit of problem. noit showiung correct place of emi tenure and fix it in a way where the cancel actually lets the user stay in same page because it anyways goes to next page do it cancel or proceed, i want the user gets thye chance to modify"*
- **Fixes Applied:**
  - **Single-Row Horizontal Slider Steps:** Converted grid layout to an explicit flex row (`display: flex; flex-direction: row; justify-content: space-between;`) with clickable step buttons (`3m`, `6m`, `9m`, `12m`, `18m`, `24m`) perfectly aligned with the range input.
  - **Decoupled Button Actions:**
    - **Cancel & Modify Terms:** Closes the modal and completely stops event propagation, leaving the user on the existing page so they can change cards or terms.
    - **I Understand, Proceed:** Marks element with `data-commitguard-authorized="true"`, dismisses modal, and triggers the intended checkout forward navigation.

### Milestone 6: Live Product Price & DOM Offer Scraper
- **User Prompt:** *"first of all tell me that our extension is able to read the price or jnot? or is it using dummy data? MAKE IT SOMEHOW IT SEES AND GIVES IT SACCORDING TO IT. also tell me that the option we are showing of 6m or 12m or 24m is like caj it work? because there is fixed price of 5166/m so let me know"*
- **Deliverables:**
  - Replaced dummy fallback data with a dynamic DOM scraper (`extractProductInfo`).
  - Scrapes title tags (`h1`, `span.B_NuCI`, `.VU-ZEz`), current selling price (`div.Nx9bqj`), and EMI rates (`₹X,XXX/m`).
  - Passes real live page price (e.g. ₹5,399, ₹70,196, ₹92,990) directly into the mathematical calculations.

### Milestone 7: Payment Offer Intel Engine (Good vs. Bad Rating Matrix)
- **User Prompt:** *"now if you see antigravity its working with live. But the problem is there are lot of stuff happening on that page and i want that it scraps all the details when the user chooses pay with emi or normal buy option and in it the extension shows which offer is good and what is bad too for the user according to its likabilit. there is like pay with axis card or something like that or AU card... so the user knows what to use while choosing as welll"*
- **Deliverables:**
  - Built a 2-tab view in `CommitGuardModal.tsx`:
    1. **Card & Payment Intel (Best vs Worst)**
    2. **No-Cost EMI Friction & Amortization Breakdown**
  - Grades live offers:
    - 🟢 **Flipkart Axis Bank Card (`RECOMMENDED: BEST VALUE`):** Gives instant 5% statement cashback with ₹0 GST and ₹0 loan drag.
    - 🟢 **UPI / Direct Debit (`BEST FOR ZERO DEBT`):** Zero interest, zero processing fee, keeps credit limit 100% free.
    - 🔵 **AU Small Finance Bank (`GOOD OFFER`):** Instant 10% discount upfront.
    - 🔴 **No-Cost EMI (`AVOID: HIDDEN CHARGES`):** Exposes hidden ₹199 processing fee + statutory 18% GST drag on monthly interest tranches.
    - 🟡 **SuperCoins Plus:** Stacks bonus loyalty coins.

### Milestone 8: Multi-Surface Expansion & Friction Compounding Matrix
- **User Prompt:** Expand CommitGuard to non-financial platforms:
  - Travel: MakeMyTrip, Cleartrip
  - Ed-Tech: UpGrad
  - Add Friction Recovery & Compounding Matrix (7.10% Sovereign T-Bill wealth projection).
- **Deliverables:**
  - Updated `manifest.json` host permissions for all target domains.
  - Added **Friction Recovery & Compounding Matrix** under the slider, showing 1-Year, 3-Year, and 5-Year compounded gains from investing preserved fees into RBI 364-Day T-Bills.
  - **Travel (MakeMyTrip / Cleartrip):** "Travel Now Pay Later" reality check exposing 24%–36% penalty APRs and offering a 6-month Liquid SIP alternative.
  - **Ed-Tech (UpGrad):** Education Loan subvention truth exposing 4.5% merchant markups.

### Milestone 9: Udemy Support & Decimal Currency Parser Fix
- **User Prompt:** *"make one for udemy"* followed by *"showing wrong in udemy"* (with screenshot showing course price `₹539.00` vs `₹3,439.00` mistakenly displaying as `₹47,900`).
- **Root Cause & Fix:**
  - Udemy formats currency with decimals (`₹539.00`). Stripping non-numeric characters removed the period, reading `539.00` as `53900` or pulling catalog elements.
  - Created `parseCurrencyNumber()` using strict regex `/[₹$€£]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/` to preserve exact decimal places.
  - Targeted the scraper to the active `Buy individual course` container.
  - Added Udemy-specific impulse buy warning exposing artificial countdown timers and statistics showing over 87% of self-paced courses go uncompleted.

---

## 🛠️ Complete Technical Stack & Architecture

| Layer | Technologies Used | Key Purpose |
| :--- | :--- | :--- |
| **Browser Extension** | Chrome Manifest V3, Webpack / esbuild | Injected browser script running inside Brave & Chrome |
| **CSS Isolation** | Shadow DOM (`attachShadow({ mode: 'open' })`) | Complete style isolation preventing host CSS bleed |
| **Component UI** | React 18, Tailwind CSS, Lucide React | Hyper-minimalist, responsive financial cards |
| **Mathematical Engine** | TypeScript (`src/lib/financial-engine.ts`) | Newton-Raphson IRR solver, statutory 18% GST calculator |
| **Web Demo App** | Next.js 14 (App Router), TypeScript | Standalone demo studio for hackathon judges |
| **Live DOM Scraper** | Custom Mutation & Event Capturing Listeners | Universal regex-driven price and button trigger parser |

---

## 📁 Repository File Structure

```
Finance/
├── docs/                                # Technical specs & documentation
│   └── TECH_STACK.md
├── src/
│   ├── app/                             # Next.js Web App Prototype
│   │   ├── page.tsx                     # 3-Tab Scenario Switcher
│   │   ├── layout.tsx                   # Safe-harbor compliance layout
│   │   └── globals.css
│   ├── components/                      # Reusable React UI widgets
│   │   ├── InterceptorModal.tsx
│   │   └── ScenarioSwitcher.tsx
│   ├── extension/                       # Manifest V3 Extension Source
│   │   ├── manifest.json                # Root extension manifest
│   │   ├── content.tsx                  # Universal DOM injector & scraper
│   │   ├── CommitGuardModal.tsx         # Multi-surface React modal in Shadow DOM
│   │   ├── background.ts                # MV3 service worker
│   │   ├── styles.css                   # Tailwind styles for Shadow DOM
│   │   └── build/                       # Unpacked distribution loaded in Brave
│   │       ├── manifest.json
│   │       ├── content.js
│   │       ├── background.js
│   │       └── styles.css
│   └── lib/                             # Mathematical & Core Engine
│       ├── financial-engine.ts          # Deterministic IRR & GST calculations
│       └── types.ts
├── tests/
│   └── engine.test.ts                   # 5-suite mathematical test suite
├── package.json                         # Build scripts & dependencies
└── PROJECT_CHAT_HISTORY.md             # Complete project log & conversation history
```

---

## 🧪 Deterministic Mathematical Test Results

All 5 core engine test suites pass with 100% deterministic precision:
1. **No-Cost EMI Amortization (₹80,000 / 12 Months):** Verified 19.93% Effective APR and ₹1,339.65 hidden GST/fee drag.
2. **FD Premature Exit Penalty (₹5,00,000 at Month 6):** Verified ₹5,848.10 net loss vs. zero-penalty liquid fund.
3. **Post-Tax Real Yield (7.20% yield, 30% tax, 5.50% inflation):** Verified -0.44% negative real yield.
4. **Section 50AA Regulatory Tax Triggers:** Verified automatic indexation alerts for debt mutual funds.
5. **Anti-Advisory Heuristic Scanner:** Passed safe-harbor legal compliance checks.

---

## 🏆 Summary of User Requests & Solutions Implemented

| # | User Request Summary | Solution & Commit Reference |
| :---: | :--- | :--- |
| **1** | Build CommitGuard web prototype with 3-tab scenario switcher | Created Next.js App Router prototype with live amortization tables (`1c84dbc`) |
| **2** | Convert into a real Manifest V3 browser extension | Implemented content script injecting React via Shadow DOM (`9572cc6`, `26d1627`) |
| **3** | Extension doesn't intercept on Flipkart checkout | Added root capturing event listener (`window.addEventListener(..., true)`) (`90e6145`) |
| **4** | Tenure slider buttons stacked; Cancel button advances page | Replaced grid with flex row; separated Cancel (stops propagation) from Proceed (`91119c4`) |
| **5** | Read real page price instead of dummy data | Implemented live DOM scraper reading Flipkart/Amazon title & price tags (`7599d51`) |
| **6** | Scrape available offers and show Best vs. Worst cards | Built Card Offer Intel Matrix evaluating Axis Bank 5% cashback vs. EMI drag (`4e40d69`) |
| **7** | Add T-Bill compounding matrix & scale to Travel and Ed-Tech | Added MakeMyTrip, Cleartrip, UpGrad matches, TNPL checks & T-Bill compounding (`5fda700`) |
| **8** | Add Udemy support | Added `udemy.com` host permissions, buy triggers & impulse counter-measures (`a81a356`) |
| **9** | Fix wrong price display on Udemy (`₹47,900` instead of `₹539.00`) | Fixed decimal currency parsing (`parseCurrencyNumber`) and scoped to buy box (`2c6cf78`) |

---
*Created and committed automatically to `main` branch.*
