import { amountFromPatterns, amountFromSelectors, classifySelection, clickedTexts, firstText, inRange, pageText, parseAmount, rememberAmount, textOf, type Range } from '../dom';
import { inr } from '../format';
import { gstInvoiceOffer } from '../offers';
import type { CheckoutInfo, PaymentOffer } from '../types';

const PRICE: Range = { min: 100, max: 100_000 };

const TITLE_SELECTORS = [
  'h1[data-purpose="lead-title"]',
  'h1.clp-lead__title',
  '[data-purpose="course-header-title"]',
  '[data-purpose="shopping-cart-item-title"]',
  '.cart-item-component--title',
  '.course-title',
  'h1',
];

const PRICE_SELECTORS = [
  '[data-purpose="total-price"] span:not(.sr-only)',
  '[data-purpose="summary-total"]',
  '[data-purpose="shopping-cart-total"]',
  '[data-purpose="course-price-text"] span:not(.sr-only)',
  '[data-purpose="course-price-text"]',
  '[data-purpose="current-price"]',
  '.price-text--price-part--Tu6MH',
  'div[class*="price-text--price-part"] span:not(.sr-only)',
  '.base-price-text',
  '.clp-lead__price',
  '.shopping-item__price',
  'div[class*="order-summary"] [class*="total-price"]',
  'div[class*="order-summary"] [class*="price"]',
  'div[data-purpose*="price"] span',
];

const MRP_SELECTORS = [
  '[data-purpose="original-price-container"] s',
  '[data-purpose="course-old-price-text"]',
  'div[data-purpose="course-price-text"] s',
  'div[data-purpose="course-price-text"] del',
  's span:not(.sr-only)',
  'del span',
  '.original-price-text',
];

// No "first ₹ on the page" fallback: Udemy pages are full of prices for other courses. \b keeps
// "Subtotal" from matching "Total", and the gap allows "Total (2 courses):\n₹1,342".
const TOTAL_PATTERNS = [
  /\b(?:Order\s*Total|Total\s*Amount|Total)\b(?:\s*\([^)]*\))?[^₹$€£]{0,24}[₹$€£]\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  /(?:Current\s*price)[^\d₹$€£]*[₹$€£]\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
];

const CART_ITEMS = '[data-purpose="shopping-cart-item"], .cart-item-component, [class*="shopping-cart-item"]';

function classifyChannel(text: string): string | null {
  const t = text.toLowerCase();
  if (/\bupi\b/.test(t)) return 'UPI';
  if (/net\s*banking/.test(t)) return 'Net Banking';
  if (/mobile\s*wallet|\bwallet\b/.test(t)) return 'Mobile Wallet';
  if (/\bcard\b/.test(t)) return 'Cards';
  return null;
}

function findName(courseSlug: string, isCart: boolean): string {
  const og = document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() ?? '';
  const fromOg = og.length > 3 ? og.replace(/\|?\s*Udemy.*$/i, '').trim().slice(0, 75) : '';
  const fromTitle = document.title.replace(/\|?\s*Udemy.*$/i, '').replace(/Online Courses.*$/i, '').trim();
  const fromSlug = courseSlug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return (
    fromOg ||
    firstText(TITLE_SELECTORS, { maxLength: 75, reject: /shopping cart|checkout/i }) ||
    (fromTitle.length > 3 && !/shopping cart/i.test(fromTitle) ? fromTitle.slice(0, 75) : '') ||
    fromSlug.slice(0, 75) ||
    (isCart ? 'Udemy cart' : 'Udemy course')
  );
}

/** Schema.org data is immune to Udemy's obfuscated class names, so it goes first. */
function priceFromStructuredData(): number {
  for (const script of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
    try {
      const data = JSON.parse(script.textContent ?? '');
      for (const item of Array.isArray(data) ? data : [data]) {
        const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
        const price = Math.round(Number(offer?.price));
        if (inRange(price, PRICE)) return price;
      }
    } catch {
      // Malformed or unrelated JSON-LD; try the next block.
    }
  }
  return 0;
}

