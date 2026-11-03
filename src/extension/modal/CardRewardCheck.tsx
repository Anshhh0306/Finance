import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Wallet } from 'lucide-react';
import { CARD_REWARD_PROFILES, findCardRewardProfile, getCardRewardRate, type SpendCategory } from '../../lib/card-rewards';
import { calculateCardReward } from '../../lib/finance';
import { inr } from '../format';
import { Chip } from './Chip';
import { Collapsible } from './Collapsible';
import { CUSTOM, useSavedCard } from './useSavedCard';

const QUICK_PICKS = ['amazon-pay-icici', 'flipkart-axis', 'hdfc-millennia', 'sbi-cashback', 'hdfc-infinia'];

/** The cashback or points the user's card earns when paying in full, all of which EMI forfeits. */
export function CardRewardCheck({ amount, spendCategory, defaultCardId }: { amount: number; spendCategory: SpendCategory; defaultCardId: string }) {
  const { cardId, customRate, save } = useSavedCard(defaultCardId);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');

  const card = findCardRewardProfile(cardId);
  const isCustom = cardId === CUSTOM || !card;
  const rate = isCustom ? customRate : getCardRewardRate(card, spendCategory);
  const { reward } = calculateCardReward(amount, rate);
  const q = query.trim().toLowerCase();
  const matches = q ? CARD_REWARD_PROFILES.filter((c) => c.shortLabel.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) : CARD_REWARD_PROFILES;

  return (
    <Collapsible
      title="Card reward check"
      icon={<Wallet className="w-3.5 h-3.5 text-ledger-navy/50" />}
      badge={<span className="font-mono tabular-nums text-xs text-ledger-debit">-{inr(reward)}</span>}
    >
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-ledger-navy/60">Which card are you using?</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {QUICK_PICKS.map((id) => (
            <Chip key={id} active={cardId === id} onClick={() => save(id)}>
              {findCardRewardProfile(id)?.shortLabel}
            </Chip>
          ))}
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll(!showAll)}
            className="px-2.5 py-1 text-xs font-semibold border border-dashed border-ledger-navy/30 text-ledger-navy/60 hover:border-ledger-navy/60 inline-flex items-center gap-1"
          >
            {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            More cards
          </button>
          <Chip active={cardId === CUSTOM} onClick={() => save(CUSTOM, customRate)}>
            Custom %
          </Chip>
        </div>
      </div>

      {showAll && (
        <div className="space-y-1.5 pt-1 border-t border-ledger-rule">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ledger-navy/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search cards"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your bank or card (e.g. Axis, HDFC, SBI)"
              className="w-full pl-8 pr-3 py-1.5 border border-ledger-rule text-sm font-medium text-ledger-navy focus:outline-none focus:border-ledger-navy bg-white"
            />
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
            {matches.map((c) => (
              <Chip
                key={c.id}
                active={cardId === c.id}
                className="w-full text-left px-2.5 py-1.5 text-xs font-semibold"
                onClick={() => {
                  save(c.id);
                  setShowAll(false);
                }}
              >
                {c.name}
              </Chip>
            ))}
            {matches.length === 0 && <p className="text-xs text-ledger-navy/50 px-1 py-2">No match. Use "Custom %" instead.</p>}
          </div>
        </div>
      )}

      {cardId === CUSTOM && (
        <label className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ledger-navy/60 shrink-0">Your card's reward rate</span>
          <input
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={customRate}
            onChange={(e) => save(CUSTOM, Math.max(0, Number(e.target.value) || 0))}
            className="w-20 px-2.5 py-1 border border-ledger-rule text-xs font-mono tabular-nums text-ledger-navy focus:outline-none focus:border-ledger-navy bg-white"
          />
          <span className="text-xs font-semibold text-ledger-navy/60">%</span>
        </label>
      )}

      <div className="grid grid-cols-2 divide-x divide-ledger-rule border border-ledger-rule">
        <div className="p-2.5">
          <div className="text-[11px] font-semibold text-ledger-navy/50">Paid in full</div>
          <div className="text-base font-bold font-mono tabular-nums text-ledger-credit">+{inr(reward)}</div>
          <div className="text-[11px] text-ledger-navy/50">
            {isCustom ? 'Custom card' : card.shortLabel} at {rate}%
          </div>
        </div>
        <div className="p-2.5">
          <div className="text-[11px] font-semibold text-ledger-navy/50">Converted to EMI</div>
          <div className="text-base font-bold font-mono tabular-nums text-ledger-debit">-{inr(reward)}</div>
          <div className="text-[11px] text-ledger-navy/50">EMI earns no reward</div>
        </div>
      </div>

      {!isCustom && <p className="text-[11px] text-ledger-navy/50 leading-relaxed">{card.notes}</p>}
    </Collapsible>
  );
}
