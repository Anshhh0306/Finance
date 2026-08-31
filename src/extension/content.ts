/**
 * CommitGuard Chrome Extension Content Script (Manifest V3)
 * Observes DOM mutations on checkout and banking screens.
 * Targets cart prices, EMI tenure dropdowns, and payment submission buttons.
 */

(() => {
  console.log('🛡️ CommitGuard Content Script Active: Monitoring Checkout DOM');

  // Selectors for major checkout buttons
  const CHECKOUT_BUTTON_SELECTORS = [
    'input[name="proceedToRetailCheckout"]',
    '#placeOrder',
    'button[type="submit"]',
    'button:contains("Proceed to Pay")',
    'button:contains("Place Order")',
    'button:contains("Confirm Booking")',
  ];

  function extractCheckoutPrice(): number | null {
    // Look for common price patterns like ₹80,000 or Rs. 80,000
    const priceElements = document.querySelectorAll(
      '.a-price-whole, .grand-total-price, [data-price], .cart-total'
    );
    for (const el of Array.from(priceElements)) {
      const cleaned = (el.textContent || '').replace(/[^0-9]/g, '');
      if (cleaned) {
        const val = parseInt(cleaned, 10);
        if (val > 1000) return val;
      }
    }
    return null;
  }

  function handlePaymentIntentIntercept(e: Event) {
    const price = extractCheckoutPrice() || 80000;
    console.log(`🛡️ CommitGuard: Intercepted potential commitment of ₹${price}`);
    // In production extension: Injects CommitGuard modal into host DOM or message-passes to background
  }

  function attachListeners() {
    for (const selector of CHECKOUT_BUTTON_SELECTORS) {
      try {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach((btn) => {
          if (!btn.getAttribute('data-commitguard-monitored')) {
            btn.setAttribute('data-commitguard-monitored', 'true');
            btn.addEventListener('click', handlePaymentIntentIntercept, { capture: true });
          }
        });
      } catch {
        // Continue scanning silently
      }
    }
  }

  // Observe ongoing dynamic mutations (SPA checkouts)
  const observer = new MutationObserver(() => {
    attachListeners();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  attachListeners();
})();