function priceOnClickedControl(clicked: HTMLElement | null): number {
  for (const t of clickedTexts(clicked, 'button, a, [role="button"], form, [class*="buy-box"], [class*="order-summary"]')) {
    const match = t.match(/[₹$€£]\s*([0-9,]+(?:\.[0-9]{1,2})?)/);
    const amount = match ? parseAmount(match[1]) : 0;
    if (inRange(amount, PRICE)) return amount;
  }
  return 0;
}

function findOriginalPrice(price: number): number {
  for (const selector of MRP_SELECTORS) {
    const amount = parseAmount(textOf(document.querySelector(selector)));
    if (amount > price) return amount;
  }
  return 0;
}

export function scrapeUdemy(clicked: HTMLElement | null): CheckoutInfo {
  const text = pageText();
  const isCart = /\/cart|\/checkout/.test(location.pathname);
  const courseSlug = location.pathname.match(/\/course\/([^/?#]+)/)?.[1] ?? '';

  const live =
    priceFromStructuredData() ||
    priceOnClickedControl(clicked) ||
    amountFromSelectors(PRICE_SELECTORS, PRICE, true) ||
    amountFromPatterns(text, TOTAL_PATTERNS, PRICE);
  // Cache per course (or per cart) so one course's price never leaks onto another's page.
  const cacheKey = isCart ? 'commitguard_udemy_cart_total' : courseSlug ? `commitguard_udemy_price_${courseSlug}` : '';
  const price = cacheKey ? rememberAmount(cacheKey, live, PRICE) : live;

  const originalPrice = findOriginalPrice(price);
  const discountPercent = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const items = isCart ? Array.from(document.querySelectorAll(CART_ITEMS)) : [];
  const cart =
    items.length > 1
      ? {
          count: items.length,
          preview: items
            .slice(0, 3)
            .map((el) => textOf(el.querySelector('[data-purpose="shopping-cart-item-title"], a, h3')))
            .filter((t) => t.length > 3)
            .map((t) => t.slice(0, 45)),
        }
      : undefined;

  const channel = classifySelection(clicked, classifyChannel, { clickedRow: 'li, label, div, [role="radio"]' });

  const offers: PaymentOffer[] = [
    {
      id: 'pay-in-full',
      kind: channel === 'Cards' ? 'card' : 'upi',
      label: `${channel ?? 'UPI or card'}, paid in full`,
      description: 'One payment, no instalments',
      benefit: 'no interest and no fees',
      rating: 'BEST',
      reason: 'A one-time payment adds nothing on top of the course price.',
      trueCost: price,
      selected: !!channel,
    },
    {
      id: 'wait',
      kind: 'wait',
      label: 'Wait 30 days before buying',
      description: 'Keep the money until you have study time set aside',
      benefit: 'nothing spent until you are sure',
      rating: 'GOOD',
      reason: 'Buying later costs nothing extra, and it avoids paying for a course you never start.',
      trueCost: price,
    },
    {
      id: 'pay-later',
      kind: 'bnpl',
      label: 'Pay later (Simpl, LazyPay)',
      description: 'Split into 3 payments or pay within 15 days',
      benefit: `${inr(price / 3)} a month for 3 months`,
      rating: 'NEUTRAL',
      reason: 'Interest-free only if every payment is on time. A missed one adds a late fee and is reported to credit bureaus.',
      trueCost: price,
    },
  ];
  const gst = gstInvoiceOffer(price, 18, 'Udemy');
  if (gst) offers.push(gst);

  return {
    surface: 'UDEMY',
    name: findName(courseSlug, isCart),
    price,
    originalPrice: originalPrice || undefined,
    discountPercent: discountPercent || undefined,
    offers,
    cart,
  };
}
