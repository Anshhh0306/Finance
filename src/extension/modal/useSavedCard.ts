import { useEffect, useState } from 'react';
import { findCardRewardProfile } from '../../lib/card-rewards';

const CARD_KEY = 'commitguard_selected_card_id';
const RATE_KEY = 'commitguard_custom_card_rate';

/** Card id from the reward database, or CUSTOM for a user-entered reward rate. */
export const CUSTOM = 'custom';

/** The user's card, remembered across checkouts and devices with chrome.storage.sync. */
export function useSavedCard(defaultCardId: string) {
  const [cardId, setCardId] = useState(defaultCardId);
  const [customRate, setCustomRate] = useState(2);

  useEffect(() => {
    try {
      chrome.storage.sync.get([CARD_KEY, RATE_KEY], (items) => {
        const saved = items[CARD_KEY];
        if (saved === CUSTOM || (typeof saved === 'string' && findCardRewardProfile(saved))) setCardId(saved);
        if (typeof items[RATE_KEY] === 'number') setCustomRate(items[RATE_KEY]);
      });
    } catch {
      // Not running as an extension (e.g. rendered in the promo video): keep the defaults.
    }
  }, []);

  const save = (id: string, rate?: number) => {
    setCardId(id);
    if (rate !== undefined) setCustomRate(rate);
    try {
      chrome.storage.sync.set({ [CARD_KEY]: id, ...(rate !== undefined && { [RATE_KEY]: rate }) });
    } catch {
      // Same as above: nothing to persist to.
    }
  };

  return { cardId, customRate, save };
}
