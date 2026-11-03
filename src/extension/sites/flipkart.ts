import {
  amountFromSelectors,
  checkedRowTexts,
  classifySelection,
  firstText,
  inRange,
  pageText,
  parseAmount,
  rememberAmount,
  rupeeAmounts,
  textOf,
  CHECKED_OPTIONS,
  type Range,
} from '../dom';
import { cardCashbackOffer, couponOffer, gstInvoiceOffer, noCostEmiOffer, upiOffer } from '../offers';
import type { CheckoutInfo, PaymentOffer } from '../types';

const PRICE: Range = { min: 500, max: 5_000_000 };

const TITLE_SELECTORS = ['h1', 'span.B_NuCI', 'span._35KyD6', '.VU-ZEz', '[class*="title"]'];
const PRICE_SELECTORS = ['div.Nx9bqj.CxhGGd', 'div.Nx9bqj', 'div._30jeq3._16Jk6d', 'div._30jeq3', '.Nx9bqj', '.CxhGGd', '[class*="price"]'];
const PAYMENT_OPTIONS = `${CHECKED_OPTIONS}, [class*="tab"][class*="active"], [class*="tab"][class*="selected"]`;
const TENURE = /(\d{1,2})\s*months?\s*[x×]\s*₹/i;
const MRP_SELECTORS = ['div.yRaY8j.A68rqU', 'div._3I9_wc._2p6lqe', '.yRaY8j', '[class*="mrp"]', 's', 'del'];

const BANKS: [RegExp, string][] = [
  [/icici/i, 'ICICI Bank'],
  [/bajaj/i, 'Bajaj Finance'],
  [/bobcard|\bbob\b/i, 'BOBCARD'],
  [/kotak/i, 'Kotak'],
  [/hdfc/i, 'HDFC Bank'],
  [/\bsbi\b/i, 'SBI'],
  [/axis/i, 'Axis Bank'],
];

type Selection = { kind: 'upi' } | { kind: 'axis-card' } | { kind: 'emi'; bank: string };

function classifyPayment(text: string): Selection | null {
  const bank = BANKS.find(([pattern]) => pattern.test(text))?.[1];
  if (bank === 'Axis Bank' && !/\bemi\b/i.test(text)) return { kind: 'axis-card' };
  if (bank) return { kind: 'emi', bank };
  if (/upi|qr\s*code|google\s*pay|phonepe/i.test(text)) return { kind: 'upi' };
  return null;
}

function findPrice(clicked: HTMLElement | null, text: string): number {
  // The clicked button is the best signal. A struck-through MRP can render before the real total,
  // so take the LAST ₹ figure in its text.
  if (clicked) {
    for (const t of [clicked.innerText, clicked.textContent ?? '', textOf(clicked.closest('button, a, [role="button"]'))]) {
      const amount = rupeeAmounts(t).at(-1) ?? 0;
      if (inRange(amount, PRICE)) return amount;
    }
  }

  // A labelled total must win over the generic [class*="price"] selector below, which tends to
  // pick up the MRP first.
  const labelled = text.match(/\b(?:Total\s*Amount|Total\s*Payable|Order\s*Total|Grand\s*Total)\b[^₹$€£]{0,24}[₹$€£]\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  const labelledAmount = labelled ? parseAmount(labelled[1]) : 0;
  if (inRange(labelledAmount, PRICE)) return labelledAmount;

  for (const el of Array.from(document.querySelectorAll('button, a, div, span'))) {
    const match = textOf(el).match(/(?:Buy\s*now\s*at|Pay|Lowest\s*price\s*for\s*you)\s*₹\s*([0-9,]+)/i);
    const amount = match ? parseAmount(match[1]) : 0;
    if (inRange(amount, PRICE)) return amount;
  }

  return amountFromSelectors(PRICE_SELECTORS, PRICE, true) || (rupeeAmounts(text).find((n) => n >= 1000 && n <= 2_000_000) ?? 0);
}

function findCart(text: string): CheckoutInfo['cart'] {
  const countedInSummary = Number(text.match(/(?:Price|Total\s*Payable)\s*\(\s*(\d+)\s*items?\s*\)/i)?.[1] ?? 0);
  const isCartPage = /\/viewcart|\/checkout/.test(location.href) || !!document.querySelector('div[class*="cartItem"], div._1AtVbE:has([class*="price"])');
  const listed = !countedInSummary && isCartPage ? Math.min(document.querySelectorAll('div[class*="cartItem"], div._2n0QD9, a[class*="title"]').length, 10) : 0;
  const count = countedInSummary || listed;
  if (count < 2) return undefined;
  const preview = Array.from(document.querySelectorAll('div[class*="cartItem"] a, div._2Kn22P, ._2-uGAT'), textOf)
    .filter((t) => t.length > 3)
    .slice(0, 3)
    .map((t) => t.slice(0, 45));
  return { count, preview };
}

export function scrapeFlipkart(clicked: HTMLElement | null): CheckoutInfo {
  const text = pageText();
  const name = firstText(TITLE_SELECTORS, { minLength: 5, reject: /Flipkart/ }) || 'Flipkart order';
  const price = rememberAmount('commitguard_flipkart_price', findPrice(clicked, text), PRICE);
  const originalPrice = amountFromSelectors(MRP_SELECTORS, { min: price + 1, max: Infinity });
  const discountPercent = Number(text.match(/(\d+)%\s*off/i)?.[1] ?? 0);

  const selection = classifySelection(clicked, classifyPayment, {
    clickedRow: 'li, label, div, button, tr',
    checked: PAYMENT_OPTIONS,
  });
  // Tenure of the selected EMI plan, else the first plan listed on the page.
  const plan = checkedRowTexts(PAYMENT_OPTIONS).find((t) => TENURE.test(t)) ?? text;
  const tenureMonths = Number(plan.match(TENURE)?.[1] ?? 6);
  const coupon = parseAmount(text.match(/coupon\s*•\s*₹?\s*([0-9,]+)\s*off/i)?.[1] ?? '');

  const offers: PaymentOffer[] = [
    upiOffer(price, { selected: selection?.kind === 'upi' }),
    cardCashbackOffer({ id: 'flipkart-axis', cardId: 'flipkart-axis', price, selected: selection?.kind === 'axis-card' }),
    noCostEmiOffer({
      id: 'flipkart-nocost-emi',
      label: `${selection?.kind === 'emi' ? selection.bank : 'Bank'} No-Cost EMI`,
      price,
      tenureMonths,
      selected: selection?.kind === 'emi',
    }),
  ];
  if (coupon > 0 && coupon < price) offers.push(couponOffer(price, coupon));
  const gst = gstInvoiceOffer(price, 18, 'Flipkart');
  if (gst) offers.push(gst);

  return {
    surface: 'FLIPKART',
    name,
    price,
    originalPrice: originalPrice || undefined,
    discountPercent: discountPercent || undefined,
    offers,
    cart: findCart(text),
  };
}
