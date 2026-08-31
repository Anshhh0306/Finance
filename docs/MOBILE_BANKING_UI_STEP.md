# 📱 Step 2: Mobile Banking Dashboard & Symbols Implementation

**Component:** [`src/components/MobileBankingPage.tsx`](../src/components/MobileBankingPage.tsx)  
**Symbols:** [`src/components/symbols/BankingSymbols.tsx`](../src/components/symbols/BankingSymbols.tsx)  
**Live URL:** `http://localhost:3000` (Default active view)

---

## 🎨 Design Breakdown Matching Reference Screenshot

### 1. Viewport & Background Theme
* **Canvas:** Clean white (`#ffffff`) card container with soft rounded corners (`rounded-[36px]`) and realistic device drop shadow (`shadow-2xl`).
* **Outer Background:** Clean slate (`#f8fafc`), removing all dark neon radial glows.

### 2. Top App Bar & Profile
* Top row with user avatar (`AD` in circular badge).
* Actions: Search icon (`Search`), Support headset (`Headphones`), and Logout (`LogOut`).

### 3. Savings Account Balance Section
* Header text: `Savings Account Balance`.
* Main balance: `₹•••` with an interactive eye toggle button (`Eye` / `EyeOff`) to reveal `₹2,48,750`.
* Button: `Manage Savings Account` in a soft grey pill.

### 4. 4x2 Quick Action Grid (Custom Normal Symbols)
Eight circular red action buttons (`#e53935` / `#d32f2f`) with custom SVG icons:
1. **Money Transfer:** Rupee glyph with bidirectional cashflow arrows.
2. **BHIM UPI:** Double-triangle lightning UPI glyph.
3. **Mobile Recharge:** Smartphone with rupee screen.
4. **FD/RD:** Safe locker with green indicator badge (Interception point).
5. **Bill Pay:** Invoice bill document with payment arrow.
6. **Debit Card:** Plastic chip card with contactless curves.
7. **Account Statement:** Ledger receipt document.
8. **OneTrack:** Score monitor glyph.
* Footer link: `Manage Shortcuts >`.

### 5. Credit Health Banner (OneTrack)
* Deep indigo card (`bg-gradient-to-br from-[#1e1b4b] to-[#312e81]`).
* Headline: `Know your credit health` with `Check your score today with CommitGuard on-device privacy`.
* Score Card: Prominent `782` with an `Excellent` green pill.

### 6. Bottom Navigation Bar
* `Home` (Active tab with home icon).
* `Pay` (Card icon).
* **Floating Center QR Scan Button:** Large navy circular action button (`#1e1b4b`) elevated with shadow and white border.
* `Services` (Temple/bank icon).
* `Apply` (Pencil/apply icon).

### 7. Embedded Interceptor Integration (Point-of-Sale Hook)
* Tapping **FD/RD** or **Money Transfer** triggers the CommitGuard decision clarity bottom sheet modal (`CommitGuardWidget.tsx`), showing true Effective APR, GST friction, and trade-off bullets.

---

## 📝 How to Customize or Change Any Element

You can request modifications to any of the following items:

| Element | Location | What Can Be Changed |
| :--- | :--- | :--- |
| **Balance Amount** | `MobileBankingPage.tsx:57` | Default masked/unmasked value, currency symbol. |
| **Grid Actions** | `MobileBankingPage.tsx:84-180` | Number of columns, icon colors (change `#e53935` to custom hex), titles. |
| **Icons / Symbols** | `BankingSymbols.tsx:1-98` | SVG paths, stroke width, size. |
| **Score Banner** | `MobileBankingPage.tsx:190-220` | Score value (`782`), gradient colors, banner text. |
| **Bottom Nav Items**| `MobileBankingPage.tsx:235-290` | Tab names, icons, active state color. |
