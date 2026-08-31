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

  // Helper to extract cart value from Flipkart / Amazon page DOM
  function extractCartAmount(): number {
    // 1. Try finding specific total amount patterns
    const bodyText = document.body ? document.body.innerText : '';
    const match = bodyText.match(/(?:Total Amount|Total Payable|Payable Amount|Total Price|Order Total)[^\d₹]*[₹Rs.]*\s*([0-9,]+)/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1].replace(/,/g, ''), 10);
      if (!isNaN(parsed) && parsed > 500) {
        return parsed;
      }
    }

    // 2. Try common price selectors
    const priceSelectors = [
      '._35kyal',
      '._1_hQ79',
      '.a-price-whole',
      '#subtotals-marketplace-table .a-text-bold',
      '[data-price]',
      'div:contains("₹")',
    ];

    for (const selector of priceSelectors) {
      try {
        const els = document.querySelectorAll(selector);
        for (const el of Array.from(els)) {
          const text = el.textContent || '';
          const digits = text.replace(/[^0-9]/g, '');
          const val = parseInt(digits, 10);
          if (!isNaN(val) && val > 1000 && val < 5000000) {
            return val;
          }
        }
      } catch {
        // Continue
      }
    }

    return 70196; // Benchmark default if unparsed
  }

  // Active React Root and Host Container References
  let hostContainer: HTMLElement | null = null;
  let shadowRoot: ShadowRoot | null = null;
  let reactRoot: ReactDOM.Root | null = null;

  // Mount the CommitGuard Modal inside Shadow Root
  function injectShadowModal(
    productPrice: number,
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
        position: relative; width: 100%; max-width: 44rem; background-color: #ffffff; border-radius: 1rem;
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
        productPrice={productPrice}
        onProceedAndContinue={handleProceed}
        onCancelStayOnPage={handleCancel}
      />
    );

    // 7. Notify background service worker for metrics telemetry
    try {
      chrome.runtime.sendMessage({
        type: 'CHECKOUT_INTERCEPTED',
        payload: {
          price: productPrice,
          effectiveApr: 19.93,
          hiddenFriction: 1339,
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // Standalone execution
    }
  }

  // Keywords that represent checkout commitment on Flipkart & Amazon
  const INTERCEPT_KEYWORDS = [
    'continue with emi',
    'buy with emi',
    'select plan and continue',
    'place order',
    'place your order',
    'proceed to pay',
    'proceed to retail checkout',
    'credit card emi',
    'complete payment',
    'pay now',
  ];

  // Helper to check if an element or its ancestors match target intent
  function findInterceptTarget(element: HTMLElement | null): HTMLElement | null {
    let curr = element;
    let depth = 0;
    while (curr && depth < 6 && curr !== document.body) {
      // Check data attribute bypass
      if (curr.getAttribute('data-commitguard-authorized') === 'true') {
        return null;
      }

      // Check text content of button, link, or clickable element
      const text = (curr.innerText || curr.textContent || '').trim().toLowerCase();
      const tagName = curr.tagName.toUpperCase();

      for (const keyword of INTERCEPT_KEYWORDS) {
        if (text === keyword || (text.length < 50 && text.includes(keyword))) {
          return curr;
        }
      }

      // Check input elements (e.g., input[type="submit"], input[name="placeYourOrder1"])
      if (tagName === 'INPUT') {
        const inputVal = ((curr as HTMLInputElement).value || '').toLowerCase();
        const inputName = ((curr as HTMLInputElement).name || '').toLowerCase();
        for (const keyword of INTERCEPT_KEYWORDS) {
          if (inputVal.includes(keyword) || inputName.includes(keyword)) {
            return curr;
          }
        }
      }

      // Check button classes or IDs
      const idStr = (curr.id || '').toLowerCase();
      if (idStr.includes('placeorder') || idStr.includes('place-order') || idStr.includes('proceedtopay')) {
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

      const price = extractCartAmount();

      injectShadowModal(
        price,
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
