/**
 * CommitGuard - Background Service Worker (Manifest V3)
 * Handles background telemetry, state synchronization, and extension lifecycle.
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('🛡️ CommitGuard MV3 Extension Successfully Installed');
    chrome.storage.local.set({
      interceptionsCount: 0,
      frictionPreventedRupees: 0,
      interceptorActive: true,
      lastUpdated: new Date().toISOString(),
    });
  }
});

// Listen for message events from injected content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECKOUT_INTERCEPTED') {
    console.log(`🛡️ CommitGuard: Checkout Interception Event from tab ${sender.tab?.id}`, message.payload);
    
    // Increment telemetry counters in storage
    chrome.storage.local.get(['interceptionsCount', 'frictionPreventedRupees'], (data) => {
      const currentCount = (data.interceptionsCount || 0) + 1;
      const currentPrevented = (data.frictionPreventedRupees || 0) + (message.payload.hiddenFriction || 1339);
      
      chrome.storage.local.set({
        interceptionsCount: currentCount,
        frictionPreventedRupees: currentPrevented,
        lastInterception: {
          timestamp: new Date().toISOString(),
          url: sender.tab?.url,
          price: message.payload.price,
          effectiveApr: message.payload.effectiveApr,
        },
      });
    });

    sendResponse({ status: 'ACK_INTERCEPTED' });
  }

  if (message.type === 'GET_STATUS') {
    chrome.storage.local.get(['interceptionsCount', 'frictionPreventedRupees', 'interceptorActive'], (data) => {
      sendResponse(data);
    });
    return true; // Keep message channel open for async response
  }
});
