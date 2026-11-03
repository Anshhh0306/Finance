import { useMemo, useState } from 'react';
import { AlertTriangle, PiggyBank, TrendingUp } from 'lucide-react';
import { SAFE_RETURN_RATE, calculateNoCostEmi, futureValue, savingsPlanValue } from '../../lib/finance';
import { inr, inrPaise } from '../format';
import { Collapsible } from './Collapsible';

const TENURES = [3, 6, 9, 12, 18, 24];
const HORIZONS = [1, 3, 5] as const;

/** Effective APR of a "No-Cost" EMI on this price, with a tenure slider and the full schedule. */
export function EmiCostBreakdown({ price }: { price: number }) {
  const [tenureIndex, setTenureIndex] = useState(TENURES.indexOf(12));
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>(5);
  const tenure = TENURES[tenureIndex];
  const emi = useMemo(() => calculateNoCostEmi({ price, tenureMonths: tenure }), [price, tenure]);
  const gst = emi.gstOnFee + emi.gstOnInterest;

  return (
    <Collapsible
      title="What EMI actually costs"
      icon={<AlertTriangle className="w-3.5 h-3.5 text-ledger-navy/50" />}
      badge={<span className="font-mono tabular-nums text-xs text-ledger-debit">{emi.effectiveApr}% APR</span>}
      className="space-y-4"
    >
      <div className="grid grid-cols-3 divide-x divide-ledger-rule border border-ledger-rule">
        <div className="p-2.5">
          <div className="text-[11px] font-semibold text-ledger-navy/50">Effective APR</div>
          <div className="text-xl font-bold font-mono tabular-nums text-ledger-debit">{emi.effectiveApr}%</div>
          <div className="text-[11px] text-ledger-navy/50">vs 0% advertised</div>
        </div>
        <div className="p-2.5">
          <div className="text-[11px] font-semibold text-ledger-navy/50">GST + fee drag</div>
          <div className="text-xl font-bold font-mono tabular-nums text-ledger-navy">{inr(emi.hiddenCost)}</div>
          <div className="text-[11px] text-ledger-navy/50">
            {inr(emi.processingFee)} fee + {inrPaise(gst)} GST
          </div>
        </div>
        <div className="p-2.5">
          <div className="text-[11px] font-semibold text-ledger-navy/50">Monthly outflow</div>
          <div className="text-xl font-bold font-mono tabular-nums text-ledger-navy">{inr(emi.monthlyEmi)}</div>
          <div className="text-[11px] text-ledger-navy/50">for {tenure} months</div>
        </div>
      </div>

      <ul className="space-y-2 text-sm text-ledger-navy/80 leading-relaxed">
        <li className="border-l-2 border-ledger-debit pl-2.5">
          The merchant's upfront discount offsets the bank's interest, but the processing fee and 18% GST turn 0% into a{' '}
          <strong className="text-ledger-navy">{emi.effectiveApr}% effective APR</strong>.
        </li>
        <li className="border-l-2 border-ledger-seal pl-2.5">
          GST is charged on every month's interest, adding up to <strong className="text-ledger-navy">{inr(emi.hiddenCost)}</strong> you can't get back.
        </li>
        <li className="border-l-2 border-ledger-credit pl-2.5">
          Paying upfront by UPI or debit card avoids that {inr(emi.hiddenCost)} entirely and keeps your credit limit free.
        </li>
      </ul>

      <div className="border-t border-ledger-rule pt-3 space-y-2">
        <label htmlFor="commitguard-tenure" className="text-sm font-semibold text-ledger-navy flex items-center gap-1.5">
          Tenure: <span className="font-mono tabular-nums font-bold">{tenure} months</span>
        </label>
        <input
          id="commitguard-tenure"
          type="range"
          min={0}
          max={TENURES.length - 1}
          step={1}
          value={tenureIndex}
          onChange={(e) => setTenureIndex(Number(e.target.value))}
          className="w-full h-1.5 bg-ledger-rule appearance-none cursor-pointer accent-ledger-navy focus:outline-none"
        />
        <div className="flex items-center justify-between">
          {TENURES.map((months, i) => (
            <button
              key={months}
              type="button"
              onClick={() => setTenureIndex(i)}
              className={`px-2 py-1 text-xs font-mono tabular-nums ${i === tenureIndex ? 'text-ledger-navy font-bold' : 'text-ledger-navy/40'}`}
            >
              {months}m
            </button>
          ))}
        </div>
      </div>

      <Collapsible variant="nested" title="What that saved money could grow into" icon={<TrendingUp className="w-3.5 h-3.5" />} className="space-y-2.5">
        <p className="text-xs text-ledger-navy/50">
          If the {inr(emi.hiddenCost)} you saved went into a {SAFE_RETURN_RATE}% sovereign T-bill instead:
        </p>
        <div className="grid grid-cols-3 divide-x divide-ledger-rule border border-ledger-rule">
          {HORIZONS.map((years) => {
            const active = horizon === years;
            return (
              <button
                key={years}
                type="button"
                aria-pressed={active}
                onClick={() => setHorizon(years)}
                className={`p-2 text-center transition-colors ${active ? 'bg-ledger-navy text-white' : 'bg-white text-ledger-navy hover:bg-ledger-paper'}`}
              >
                <div className={`text-[11px] ${active ? 'text-white/60' : 'text-ledger-navy/50'}`}>
                  {years} year{years > 1 ? 's' : ''}
                </div>
                <div className="text-base font-bold font-mono tabular-nums">{inr(futureValue(emi.hiddenCost, SAFE_RETURN_RATE, years))}</div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-2 p-2.5 bg-ledger-navy text-white text-xs">
          <span className="flex items-center gap-2 text-white/80">
            <PiggyBank className="w-3.5 h-3.5 shrink-0" />
            Invest {inr(emi.monthlyEmi)} a month in a liquid fund instead:
          </span>
          <span className="font-mono tabular-nums font-bold shrink-0">{inr(savingsPlanValue(emi.monthlyEmi, SAFE_RETURN_RATE, tenure))}</span>
        </div>
      </Collapsible>

      <Collapsible variant="nested" title={`Full monthly breakdown (${tenure} months)`} className="">
        <div className="max-h-44 overflow-y-auto border border-ledger-rule">
          <table className="w-full text-[11px] text-left font-mono tabular-nums">
            <thead className="bg-ledger-paper text-ledger-navy/60 sticky top-0">
              <tr>
                <th className="py-1.5 px-2 font-semibold">Month</th>
                <th className="py-1.5 px-2 font-semibold">Principal</th>
                <th className="py-1.5 px-2 font-semibold">Interest</th>
                <th className="py-1.5 px-2 font-semibold text-ledger-debit">GST</th>
                <th className="py-1.5 px-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ledger-rule text-ledger-navy/70">
              {emi.schedule.map((row) => (
                <tr key={row.month}>
                  <td className="py-1 px-2 font-bold">{row.month}</td>
                  <td className="py-1 px-2">{inrPaise(row.principal)}</td>
                  <td className="py-1 px-2">{inrPaise(row.interest)}</td>
                  <td className="py-1 px-2 text-ledger-debit">{inrPaise(row.gstOnInterest)}</td>
                  <td className="py-1 px-2 font-bold text-ledger-navy">{inrPaise(row.payment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Collapsible>
    </Collapsible>
  );
}
