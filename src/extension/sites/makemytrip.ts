import { ASSUMED_LENDER_RATE, SAFE_RETURN_RATE, calculateInterestEmi, savingsPlanValue } from '../../lib/finance';
import { amountFromPatterns, amountFromSelectors, checkedRowTexts, firstText, inRange, pageText, parseAmount, rememberAmount, textOf, type Range } from '../dom';
import { inr } from '../format';
import { gstInvoiceOffer, interestEmiOffer, noCostEmiOffer, upiOffer, type StatedEmiTerms } from '../offers';
import type { CheckoutInfo, PaymentOffer } from '../types';

const PRICE: Range = { min: 500, max: 1_000_000 };

const TITLE_SELECTORS = [
  '.flight-details',
  '.header-title',
  'h1',
  'h2',
  '.itinerary-header',
  '.sector-info',
  '.hotel-name',
  '#booking-summary',
  '[class*="flightDetails"]',
  '[class*="flightName"]',
  '[class*="headerTitle"]',
];

// "New Delhi (DEL) → Bengaluru (BLR)": airport codes on both sides, so ordinary "X to Y" prose
// elsewhere on the page does not match.
const ROUTE = /([A-Za-z\s]{2,30}\([A-Z]{3}\)\s*(?:→|->|to)\s*[A-Za-z\s]{2,30}\([A-Z]{3}\))/i;

const PLAN = /(\d+)\s*months\s*x\s*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i;
const INTEREST = /Incl\.\s*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*interest\s*(?:@\s*([0-9.]+)%)?/i;
const TOTAL_PAYABLE = /₹\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*Total payable/i;

const NOISE = /below is the list|search here|select your bank|select tenure|all banks|convenience fee|total due|provide card details/i;

type Choice = 'upi' | 'tnpl' | 'nocost';

/** Short option labels like "UPI", "Trip Money" or "No Cost EMI". Long text is a container, not an option. */
function choiceIn(text: string, { bankRowsAreEmi = false } = {}): Choice | null {
  if (text.length >= 100) return null;
  if (/scan\s*to\s*pay|qr|upi|google\s*pay|phonepe|paytm/i.test(text)) return 'upi';
  if (/tnpl|travel\s*now\s*pay\s*later|trip\s*money/i.test(text)) return 'tnpl';
  if (/no\s*cost\s*emi/i.test(text) && !(bankRowsAreEmi && /bank|card/i.test(text))) return 'nocost';
  return null;
}

function cardCategoryIn(text: string): string {
  if (/debit\s*card/i.test(text)) return 'Debit card';
  if (/cardless/i.test(text)) return 'Cardless';
  if (/credit\s*card/i.test(text)) return 'Credit card';
  return '';
}

