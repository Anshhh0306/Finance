import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { calculateCreditUtilization, type UtilizationTier } from '../../lib/finance';
import { inr } from '../format';
import { Chip } from './Chip';
import { Collapsible } from './Collapsible';

const LIMIT_PRESETS = [50_000, 1_00_000, 2_00_000];

const TIER_INK: Record<UtilizationTier, string> = { SAFE: 'text-ledger-credit', CAUTION: 'text-ledger-seal', DANGER: 'text-ledger-debit' };
const TIER_BAR: Record<UtilizationTier, string> = { SAFE: 'bg-ledger-credit', CAUTION: 'bg-ledger-seal', DANGER: 'bg-ledger-debit' };

/** How much of the card limit this purchase blocks, and what that may do to a CIBIL score. */
export function CreditLimitImpact({ orderAmount }: { orderAmount: number }) {
  const [creditLimit, setCreditLimit] = useState(1_00_000);
  const [customLimit, setCustomLimit] = useState(false);
  const [existingBalance, setExistingBalance] = useState(0);
  const usage = calculateCreditUtilization({ orderAmount, existingBalance, creditLimit });

  return (
    <Collapsible
      title="Credit limit impact"
      icon={<CreditCard className="w-3.5 h-3.5 text-ledger-navy/50" />}
      badge={<span className={`font-mono tabular-nums text-xs ${TIER_INK[usage.tier]}`}>{usage.utilizationPercent}%</span>}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-semibold text-ledger-navy/60">Your total card limit</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {LIMIT_PRESETS.map((preset) => (
            <Chip
              key={preset}
              active={!customLimit && creditLimit === preset}
              onClick={() => {
                setCreditLimit(preset);
                setCustomLimit(false);
              }}
            >
              {preset >= 1_00_000 ? `₹${preset / 1_00_000}L` : `₹${preset / 1000}k`}
            </Chip>
          ))}
          <Chip active={customLimit} onClick={() => setCustomLimit(true)}>
            Custom
          </Chip>
        </div>
      </div>

      {customLimit && (
        <input
          type="number"
          min={0}
          aria-label="Your total credit limit in rupees"
          value={creditLimit}
          onChange={(e) => setCreditLimit(Math.max(0, Number(e.target.value) || 0))}
          className="w-full px-3 py-1.5 border border-ledger-rule text-sm font-semibold text-ledger-navy focus:outline-none focus:border-ledger-navy bg-white"
        />
      )}

      <label className="flex items-center gap-2">
        <span className="text-xs font-semibold text-ledger-navy/60 shrink-0">Already spent on this card</span>
        <input
          type="number"
          min={0}
          value={existingBalance || ''}
          onChange={(e) => setExistingBalance(Math.max(0, Number(e.target.value) || 0))}
          placeholder="₹0"
          className="w-28 px-2.5 py-1 border border-ledger-rule text-xs font-mono tabular-nums text-ledger-navy focus:outline-none focus:border-ledger-navy bg-white"
        />
      </label>

      <div className="space-y-1.5">
        <div className="text-xs font-mono tabular-nums text-ledger-navy/60">
          {inr(usage.blockedAmount)} of {inr(creditLimit)} blocked
        </div>
        <div className="h-1.5 w-full bg-ledger-rule/60">
          <div className={`h-full ${TIER_BAR[usage.tier]}`} style={{ width: `${Math.min(100, usage.utilizationPercent)}%` }} />
        </div>
      </div>

      <p className="text-sm text-ledger-navy/80 leading-relaxed border-l-2 border-ledger-rule pl-2.5">
        {usage.tier === 'SAFE' && `This uses only ${usage.utilizationPercent}% of your limit, with no expected score impact.`}
        {usage.tier === 'CAUTION' &&
          `This locks ${usage.utilizationPercent}% of your ${inr(creditLimit)} limit, which may dip your score by about ${usage.scoreDropEstimate} points if it stays that high through your next billing cycle.`}
        {usage.tier === 'DANGER' &&
          `This locks ${usage.utilizationPercent}% of your ${inr(creditLimit)} limit. Expect a score drop of about ${usage.scoreDropEstimate} points on your next report.`}
      </p>
    </Collapsible>
  );
}
