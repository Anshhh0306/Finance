"use strict";
(() => {
  // src/extension/background.ts
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      console.log("\u{1F6E1}\uFE0F CommitGuard MV3 Extension Successfully Installed");
      chrome.storage.local.set({
        interceptionsCount: 0,
        frictionPreventedRupees: 0,
        interceptorActive: true,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "CHECKOUT_INTERCEPTED") {
      console.log(`\u{1F6E1}\uFE0F CommitGuard: Checkout Interception Event from tab ${sender.tab?.id}`, message.payload);
      chrome.storage.local.get(["interceptionsCount", "frictionPreventedRupees"], (data) => {
        const currentCount = (data.interceptionsCount || 0) + 1;
        const currentPrevented = (data.frictionPreventedRupees || 0) + (message.payload.hiddenFriction || 1339);
        chrome.storage.local.set({
          interceptionsCount: currentCount,
          frictionPreventedRupees: currentPrevented,
          lastInterception: {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            url: sender.tab?.url,
            price: message.payload.price,
            effectiveApr: message.payload.effectiveApr
          }
        });
      });
      sendResponse({ status: "ACK_INTERCEPTED" });
    }
    if (message.type === "GET_STATUS") {
      chrome.storage.local.get(["interceptionsCount", "frictionPreventedRupees", "interceptorActive"], (data) => {
        sendResponse(data);
      });
      return true;
    }
  });
})();
