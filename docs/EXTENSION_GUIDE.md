# 🛡️ CommitGuard Manifest V3 Chrome Extension Guide

## Overview
CommitGuard operates in **two coordinated modes**:
1. **The Web Prototype (`http://localhost:3000`):** An embedded zero-friction simulation for hackathon judges with Scenario Switchers (E-Commerce EMI, Vehicle Loan vs SIP, and Neutral Public Rate Directory).
2. **The Real Chrome Extension (`src/extension`):** Injected directly into live checkout flows (Amazon, Flipkart) via a **Shadow DOM (Shadow Root)**.

---

## 🏗️ Architecture: Why Shadow DOM is Mandatory

When injecting a React application into third-party e-commerce sites:
- **Host Style Bleed-Through:** Amazon or Flipkart CSS defines global overrides for `h1`, `button`, `div`, and `.modal`, which break Tailwind classes.
- **Shadow Root Solution:** We attach a Shadow Root to a dedicated host element (`#commitguard-extension-root`):
  ```ts
  const host = document.createElement('div');
  const shadowRoot = host.attachShadow({ mode: 'open' });
  ```
- **Scoped Tailwind Injection:** Tailwind utility classes and stylesheets are injected directly into the Shadow Root, guaranteeing 100% style encapsulation.

---

## 📂 Extension Files Structure

- **[`manifest.json`](file:///c:/Users/ROSHNI/OneDrive/Documents/GitHub/Finance/src/extension/manifest.json):** Manifest V3 manifest declaring background service workers, storage/activeTab permissions, and host permissions for `*://*.amazon.in/*` and `*://*.flipkart.com/*`.
- **[`content.tsx`](file:///c:/Users/ROSHNI/OneDrive/Documents/GitHub/Finance/src/extension/content.tsx):** The DOM MutationObserver that monitors the checkout buttons, creates the Shadow Root, injects styles, and mounts the React modal.
- **[`CommitGuardModal.tsx`](file:///c:/Users/ROSHNI/OneDrive/Documents/GitHub/Finance/src/extension/CommitGuardModal.tsx):** The frosted-glass interceptor modal containing:
  - 3-bullet plain-English translation of hidden costs.
  - 19.93% Effective APR and GST friction metrics.
  - Interactive EMI tenure slider with instant `<1.2ms` recalculation.
  - Deterministic monthly amortization proof schedule.
  - `Close & Proceed` button to allow checkout continuation.
- **[`background.ts`](file:///c:/Users/ROSHNI/OneDrive/Documents/GitHub/Finance/src/extension/background.ts):** Service worker managing telemetry counters (`interceptionsCount`, `frictionPreventedRupees`).
- **[`styles.css`](file:///c:/Users/ROSHNI/OneDrive/Documents/GitHub/Finance/src/extension/styles.css):** Tailored CSS sheet injected inside the Shadow Root.
- **[`vite.config.ts`](file:///c:/Users/ROSHNI/OneDrive/Documents/GitHub/Finance/vite.config.ts):** CRXJS Vite plugin configuration for hot-reloading the MV3 extension.

---

## 🚀 How to Load the Extension in Chrome (Developer Mode)

1. Open Google Chrome and navigate to:
   ```
   chrome://extensions
   ```
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the directory:
   ```
   c:\Users\ROSHNI\OneDrive\Documents\GitHub\Finance\src\extension
   ```
5. Navigate to any Amazon India (`amazon.in`) or Flipkart (`flipkart.com`) checkout page with an item in cart.
6. When selecting No-Cost EMI or clicking **Place Order / Proceed to Pay**, CommitGuard intercepts the action with the Shadow DOM modal.
