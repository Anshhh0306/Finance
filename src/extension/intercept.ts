/**
 * Recognises the click that actually commits money: "Place order", "Pay ₹…", "Continue with EMI".
 * Selecting a payment method, bank or tenure must never trigger CommitGuard; only the final
 * commit button does.
 */

const COMMIT_PHRASES = [
  // Shopping (Flipkart, Amazon)
  'continue with emi',
  'buy with emi',
  'pay with emi',
  'select plan and continue',
  'place order',
  'place your order',
  'proceed to pay',
  'proceed to retail checkout',
  'complete payment',
  'buy now',
  // Travel (MakeMyTrip)
  'travel now pay later',
  'travel now, pay later',
  'trip on emi',
  'book now pay later',
  'book now, pay later',
  'pay with trip money',
  'continue to payment',
  'pay & book now',
  'use this payment method',
  // Courses (Udemy)
  'education loan',
  'apply for education loan',
  'pay with loan',
  'apply for loan',
  'complete checkout',
  'enroll now',
  'buy this course',
  'go to cart',
];

/** Buttons whose wording varies, e.g. "Pay ₹31,763 via ICICI Bank". */
const COMMIT_PATTERN = /place\s*order|proceed\s*to\s*pay|proceed\s*to\s*buy|pay\s*₹|payment\s*of\s*₹|complete\s*payment|complete\s*checkout/i;

/** Info links that mention EMI or payment but commit nothing. */
const INFORMATIONAL = /learn\s*more|emi\s*available|view\s*details|show\s*details|see\s*options|how\s*it\s*works|terms\s*&\s*conditions|terms\s*apply|accordion/i;
const COMMIT_WORDS = /proceed|place\s*order|pay\s*now|buy\s*now|continue/i;

const AUTHORIZED = 'data-commitguard-authorized';

const tagOf = (el: Element) => el.tagName.toUpperCase();

const isSelectionControl = (el: HTMLElement) =>
  tagOf(el) === 'LABEL' || (tagOf(el) === 'INPUT' && /^(radio|checkbox)$/i.test((el as HTMLInputElement).type));

const isButtonLike = (el: HTMLElement) =>
  tagOf(el) === 'BUTTON' || tagOf(el) === 'A' || el.getAttribute('role') === 'button' || el.classList.toString().includes('btn');

const mentionsCommitPhrase = (text: string) => COMMIT_PHRASES.some((phrase) => text === phrase || (text.length < 70 && text.includes(phrase)));

/** The commit button the click landed in (up to 7 levels up), or null for any other click. */
export function findCommitButton(target: HTMLElement | null): HTMLElement | null {
  let el = target;
  for (let depth = 0; el && depth < 7 && el !== document.body; depth++, el = el.parentElement) {
    if (el.getAttribute(AUTHORIZED) === 'true') return null;
    if (isSelectionControl(el)) continue;

    const text = (el.innerText || el.textContent || '').trim().toLowerCase();
    if (INFORMATIONAL.test(text) && !COMMIT_WORDS.test(text)) return null;
    if (text.includes('emi available') || text.includes('your order qualifies for emi')) return null;
    if (mentionsCommitPhrase(text)) return el;
    if (COMMIT_PATTERN.test(text) && isButtonLike(el)) return el;

    if (tagOf(el) === 'INPUT' && /^(submit|button)$/i.test((el as HTMLInputElement).type)) {
      const value = (el as HTMLInputElement).value.toLowerCase();
      if (COMMIT_PHRASES.some((phrase) => value.includes(phrase)) || /pay|place\s*order|proceed/.test(value)) return el;
    }

    if (/placeorder|proceedtopay|emipayment/.test(el.id.toLowerCase()) || el.classList.toString().toLowerCase().includes('paylater')) return el;
  }
  return null;
}

/** Lets the held click through: mark the button so it is not intercepted again, then click it. */
export function replayClick(button: HTMLElement) {
  button.setAttribute(AUTHORIZED, 'true');
  // A javascript: href would be blocked by the page's CSP if followed directly; a synthetic
  // click runs the site's own handler instead.
  if (button.getAttribute('href')?.trim().toLowerCase().startsWith('javascript:')) {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  } else {
    button.click();
  }
}
