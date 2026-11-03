import {
  amountFromPatterns,
  amountFromSelectors,
  checkedRowTexts,
  classifySelection,
  clickedTexts,
  firstText,
  inRange,
  pageText,
  parseAmount,
  rememberAmount,
  rememberText,
  rupeeAmounts,
  textOf,
  type Range,
} from '../dom';
import { cardCashbackOffer, cardOffer, gstInvoiceOffer, noCostEmiOffer, upiOffer } from '../offers';
import type { CheckoutInfo, PaymentOffer } from '../types';

const PRICE: Range = { min: 50, max: 9_999_999 };

const TOTAL_PATTERNS = [
  /(?:Order\s*Total|Grand\s*Total|Final\s*Total|Total\s*Payable|Amount\s*Payable)[^\d₹]*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  /(?:Payment\s*of)\s*₹?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  /\bPay\s*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  /Subtotal\s*\(\s*\d+\s*items?\s*\)[^\d₹]*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  /Subtotal[^\d₹]*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  /\bTotal:\s*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
];

// Checkout and cart totals first, product-page prices last.
const PRICE_SELECTORS = [
  '#subtotals-marketplace-table tr:last-child .a-color-price',
  '#subtotals-marketplace-table .grand-total-price',
  'td.grand-total-price',
  '.order-summary-grand-total',
  '[data-testid="order-summary-total"]',
  'span.a-color-price.a-text-bold',
  '#subtotals-marketplace-table .a-color-price',
  '#subtotals-marketplace-table .a-text-bold',
  '.spc-order-summary .a-color-price',
  'div[id*="order-summary"] .a-color-price',
  '.pmts-total-amount',
  '#sc-subtotal-amount-activecart .sc-price',
  '#sc-subtotal-amount-buybox .sc-price',
  '#sc-subtotal-amount-activecart',
  '#sc-subtotal-amount-buybox',
  'span.sc-white-space-nowrap',
  '#corePriceDisplay_desktop_feature_div .a-price-whole',
  '#corePrice_feature_div .a-price-whole',
  '#priceblock_ourprice',
  '#priceblock_dealprice',
  '#priceblock_saleprice',
  'span.apexPriceToPay span.a-offscreen',
  'span.a-price-whole',
  '.a-price .a-offscreen',
];

const CART_TITLE = '.sc-product-title, .sc-grid-item-product-title, [data-name="Active Items"] .a-truncate-cut, .sc-list-item .a-truncate-cut';
const ITEM_TITLES = ['.item-row-title', '.spc-product-title', '[data-testid="item-title"]', '.shipping-group .a-text-bold', '#productTitle', '#title'];

type Selection = 'UPI' | 'EMI' | 'ICICI_CARD' | 'CARD';

function classifyPayment(text: string): Selection | null {
  const t = text.toLowerCase();
  if (/\bemi\b/.test(t)) return 'EMI';
  if (/\bupi\b|amazon\s*pay\s*balance/.test(t)) return 'UPI';
  if (/icici/.test(t)) return 'ICICI_CARD';
  if (/credit\s*or\s*debit\s*card|\bcard\b/.test(t)) return 'CARD';
  return null;
}

/** "Pay ₹1,234" on the clicked control is the most direct signal of the amount being paid. */
function priceOnClickedControl(clicked: HTMLElement | null): number {
  for (const t of clickedTexts(clicked, 'button, a, input[type="submit"], input[type="button"], [role="button"], form')) {
    const match = t.includes('₹') ? t.match(/(?:Pay|Payment\s*of|Total|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i) : null;
    const amount = match ? parseAmount(match[1]) : 0;
    if (inRange(amount, PRICE)) return amount;
  }
  return 0;
}

function findPrice(clicked: HTMLElement | null, text: string): number {
  const live = priceOnClickedControl(clicked) || amountFromPatterns(text, TOTAL_PATTERNS, PRICE) || amountFromSelectors(PRICE_SELECTORS, PRICE);
  // Last resort: the first sizeable ₹ figure on the page.
  return rememberAmount('commitguard_amazon_price', live, PRICE) || (rupeeAmounts(text).find((n) => n >= 100 && n <= PRICE.max) ?? 0);
}

export function scrapeAmazon(clicked: HTMLElement | null): CheckoutInfo {
  const text = pageText();
  const price = findPrice(clicked, text);

  const isCartPage = /\/(gp\/)?cart|\/buy\//.test(location.href) || !!document.querySelector('#sc-active-cart, #gutterCartViewForm, #activeCartViewForm');
  const subtotalCount = Number(text.match(/Subtotal\s*\(\s*(\d+)\s*items?\s*\)/i)?.[1] ?? 0);
  const listedItems = isCartPage ? document.querySelectorAll('.sc-list-item, div[data-asin]').length : 0;
  const itemCount = Math.max(subtotalCount, listedItems, 1);
  const cart =
    itemCount > 1
      ? {
          count: itemCount,
          preview: Array.from(document.querySelectorAll('.sc-product-title, .a-truncate-cut'), textOf)
            .filter((t) => t.length > 3)
            .slice(0, 3)
            .map((t) => t.slice(0, 45)),
        }
      : undefined;

  let name = '';
  if (isCartPage) {
    const title = textOf(document.querySelector(CART_TITLE));
    if (title.length > 3) name = cart ? `${title.slice(0, 45)} (+${itemCount - 1} more in cart)` : title.slice(0, 65);
  }
  name ||= firstText(ITEM_TITLES, { maxLength: 65 });
  if (!name && isCartPage) name = `Amazon cart (${itemCount} item${itemCount > 1 ? 's' : ''})`;
  name = rememberText('commitguard_amazon_title', name) || 'Amazon order';

  const selection = classifySelection(clicked, classifyPayment, {
    clickedRow: 'li, label, tr, [role="radio"], [class*="payment"], [class*="pmts"]',
  });
  const pageCashback = parseAmount(text.match(/Upto\s*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*cashback\s*as\s*Amazon\s*Pay/i)?.[1] ?? '');
  const bankDiscount = parseAmount(text.match(/Upto\s*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*discount\s*on\s*Credit\s*Cards/i)?.[1] ?? '');
  const advertisedSavings = text.match(/Upto\s*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*EMI\s*interest\s*savings/i)?.[1];
  const emiPlan = checkedRowTexts().find((t) => /\bemi\b/i.test(t)) ?? '';
  const tenureMonths = Number(emiPlan.match(/(\d{1,2})\s*months?/i)?.[1] ?? 12);

  const offers: PaymentOffer[] = [
    upiOffer(price, { selected: selection === 'UPI' }),
    cardCashbackOffer({
      id: 'amazon-pay-icici',
      cardId: 'amazon-pay-icici',
      price,
      cashback: pageCashback > 0 && pageCashback < price ? pageCashback : undefined,
      selected: selection === 'ICICI_CARD',
    }),
    cardOffer({ price, bankDiscount: bankDiscount > 0 && bankDiscount < price ? bankDiscount : 0, selected: selection === 'CARD' }),
    noCostEmiOffer({
      id: 'amazon-nocost-emi',
      label: 'No-Cost EMI',
      price,
      tenureMonths,
      note: advertisedSavings ? `Amazon advertises up to ₹${advertisedSavings} interest savings` : undefined,
      selected: selection === 'EMI',
    }),
  ];
  const gst = gstInvoiceOffer(price, 18, 'Amazon Business');
  if (gst) offers.push(gst);

  return { surface: 'AMAZON', name, price, offers, cart };
}