/** Strips labels, amounts and UI words from a bank option row, leaving the bank's name. */
function bankNameIn(raw: string): string {
  const cleaned = raw
    .replace(/CREDIT\s*CARD|DEBIT\s*CARD|CARDLESS\s*EMI|NO\s*COST\s*EMI|\bEMI\b|ALL\s*BANKS|POPULAR\s*BANKS/gi, '')
    .replace(/BANKS\s*UNAVAILABLE[^\n]*/gi, '')
    .replace(/Start(?:s|ing)?\s*at\s*₹?\s*[0-9,.]+|₹\s*[0-9,.]+/gi, '')
    .replace(/CHANGE|Select tenure|Select your bank/gi, '')
    .replace(/Below is the list.*|Search here.*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length >= 2 && cleaned.length <= 45 && !NOISE.test(cleaned) ? cleaned : '';
}

const SELECTED_BANK = /Select your bank\s*\n*\s*([^\n\r]+?)(?:\s*CHANGE|\s*Select tenure|\s*\n)/i;

function findPrice(clicked: HTMLElement | null, text: string): number {
  const onButton = clicked?.innerText || clicked?.textContent || '';
  const buttonAmount = onButton.includes('₹') ? parseAmount(onButton.match(/(?:Pay|Book|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i)?.[1] ?? '') : 0;
  if (inRange(buttonAmount, PRICE)) return buttonAmount;
  return (
    amountFromPatterns(text, [/(?:Total Due|Grand Total|Total Amount|Payable Amount|Total Fare|Trip Total)[^\d₹]*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/i], { min: 501, max: Infinity }) ||
    amountFromSelectors(['[class*="fare"], [class*="price"], [class*="total"], [class*="Total"]'], { min: 1000, max: PRICE.max }, true)
  );
}

/** A ₹ figure next to fare/total wording; never just the first ₹ on the page (add-ons would win). */
function priceNearTotalWording(text: string): number {
  for (const match of text.matchAll(/(?:fare|total|amount|payable|due|price)[^\d₹]{0,20}₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi)) {
    const amount = parseAmount(match[1]);
    if (inRange(amount, PRICE)) return amount;
  }
  return 0;
}

interface SelectedPayment {
  choice: Choice | null;
  bank: string;
  category: string;
}

function findSelectedPayment(clicked: HTMLElement | null, text: string): SelectedPayment {
  let choice: Choice | null = null;
  let category = '';
  let bank = '';

  // The clicked control is the Pay/Book button itself, so it can say "pay later" or "UPI",
  // but its text is never a bank name.
  if (clicked) {
    const row = textOf(
      clicked.closest('li, label, tr, [role="radio"], [role="button"], [role="tab"], [class*="tab"], [class*="item"], [class*="bank"], [class*="option"]') ?? clicked,
    );
    choice = choiceIn(row);
    category = cardCategoryIn(row);
  }
  if (!category) {
    const activeTab = document.querySelector('[class*="tab"][class*="active"], [class*="tab"][class*="selected"], [role="tab"][aria-selected="true"], button[class*="active"], div[class*="active"]');
    category = cardCategoryIn(textOf(activeTab));
  }

  if (choice !== 'upi' && choice !== 'tnpl') {
    // The "Select your bank → HDFC Bank → CHANGE" header of the EMI flow.
    for (const el of Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, div, span, p, label'))) {
      const own = textOf(el);
      if (!/select your bank/i.test(own) || own.length >= 120) continue;
      bank = bankNameIn(textOf(el.closest('div, section') ?? el.parentElement).match(SELECTED_BANK)?.[1] ?? '');
      if (bank) break;
    }
    bank ||= bankNameIn(text.match(/Select your bank\s*\n*\s*([^\n\r]+?)(?:\s*CHANGE|\s*Select tenure|\s*\n\s*Select tenure)/i)?.[1] ?? '');
  }

  if (!bank && !choice) {
    for (const row of checkedRowTexts('input[type="radio"]:checked, [aria-checked="true"], [class*="selected"], [class*="active"]')) {
      choice = choiceIn(row, { bankRowsAreEmi: true });
      if (choice) break;
      bank = bankNameIn(row);
      if (bank) break;
    }
  }
  return { choice, bank, category };
}

/** EMI terms printed for the chosen plan: the checked plan first, else the last plan listed. */
function findStatedPlan(clicked: HTMLElement | null, text: string, price: number): { tenureMonths: number; annualRate?: number; terms?: StatedEmiTerms } | null {
  const planRow =
    checkedRowTexts().find((t) => PLAN.test(t)) ?? [textOf(clicked?.closest('li, label, tr, div'))].find((t) => PLAN.test(t));
  const source = planRow ?? text;
  const plans = Array.from(source.matchAll(new RegExp(PLAN.source, 'gi')));
  const plan = plans.at(-1);
  if (!plan) return null;

  const tenureMonths = Number(plan[1]);
  const monthlyEmi = parseAmount(plan[2]);
  const interestMatch = planRow ? planRow.match(INTEREST) : Array.from(text.matchAll(/Incl\.\s*₹\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*interest\s*@\s*([0-9.]+)%/gi)).at(-1);
  const totalMatch = planRow ? planRow.match(TOTAL_PAYABLE) : Array.from(text.matchAll(new RegExp(TOTAL_PAYABLE.source, 'gi'))).at(-1);
  const totalPayable = totalMatch ? parseAmount(totalMatch[1]) : monthlyEmi * tenureMonths;
  const interest = interestMatch ? parseAmount(interestMatch[1]) : Math.max(0, totalPayable - price);
  const annualRate = interestMatch?.[2] ? Number(interestMatch[2]) : undefined;
  return { tenureMonths, annualRate, terms: { monthlyEmi, interest, totalPayable } };
}

export function scrapeMakeMyTrip(clicked: HTMLElement | null): CheckoutInfo {
  const text = pageText();
  const price = rememberAmount('commitguard_travel_price', findPrice(clicked, text), { min: 501, max: Infinity }) || priceNearTotalWording(text);

  const route = text.match(ROUTE)?.[1];
  const travellers = Number(text.match(/(\d+)\s*(?:Adults?|Travellers?|Passengers?)/i)?.[1] ?? 1);
  const name =
    (firstText(TITLE_SELECTORS, { minLength: 5, maxLength: 60 }) || (route ? `MakeMyTrip: ${route.trim()}` : 'MakeMyTrip booking')) +
    (travellers > 1 ? `, ${travellers} travellers` : '');

  const { choice, bank, category } = findSelectedPayment(clicked, text);
  const bankLabel = bank ? `${bank}${category ? ` ${category.toLowerCase()}` : ''} EMI` : category ? `${category} EMI` : 'Bank EMI';
  const plan = findStatedPlan(clicked, text, price);
  const tenureMonths = plan?.tenureMonths ?? 12;

  const payLater = calculateInterestEmi({ price, tenureMonths: 6, annualRate: ASSUMED_LENDER_RATE });
  const saved = savingsPlanValue(price / 6, SAFE_RETURN_RATE, 6);

  const offers: PaymentOffer[] = [
    interestEmiOffer({
      id: 'bank-emi',
      label: bankLabel,
      price,
      tenureMonths,
      annualRate: plan?.annualRate ?? ASSUMED_LENDER_RATE,
      stated: plan?.terms,
      selected: !choice && !!bank,
    }),
    upiOffer(price, { label: 'UPI / scan to pay', selected: choice === 'upi' }),
    {
      id: 'save-first',
      kind: 'wait',
      label: 'Save for 6 months, then book',
      description: `${inr(price / 6)} a month at ${SAFE_RETURN_RATE}% in a liquid fund`,
      benefit: `about ${inr(saved - price)} earned instead of paid`,
      rating: 'GOOD',
      reason: 'No loan and no fees, and the savings earn interest. Works when the trip is months away and fares are not rising.',
      trueCost: price,
    },
    noCostEmiOffer({ id: 'travel-nocost-emi', label: `${bank || 'Partner bank'} No-Cost EMI`, price, tenureMonths, selected: choice === 'nocost' }),
    {
      id: 'pay-later',
      kind: 'bnpl',
      label: 'Travel now, pay later',
      description: `About ${inr(payLater.monthlyEmi)} a month for 6 months`,
      benefit: `about ${inr(payLater.trueCost - price)} in interest, GST and fees`,
      rating: 'AVOID',
      reason: `Priced at an assumed ${ASSUMED_LENDER_RATE}% a year because the page does not show the lender's rate. Late payments add penalty fees on top.`,
      trueCost: Math.round(payLater.trueCost),
      selected: choice === 'tnpl',
    },
  ];

  // GST on travel: 5% on economy flights, 12% on business class and on most hotel stays.
  const gstRate = /hotel|stay|check-in|check-out|business\s*class/i.test(text) ? 12 : 5;
  const gst = gstInvoiceOffer(price, gstRate, 'MakeMyTrip');
  if (gst) offers.push(gst);

  return { surface: 'TRAVEL', name, price, offers };
}
