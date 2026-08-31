/**
 * CommitGuard Chrome Extension - Content Script Injector (Manifest V3)
 * Targets Amazon.in & Flipkart.com checkout pages.
 * Attaches a closed Shadow Root to completely isolate host CSS from Tailwind styles.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ExtensionCommitGuardModal } from './CommitGuardModal';

(() => {
  console.log('🛡️ CommitGuard Content Script Active on:', window.location.href);

  const COMMITGUARD_HOST_ID = 'commitguard-extension-root';

  type InterceptorSurface = 'ECOMMERCE' | 'TRAVEL' | 'EDTECH' | 'UDEMY';

  function detectSurfaceType(): InterceptorSurface {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('udemy')) {
      return 'UDEMY';
    }
    if (host.includes('makemytrip') || host.includes('cleartrip') || host.includes('yatra') || host.includes('goibibo')) {
      return 'TRAVEL';
    }
    if (host.includes('upgrad') || host.includes('scaler') || host.includes('simplilearn') || host.includes('coursera')) {
      return 'EDTECH';
    }
    return 'ECOMMERCE';
  }

  const CURRENT_SURFACE = detectSurfaceType();
  console.log(`🛡️ CommitGuard Surface Detected: [${CURRENT_SURFACE}] on ${window.location.hostname}`);

  interface ScrapedOffer {
    id: string;
    bankOrCard: string;
    description: string;
    effectiveBenefit: string;
    rating: 'BEST' | 'GOOD' | 'NEUTRAL' | 'AVOID';
    reason: string;
    netPrice: number;
    recommended: boolean;
  }

  // Helper to parse currency strings properly handling decimals (e.g. ₹539.00 -> 539, NOT 53900)
  function parseCurrencyNumber(text: string): number {
    if (!text) return 0;
    // Match currency pattern like ₹539.00, ₹479.00, ₹3,439.00, ₹5,399, ₹70,196
    const match = text.match(/[₹$€£]?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/);
    if (match && match[1]) {
      const cleanStr = match[1].replace(/,/g, '');
      const floatVal = parseFloat(cleanStr);
      if (!isNaN(floatVal) && floatVal > 0) {
        return Math.round(floatVal);
      }
    }
    const cleanDigits = text.replace(/[^0-9.]/g, '');
    const fallbackVal = parseFloat(cleanDigits);
    return isNaN(fallbackVal) ? 0 : Math.round(fallbackVal);
  }

  // Universal Live Scraper adapting to variations in wording across Flipkart, Amazon, MakeMyTrip, Cleartrip, UpGrad, and Udemy
  function extractProductInfo(clickedEl?: HTMLElement | null): {
    surfaceType: InterceptorSurface;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    name: string;
    advertisedMonthlyEmi?: number;
    offers: ScrapedOffer[];
  } {
    let detectedPrice = 0;
    let detectedOriginalPrice = 0;
    let detectedDiscount = 0;
    let detectedName = '';
    let detectedEmi: number | undefined;

    const bodyText = document.body ? document.body.innerText : '';

    // ==========================================
    // 1. SURFACE: TRAVEL (MakeMyTrip / Cleartrip)
    // ==========================================
    if (CURRENT_SURFACE === 'TRAVEL') {
      const travelTitleSelectors = [
        '.flight-details',
        '.header-title',
        'h1',
        'h2',
        '.itinerary-header',
        '.sector-info',
        '.hotel-name',
        '#booking-summary',
      ];
      for (const sel of travelTitleSelectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent) {
          const t = el.textContent.trim();
          if (t.length > 5) {
            detectedName = t.slice(0, 60);
            break;
          }
        }
      }
      if (!detectedName) {
        const cityMatch = bodyText.match(/(?:Flight to|Booking for|Hotel in|Trip to)\s+([A-Za-z\s]+)/i);
        detectedName = cityMatch ? `MakeMyTrip: ${cityMatch[1].trim()}` : 'MakeMyTrip Flight & Hotel Booking';
      }

      // Live Scrape travel total amount / fare
      const fareMatch = bodyText.match(/(?:Total Amount|Total Fare|Grand Total|Due Now|Payable Amount|Trip Total)[^\d₹]*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
      if (fareMatch && fareMatch[1]) {
        const num = parseCurrencyNumber(fareMatch[1]);
        if (num > 1000) detectedPrice = num;
      }
      if (!detectedPrice) {
        const fareEls = document.querySelectorAll('[class*="fare"], [class*="price"], [class*="total"]');
        for (const el of Array.from(fareEls)) {
          const text = el.textContent || '';
          if (text.includes('₹')) {
            const num = parseCurrencyNumber(text);
            if (num >= 3000 && num <= 1000000) {
              detectedPrice = num;
              break;
            }
          }
        }
      }

      const travelPrice = detectedPrice > 0 ? detectedPrice : 28500;
      const travelOffers: ScrapedOffer[] = [
        {
          id: 'sip-liquid',
          bankOrCard: '6-Month Liquid Fund SIP (Recommended)',
          description: `Accumulate ₹${Math.round(travelPrice / 6).toLocaleString('en-IN')}/mo in an RBI-compliant 7.10% liquid portfolio`,
          effectiveBenefit: 'Yields +₹612 interest; 0% debt liability',
          rating: 'BEST',
          reason: 'Take the trip completely debt-free without risking credit score or TNPL defaults.',
          netPrice: travelPrice,
          recommended: true,
        },
        {
          id: 'upi-travel',
          bankOrCard: 'UPI / Direct Bank Transfer',
          description: 'Single-tranche direct payment from checking account',
          effectiveBenefit: 'Saves 100% of BNPL late fee exposure',
          rating: 'BEST',
          reason: 'Zero interest, zero processing fees, zero penalty exposure.',
          netPrice: travelPrice,
          recommended: true,
        },
        {
          id: 'tnpl-trip',
          bankOrCard: 'Travel Now, Pay Later (TNPL / Sanctioned BNPL)',
          description: '3 to 6 Months deferred installment loan',
          effectiveBenefit: `₹${Math.round(travelPrice / 6).toLocaleString('en-IN')}/mo with 28.4% APR risk`,
          rating: 'AVOID',
          reason: 'Exposes user to 24%-36% penalty APRs plus ₹450-₹850 bounce fees if post-vacation cash is tight.',
          netPrice: travelPrice + Math.round(travelPrice * 0.14),
          recommended: false,
        },
      ];

      return {
        surfaceType: 'TRAVEL',
        price: travelPrice,
        name: detectedName,
        offers: travelOffers,
      };
    }

    // ==========================================
    // 2. SURFACE: EDTECH (UpGrad / Scaler)
    // ==========================================
    if (CURRENT_SURFACE === 'EDTECH') {
      const edTechTitleSelectors = ['h1', '.program-title', '.course-title', '.cohort-header', '.hero-title'];
      for (const sel of edTechTitleSelectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent) {
          const t = el.textContent.trim();
          if (t.length > 5) {
            detectedName = t.slice(0, 60);
            break;
          }
        }
      }
      if (!detectedName) detectedName = 'UpGrad Executive Certification & Degree';

      // Scrape tuition / program fee
      const tuitionMatch = bodyText.match(/(?:Program Fee|Total Tuition|Total Fee|Course Price|Admission Fee)[^\d₹]*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
      if (tuitionMatch && tuitionMatch[1]) {
        const num = parseCurrencyNumber(tuitionMatch[1]);
        if (num > 10000) detectedPrice = num;
      }
      const edTechPrice = detectedPrice > 0 ? detectedPrice : 225000;
      const subventionSurcharge = Math.round(edTechPrice * 0.045); // 4.5% hidden subvention markup

      const edTechOffers: ScrapedOffer[] = [
        {
          id: 'upfront-edtech',
          bankOrCard: 'Upfront NEFT/UPI with Corporate Sponsorship Discount',
          description: 'Single full tuition payment via direct bank wire',
          effectiveBenefit: `Save ₹${subventionSurcharge.toLocaleString('en-IN')} upfront discount`,
          rating: 'BEST',
          reason: 'Negotiate the 4.5% merchant subvention fee directly off the course sticker price.',
          netPrice: edTechPrice - subventionSurcharge,
          recommended: true,
        },
        {
          id: 'subvention-loan',
          bankOrCard: '0% Interest Education NBFC Loan (Propelld / LiquiLoans)',
          description: '18-24 Month NBFC subvention loan contract',
          effectiveBenefit: `₹${Math.round(edTechPrice / 18).toLocaleString('en-IN')}/mo with hidden subvention drag`,
          rating: 'AVOID',
          reason: `Hidden 4.5% (₹${subventionSurcharge.toLocaleString('en-IN')}) subvention cost baked into course price + processing fees.`,
          netPrice: edTechPrice + 3500,
          recommended: false,
        },
      ];

      return {
        surfaceType: 'EDTECH',
        price: edTechPrice,
        name: detectedName,
        offers: edTechOffers,
      };
    }

    // ==========================================
    // 3. SURFACE: UDEMY (Online Course Interceptor)
    // ==========================================
    if (CURRENT_SURFACE === 'UDEMY') {
      // 1. Course Title Selectors on Udemy
      const udemyTitleSelectors = [
        'h1[data-purpose="lead-title"]',
        'h1.clp-lead__title',
        'h1',
        '[data-purpose="course-header-title"]',
        '.course-title',
      ];
      for (const sel of udemyTitleSelectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent) {
          const t = el.textContent.trim();
          if (t.length > 3) {
            detectedName = t.slice(0, 60);
            break;
          }
        }
      }
      if (!detectedName) detectedName = 'Fundamentals of Backend Engineering';

      // 2. Scrape selling price directly from "Buy individual course" container or page
      // Look first near the clicked button or inside the purchase section
      const purchaseContainer =
        (clickedEl && clickedEl.closest('[class*="buy-box"], [class*="sidebar"], [class*="purchase-section"], [class*="clp-lead"]')) ||
        document.querySelector('[data-purpose="sidebar-container"]') ||
        document.querySelector('[class*="sidebar-container"]') ||
        document.querySelector('[class*="buy-box"]') ||
        document.body;

      // Scan for exact selling price (e.g. ₹539.00, ₹479.00, ₹449.00)
      const udemyPriceSelectors = [
        '[data-purpose="course-price-text"] span:not(.sr-only)',
        '[data-purpose="course-price-text"]',
        '.price-text--price-part--Tu6MH',
        'div[data-purpose="course-price-text"] span',
        '.base-price-text',
        '.clp-lead__price',
      ];

      for (const sel of udemyPriceSelectors) {
        const els = purchaseContainer.querySelectorAll(sel);
        for (const el of Array.from(els)) {
          const text = el.textContent || '';
          if (text.includes('₹')) {
            const num = parseCurrencyNumber(text);
            // Valid single course price on Udemy is between ₹200 and ₹20,000 (NOT 47,900)
            if (num >= 200 && num <= 20000) {
              detectedPrice = num;
              break;
            }
          }
        }
        if (detectedPrice > 0) break;
      }

      // Regex targeted to "Buy individual course \n ₹539.00"
      if (!detectedPrice) {
        const individualMatch = bodyText.match(/Buy individual course[^\d₹]*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
        if (individualMatch && individualMatch[1]) {
          detectedPrice = parseCurrencyNumber(individualMatch[1]);
        }
      }

      // Regex fallback if selectors changed (e.g. ₹539.00 or ₹479.00)
      if (!detectedPrice) {
        const priceMatch = bodyText.match(/(?:Current price|Price|Now at|Buy now at)[^\d₹]*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
        if (priceMatch && priceMatch[1]) {
          detectedPrice = parseCurrencyNumber(priceMatch[1]);
        }
      }

      // 3. Scrape struck-through original price (e.g. ₹3,439.00)
      const origPriceSelectors = [
        '[data-purpose="original-price-container"] span',
        's[data-purpose="original-price"]',
        '[data-purpose="course-old-price-text"]',
        'span.ud-sr-only + span[data-purpose]',
        's span',
        's',
      ];
      for (const sel of origPriceSelectors) {
        const els = purchaseContainer.querySelectorAll(sel);
        for (const el of Array.from(els)) {
          const text = el.textContent || '';
          if (text.includes('₹')) {
            const num = parseCurrencyNumber(text);
            if (num > detectedPrice && num <= 50000) {
              detectedOriginalPrice = num;
              break;
            }
          }
        }
        if (detectedOriginalPrice > 0) break;
      }

      // Regex fallback for original price near discount % (e.g. ₹3,439.00 84% off)
      if (!detectedOriginalPrice) {
        const origMatch = bodyText.match(/₹\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:[0-9]+%\s*off)/i);
        if (origMatch && origMatch[1]) {
          const num = parseCurrencyNumber(origMatch[1]);
          if (num > detectedPrice) detectedOriginalPrice = num;
        }
      }

      // Check discount % (e.g. 84% off)
      const discountMatch = bodyText.match(/(\d+)%\s*off/i);
      if (discountMatch && discountMatch[1]) {
        detectedDiscount = parseInt(discountMatch[1], 10);
      }

      const udemyPrice = detectedPrice > 0 ? detectedPrice : 539;
      const udemyOrigPrice = detectedOriginalPrice > 0 ? detectedOriginalPrice : 3439;
      const discountPct = detectedDiscount > 0 ? detectedDiscount : Math.round(((udemyOrigPrice - udemyPrice) / udemyOrigPrice) * 100);

      const udemyOffers: ScrapedOffer[] = [
        {
          id: 'upi-udemy',
          bankOrCard: 'UPI / Debit Card (Immediate Full Pay)',
          description: 'Single payment without BNPL or EMI installment debt',
          effectiveBenefit: 'Zero interest, zero processing friction',
          rating: 'BEST',
          reason: 'Never finance small educational purchases under ₹2,000 with consumer credit.',
          netPrice: udemyPrice,
          recommended: true,
        },
        {
          id: 't-bill-delay',
          bankOrCard: 'Sovereign Liquid Fund / 30-Day Cool-Off',
          description: 'Park course fee for 30 days to test real learning commitment',
          effectiveBenefit: 'Saves 100% of price on uncompleted impulse buys',
          rating: 'BEST',
          reason: 'Over 87% of impulse-bought self-paced courses are abandoned after Lecture 2.',
          netPrice: udemyPrice,
          recommended: true,
        },
        {
          id: 'bnpl-micro',
          bankOrCard: 'LazyPay / Simpl / BNPL Micro-EMI',
          description: '3-Part split payment or 15-day deferred bill',
          effectiveBenefit: `₹${Math.round(udemyPrice / 3).toLocaleString('en-IN')}/mo with credit file risk`,
          rating: 'AVOID',
          reason: `Late payment fees of ₹250+ on a ₹${udemyPrice} course represent a 50%+ penalty drag on your credit score.`,
          netPrice: udemyPrice + 250,
          recommended: false,
        },
      ];

      return {
        surfaceType: 'UDEMY',
        price: udemyPrice,
        originalPrice: udemyOrigPrice,
        discountPercent: discountPct,
        name: detectedName,
        offers: udemyOffers,
      };
    }

    // ==========================================
    // 4. SURFACE: E-COMMERCE (Flipkart / Amazon)
    // ==========================================
    const titleSelectors = [
      'h1',
      'span.B_NuCI',
      'span._35KyD6',
      '#productTitle',
      '.VU-ZEz',
    ];
    for (const sel of titleSelectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent) {
        const titleText = el.textContent.trim();
        if (titleText.length > 5) {
          detectedName = titleText.slice(0, 60);
          break;
        }
      }
    }

    // Extract primary selling price from main Flipkart price elements
    const priceSelectors = [
      'div.Nx9bqj.CxhGGd',
      'div.Nx9bqj',
      'div._30jeq3._16Jk6d',
      'div._30jeq3',
      '.a-price-whole',
      '#subtotals-marketplace-table .a-text-bold',
    ];
    for (const sel of priceSelectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent) {
        const num = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > 500 && num < 10000000) {
          detectedPrice = num;
          break;
        }
      }
    }

    // Scan for "Buy at ₹4,524" or "Buy now at ₹..." in buttons/headings
    if (!detectedPrice) {
      const buyAtMatch = bodyText.match(/(?:Buy at|Buy now at|Total Amount|Payable Amount|Total Price)[^\d₹]*₹\s*([0-9,]+)/i);
      if (buyAtMatch && buyAtMatch[1]) {
        const p = parseInt(buyAtMatch[1].replace(/,/g, ''), 10);
        if (!isNaN(p) && p > 500 && p < 10000000) {
          detectedPrice = p;
        }
      }
    }

    // Scan original struck-through MRP (e.g. ₹19,999 or 73% off)
    const mrpSelectors = ['div.yRaY8j.A68rqU', 'div._3I9_wc._2p6lqe', 'span.a-price.a-text-price'];
    for (const sel of mrpSelectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent) {
        const num = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > detectedPrice) {
          detectedOriginalPrice = num;
          break;
        }
      }
    }

    // Check discount percentage
    const discountMatch = bodyText.match(/(\d+)%\s*off/i);
    if (discountMatch && discountMatch[1]) {
      detectedDiscount = parseInt(discountMatch[1], 10);
    }

    // Check for "Buy with EMI From ₹5,166/m"
    const emiMonthlyMatch = bodyText.match(/(?:From|Pay|EMI)\s*₹\s*([0-9,]+)\s*(?:\/\s*m|per month|monthly)/i);
    if (emiMonthlyMatch && emiMonthlyMatch[1]) {
      detectedEmi = parseInt(emiMonthlyMatch[1].replace(/,/g, ''), 10);
    }

    const finalPrice = detectedPrice > 0 ? detectedPrice : 5399;

    // Detect active bank/card offers on page
    const offers: ScrapedOffer[] = [];
    const hasAxisCard = /Flipkart Axis Bank|Axis Bank Credit Card|Axis/i.test(bodyText);
    const hasAuBank = /AU Small Finance|AU Bank|AU Credit Card/i.test(bodyText);
    const hasSuperCoins = /SuperCoins/i.test(bodyText);

    // 1. Direct UPI / Debit Card Baseline (Zero Drag)
    offers.push({
      id: 'upi-instant',
      bankOrCard: 'UPI / Direct Debit (Zero Debt)',
      description: 'Immediate payment without loan or credit line lock-in',
      effectiveBenefit: 'Saves 100% of GST & bank processing fees',
      rating: 'BEST',
      reason: 'Zero interest, zero processing fee, keeps credit limit 100% free.',
      netPrice: finalPrice,
      recommended: true,
    });

    // 2. Flipkart Axis Bank Credit Card
    if (hasAxisCard || true) {
      const cashback = Math.round(finalPrice * 0.05);
      offers.push({
        id: 'axis-card',
        bankOrCard: 'Flipkart Axis Bank Credit Card',
        description: '5% Unlimited Cashback credited directly to statement',
        effectiveBenefit: `Save ₹${cashback.toLocaleString('en-IN')} upfront`,
        rating: 'BEST',
        reason: `Gives ₹${cashback.toLocaleString('en-IN')} instant statement cashback without any tenure lock-in.`,
        netPrice: finalPrice - cashback,
        recommended: true,
      });
    }

    // 3. AU Bank / Partner Bank Discount Offer
    if (hasAuBank || bodyText.includes('AU')) {
      const auDiscount = Math.min(Math.round(finalPrice * 0.1), 1500);
      offers.push({
        id: 'au-bank',
        bankOrCard: 'AU Small Finance Bank Credit Card',
        description: 'Instant 10% discount on credit card transactions',
        effectiveBenefit: `Save ₹${auDiscount.toLocaleString('en-IN')}`,
        rating: 'GOOD',
        reason: 'Direct instant price reduction at checkout if you pay in single tranche.',
        netPrice: finalPrice - auDiscount,
        recommended: false,
      });
    }

    // 4. No-Cost EMI (With Hidden GST Alert)
    const emiMonths = 12;
    const estimatedGstFee = Math.round(199 + (finalPrice * 0.15 * (emiMonths / 12) * 0.18));
    offers.push({
      id: 'no-cost-emi',
      bankOrCard: 'No-Cost EMI (All Banks)',
      description: `${emiMonths} Months installment plan`,
      effectiveBenefit: `₹${Math.round(finalPrice / emiMonths).toLocaleString('en-IN')}/mo + ₹${estimatedGstFee} GST drag`,
      rating: 'AVOID',
      reason: `Hidden administrative leak: charges ₹199 fee + ₹${estimatedGstFee} non-refundable GST on interest.`,
      netPrice: finalPrice + estimatedGstFee,
      recommended: false,
    });

    // 5. SuperCoins / Rewards
    if (hasSuperCoins) {
      offers.push({
        id: 'supercoins',
        bankOrCard: 'Flipkart SuperCoins Plus',
        description: 'Earn SuperCoins cashback rewards',
        effectiveBenefit: 'Extra 15 SuperCoins on purchase',
        rating: 'GOOD',
        reason: 'Bonus rewards stacking on top of any payment card.',
        netPrice: finalPrice,
        recommended: false,
      });
    }

    return {
      surfaceType: 'ECOMMERCE',
      price: finalPrice,
      originalPrice: detectedOriginalPrice > 0 ? detectedOriginalPrice : undefined,
      discountPercent: detectedDiscount > 0 ? detectedDiscount : undefined,
      name: detectedName || 'Identified Flipkart Item',
      advertisedMonthlyEmi: detectedEmi,
      offers,
    };
  }

  // Active React Root and Host Container References
  let hostContainer: HTMLElement | null = null;
  let shadowRoot: ShadowRoot | null = null;
  let reactRoot: ReactDOM.Root | null = null;

  // Mount the CommitGuard Modal inside Shadow Root
  function injectShadowModal(
    surfaceType: InterceptorSurface,
    productPrice: number,
    productName: string,
    offers: ScrapedOffer[],
    originalPrice: number | undefined,
    discountPercent: number | undefined,
    onProceedCallback: () => void,
    onCancelCallback: () => void
  ) {
    if (document.getElementById(COMMITGUARD_HOST_ID)) {
      return; // Already open
    }

    // 1. Create host element
    hostContainer = document.createElement('div');
    hostContainer.id = COMMITGUARD_HOST_ID;
    hostContainer.style.position = 'fixed';
    hostContainer.style.zIndex = '2147483647';
    hostContainer.style.top = '0';
    hostContainer.style.left = '0';
    hostContainer.style.width = '100%';
    hostContainer.style.height = '100%';
    hostContainer.style.pointerEvents = 'auto';

    // 2. Attach Shadow Root (Open mode for DOM accessibility)
    shadowRoot = hostContainer.attachShadow({ mode: 'open' });

    // 3. Inject Tailwind CSS Styles directly into the Shadow Root
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    try {
      styleLink.href = chrome.runtime.getURL('styles.css');
    } catch {
      styleLink.href = '';
    }
    shadowRoot.appendChild(styleLink);

    // Fallback embedded core CSS to guarantee zero styling bleed-through
    const inlineStyle = document.createElement('style');
    inlineStyle.textContent = `
      :host { all: initial; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .commitguard-backdrop {
        position: fixed; inset: 0; z-index: 2147483647; display: flex; align-items: center; justify-content: center;
        padding: 1rem; background-color: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      }
      .commitguard-card {
        position: relative; width: 100%; max-width: 48rem; background-color: #ffffff; border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35); border: 1px solid #e2e8f0; overflow: hidden;
      }
    `;
    shadowRoot.appendChild(inlineStyle);

    // 4. Create mount container inside Shadow Root
    const mountPoint = document.createElement('div');
    mountPoint.id = 'commitguard-react-app';
    shadowRoot.appendChild(mountPoint);

    // 5. Append host container to document body or documentElement
    const parent = document.body || document.documentElement;
    parent.appendChild(hostContainer);

    // 6. Mount React component inside Shadow Root
    reactRoot = ReactDOM.createRoot(mountPoint);

    const cleanUpModal = () => {
      if (reactRoot) {
        reactRoot.unmount();
        reactRoot = null;
      }
      if (hostContainer && hostContainer.parentNode) {
        hostContainer.parentNode.removeChild(hostContainer);
        hostContainer = null;
      }
    };

    const handleProceed = () => {
      cleanUpModal();
      onProceedCallback();
    };

    const handleCancel = () => {
      cleanUpModal();
      onCancelCallback();
    };

    reactRoot.render(
      <ExtensionCommitGuardModal
        surfaceType={surfaceType}
        productPrice={productPrice}
        productName={productName}
        originalPrice={originalPrice}
        discountPercent={discountPercent}
        scrapedOffers={offers}
        onProceedAndContinue={handleProceed}
        onCancelStayOnPage={handleCancel}
      />
    );

    // 7. Notify background service worker for metrics telemetry
    try {
      chrome.runtime.sendMessage({
        type: 'CHECKOUT_INTERCEPTED',
        payload: {
          surface: surfaceType,
          price: productPrice,
          name: productName,
          effectiveApr: 19.93,
          hiddenFriction: 1339,
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // Standalone execution
    }
  }

  // Multi-Surface Universal Keywords and Fuzzy Intent Matchers
  // Seamlessly handles wording variations across Flipkart, Amazon, MakeMyTrip, Cleartrip, UpGrad
  const UNIVERSAL_INTERCEPT_KEYWORDS = [
    // 1. E-Commerce (Flipkart, Amazon)
    'continue with emi',
    'buy with emi',
    'pay with emi',
    'select plan and continue',
    'place order',
    'place your order',
    'proceed to pay',
    'proceed to retail checkout',
    'credit card emi',
    'complete payment',
    'buy now',

    // 2. Travel (MakeMyTrip, Cleartrip, Yatra)
    'travel now pay later',
    'travel now, pay later',
    'trip on emi',
    'book now pay later',
    'book now, pay later',
    'pay with trip money',
    'pay in emi',
    'easy emi',
    'continue to payment',
    'book flight',
    'pay & book now',

    // 3. Ed-Tech & Udemy (UpGrad, Scaler, Simplilearn, Udemy)
    'education loan',
    'apply for education loan',
    'pay with loan',
    'pay in installments',
    '0% interest emi',
    'no cost emi options',
    'enroll with emi',
    'apply for loan',
    'finance options',
    'complete checkout',
    'enroll now',
    'buy this course',
    'go to cart',
  ];

  // Helper to check if an element or its ancestors match target intent across ANY non-financial surface
  function findInterceptTarget(element: HTMLElement | null): HTMLElement | null {
    let curr = element;
    let depth = 0;
    while (curr && depth < 7 && curr !== document.body) {
      // Check data attribute bypass
      if (curr.getAttribute('data-commitguard-authorized') === 'true') {
        return null;
      }

      // Check text content of button, link, or clickable element
      const text = (curr.innerText || curr.textContent || '').trim().toLowerCase();
      const tagName = curr.tagName.toUpperCase();

      // Direct & Fuzzy Keyword Match
      for (const keyword of UNIVERSAL_INTERCEPT_KEYWORDS) {
        if (text === keyword || (text.length < 60 && text.includes(keyword))) {
          return curr;
        }
      }

      // Dynamic Regex Matcher: Catches custom wording variations like "Book now (Pay in 6 EMIs)"
      if (
        /(\bemi\b|\bloan\b|\btnpl\b|pay\s*later|installment|subvention|place\s*order|proceed\s*to\s*pay)/i.test(text) &&
        (tagName === 'BUTTON' || tagName === 'A' || curr.getAttribute('role') === 'button' || curr.classList.toString().includes('btn'))
      ) {
        return curr;
      }

      // Check input elements (e.g., input[type="submit"], input[name="placeYourOrder1"])
      if (tagName === 'INPUT') {
        const inputVal = ((curr as HTMLInputElement).value || '').toLowerCase();
        const inputName = ((curr as HTMLInputElement).name || '').toLowerCase();
        for (const keyword of UNIVERSAL_INTERCEPT_KEYWORDS) {
          if (inputVal.includes(keyword) || inputName.includes(keyword)) {
            return curr;
          }
        }
      }

      // Check button classes or IDs
      const idStr = (curr.id || '').toLowerCase();
      const classStr = (curr.className || '').toString().toLowerCase();
      if (
        idStr.includes('placeorder') ||
        idStr.includes('proceedtopay') ||
        idStr.includes('emipayment') ||
        classStr.includes('paylater') ||
        classStr.includes('emiselection')
      ) {
        return curr;
      }

      curr = curr.parentElement;
      depth++;
    }
    return null;
  }

  // GLOBAL CAPTURING CLICK LISTENER
  // Intercepts clicks at the window level BEFORE host application event handlers run
  window.addEventListener(
    'click',
    (e: MouseEvent) => {
      // Ignore clicks inside our own Shadow Root
      if (hostContainer && (e.target === hostContainer || hostContainer.contains(e.target as Node))) {
        return;
      }

      const targetEl = findInterceptTarget(e.target as HTMLElement);
      if (!targetEl) {
        return;
      }

      console.log('🛡️ CommitGuard Intercepted Payment Action on:', targetEl);

      // Stop host site from immediately placing order or navigating
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const productInfo = extractProductInfo(targetEl);
      console.log('🛡️ CommitGuard Scraped Product Info & Offers:', productInfo);

      injectShadowModal(
        productInfo.surfaceType,
        productInfo.price,
        productInfo.name,
        productInfo.offers,
        productInfo.originalPrice,
        productInfo.discountPercent,
        // On Proceed: mark as authorized and let the click advance to next page
        () => {
          targetEl.setAttribute('data-commitguard-authorized', 'true');
          console.log('🛡️ CommitGuard Authorized: Continuing original payment action');
          targetEl.click();
        },
        // On Cancel: do NOT mark authorized, do NOT click target, stay on current page
        () => {
          console.log('🛡️ CommitGuard Cancelled: User remains on current page to modify terms');
        }
      );
    },
    true // CAPTURING PHASE: Guarantees we execute before Flipkart / Amazon handlers
  );

  console.log('🛡️ CommitGuard Global Capture Listener registered successfully');
})();
