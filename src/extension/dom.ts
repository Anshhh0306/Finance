/** Parsing and DOM-reading helpers shared by the site scrapers. */

export interface Range {
  min: number;
  max: number;
}

export const inRange = (n: number, { min, max }: Range) => n >= min && n <= max;

/** An amount like "₹3,439.00", "₹ 5,399" or "479", with the currency symbol optional. */
const AMOUNT = /[₹$€£]?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/;

/** First amount in the text, rounded to whole rupees. "₹539.00" is 539, not 53900. */
export function parseAmount(text: string): number {
  if (!text) return 0;
  const match = text.match(AMOUNT);
  const value = match ? parseFloat(match[1].replace(/,/g, '')) : NaN;
  if (value > 0) return Math.round(value);
  const digits = parseFloat(text.replace(/[^0-9.]/g, ''));
  return Number.isNaN(digits) ? 0 : Math.round(digits);
}

/** Every "₹ 1,234.56" amount in the text, in order. */
export function rupeeAmounts(text: string): number[] {
  return Array.from(text.matchAll(/₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/g), (m) => parseAmount(m[1]));
}

export const pageText = () => document.body?.innerText ?? '';

export const textOf = (el: Element | null | undefined) => (el?.textContent ?? '').trim();

/** Runs each pattern over the text and returns the first in-range amount (capture group 1). */
export function amountFromPatterns(text: string, patterns: RegExp[], range: Range): number {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const amount = match?.[1] ? parseAmount(match[1]) : 0;
    if (inRange(amount, range)) return amount;
  }
  return 0;
}

/** First in-range amount inside elements matching each selector, tried in order. */
export function amountFromSelectors(selectors: string[], range: Range, requireSymbol = false): number {
  for (const selector of selectors) {
    for (const el of Array.from(document.querySelectorAll(selector))) {
      const text = el.textContent ?? '';
      if (requireSymbol && !/[₹$€£]/.test(text)) continue;
      const amount = parseAmount(text);
      if (inRange(amount, range)) return amount;
    }
  }
  return 0;
}

/** First element text, among the selectors in order, that is longer than `minLength`. */
export function firstText(selectors: string[], { minLength = 3, maxLength = 70, reject }: { minLength?: number; maxLength?: number; reject?: RegExp } = {}): string {
  for (const selector of selectors) {
    const text = textOf(document.querySelector(selector));
    if (text.length > minLength && !(reject && reject.test(text))) return text.slice(0, maxLength);
  }
  return '';
}

/** Text the user can see on the clicked control and the button or form around it. */
export function clickedTexts(clicked: HTMLElement | null, parentSelector: string): string[] {
  if (!clicked) return [];
  const texts = [clicked.innerText, clicked.textContent, (clicked as HTMLInputElement).value, clicked.getAttribute('aria-label'), clicked.getAttribute('title')];
  const parent = clicked.closest(parentSelector);
  if (parent) texts.push(parent.textContent, (parent as HTMLInputElement).value, parent.getAttribute('aria-label'));
  return texts.filter((t): t is string => !!t);
}

/**
 * Checkouts span several pages, and later steps often hide the total. Remember the last price seen
 * in this tab and fall back to it.
 */
export function rememberAmount(key: string, amount: number, range: Range): number {
  try {
    if (amount > 0) {
      sessionStorage.setItem(key, String(amount));
      return amount;
    }
    const cached = Number(sessionStorage.getItem(key));
    return inRange(cached, range) ? cached : 0;
  } catch {
    return amount;
  }
}

export function rememberText(key: string, text: string): string {
  try {
    if (text) sessionStorage.setItem(key, text);
    else text = sessionStorage.getItem(key) ?? '';
  } catch {
    // sessionStorage can be unavailable (sandboxed frames); the live value is still fine.
  }
  return text;
}

export const CHECKED_OPTIONS = 'input[type="radio"]:checked, [aria-checked="true"]';

/** Text of each row that holds a checked option, e.g. the selected EMI plan. */
export function checkedRowTexts(selector = CHECKED_OPTIONS): string[] {
  return Array.from(document.querySelectorAll(selector), (el) => textOf(el.closest('li, label, tr, div') ?? el));
}

/**
 * Classifies the payment option the user picked: first the row they clicked, then whichever
 * option is checked on the page.
 */
export function classifySelection<T>(
  clicked: HTMLElement | null,
  classify: (text: string) => T | null,
  { clickedRow, checked = CHECKED_OPTIONS }: { clickedRow: string; checked?: string },
): T | null {
  if (clicked) {
    const result = classify(textOf(clicked.closest(clickedRow) ?? clicked));
    if (result) return result;
  }
  for (const text of checkedRowTexts(checked)) {
    const result = classify(text);
    if (result) return result;
  }
  return null;
}
