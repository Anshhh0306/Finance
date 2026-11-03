# CommitGuard

A Chrome extension that shows the real cost of a payment option at the moment you click **Pay**, on Amazon.in, Flipkart, MakeMyTrip and Udemy.

"No-Cost EMI" is rarely free. The merchant discounts the bank's interest, but a processing fee and 18% GST on the fee and on every month's interest are still added. CommitGuard holds the checkout click, reads the price and payment options off the page, prices each option with a tested finance engine, and lets you continue or change your mind.

![CommitGuard on a Flipkart checkout:](docs/commitguard-intro.mp4)


<sub>Video of the built extension running on a recreated checkout page.</sub>

## What it shows

- **True cost of the selected option**, e.g. a ₹9,982 phone on a 12-month "No-Cost" EMI really costs ₹10,355.
- **Effective APR** of that EMI (25.24% here), with a tenure slider and the month-by-month schedule.
- **Every other way to pay**, priced all-in: UPI, the store's co-branded card cashback, bank offers, pay-later plans.
- **Credit limit impact**: an EMI blocks the full amount on the card, which can push utilization over 30% or 50% and dent a CIBIL score.
- **Card reward check**: the cashback or points your card earns when paying in full, all forfeited on EMI. Rates for 13 Indian cards, remembered with `chrome.storage.sync`.
- **GST invoice tip** for business purchases over ₹5,000, where input tax credit can be claimed.

## How it works

```
click "Pay" ──► intercept.ts ──► scrape.ts ──► sites/<site>.ts ──► offers.ts ──► modal/
 (capture        recognises the    picks the      reads price,       prices each      React UI in
  phase)         final commit      site scraper   name, options,     option with      a shadow root
                 button            selection      lib/finance.ts
```

- **Interception.** A capture-phase click listener on `window` runs before the site's handlers. It only reacts to final commit buttons ("Place order", "Pay ₹…", "Continue with EMI"); choosing a bank, card or tenure never triggers it. On **Continue** the original click is replayed. Buttons with `javascript:` links get a dispatched click event, since following the link directly is blocked by the site's content security policy.
- **Scraping.** Each site's markup changes often and its class names are obfuscated, so every value is read in layers. The price checks the clicked button first, then labelled totals, known selectors and structured data, and finally a cached value from earlier checkout steps. The selected payment option comes from the clicked row or whichever option is checked.
- **Isolation.** Tailwind is compiled at build time and injected as a `<style>` into an open shadow root, so the site's CSS can't restyle the modal and the modal's styles can't leak into the site.
- **Math.** All amounts come from [`src/lib/finance.ts`](src/lib/finance.ts): pure, deterministic functions covered by unit tests.
- **Privacy.** No network calls and no analytics. The only thing kept between visits is your card choice; prices are cached per tab so multi-step checkouts keep their total.

### The effective APR of a "No-Cost" EMI

On a No-Cost EMI the instalments add up to the sticker price, so the bank lends their present value at its own rate. The merchant covers the gap as an upfront discount. The buyer receives that loan minus the upfront fee, then pays each instalment plus GST on that month's interest. The effective APR is the IRR of those cash flows, solved with Newton–Raphson:

$$\sum_{t=0}^{n} \frac{CF_t}{(1+r)^t} = 0, \qquad \text{APR}_{\text{effective}} = (1+r)^{12} - 1$$

For the ₹9,982 phone over 12 months at the bank's 15%, the merchant discount is ₹765.90. The buyer still pays the ₹199 fee, ₹35.82 GST on it and ₹137.85 GST on the interest: ₹372.67 more, a **25.24%** effective APR on a "0%" loan.

## Getting started

Requires Node.js 22 or later.

```bash
npm install
npm run build        # bundles the extension into dist/extension
```

In Chrome, open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and pick `dist/extension`. Then go to a checkout on one of the supported sites; a "CommitGuard" button also opens it on demand.

```bash
npm test             # 27 unit tests (node:test)
npm run typecheck    # strict TypeScript, no unused code
```

## Project structure

```
src/
├── lib/
│   ├── finance.ts          No-Cost and regular EMI costs, effective APR, credit utilization, rewards
│   └── card-rewards.ts     Reward rates per spend category for 13 Indian credit cards
└── extension/
    ├── content.ts          Entry: holds the commit click, opens the modal, replays the click
    ├── intercept.ts        Recognises the final commit button
    ├── scrape.ts           Picks the scraper for the current site
    ├── sites/              Amazon, Flipkart, MakeMyTrip and Udemy scrapers
    ├── offers.ts           Builds each payment option with its all-in cost
    ├── dom.ts              Amount parsing and DOM-reading helpers
    ├── mount.tsx           Renders the modal in a shadow root
    ├── launcher.ts         The on-demand "CommitGuard" button
    ├── modal/              React UI
    └── manifest.json       Manifest V3; only the storage permission
tests/                      Engine and offer tests
scripts/build-extension.mjs esbuild + Tailwind build
```
## Limitations

- Checkout markup changes often, so a site update can break a scraper until its selectors are updated.
- When a page doesn't show the lender's interest rate, the math assumes 15% a year, a common card EMI rate.
- The CIBIL impact is a rough estimate, and card reward rates were checked in September 2026.
- CommitGuard explains costs; it is not financial advice.

## Background

Built for a hackathon: Track 3, Payments & Embedded Finance, Problem 7, "Finance Where the Decision Happens". The idea is to put the money decision inside the checkout where it's made, instead of in a separate app opened afterwards.

**Stack:** TypeScript, React 18, Tailwind CSS, esbuild, Chrome Manifest V3, `node:test`. The video uses Remotion 4, React 19 and the ElevenLabs API.
