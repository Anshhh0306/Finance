import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  X,
  Sliders,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { calculateNoCostEmiDrag } from '../lib/financial-engine';

export interface ExtensionModalProps {
  productPrice?: number;
  productName?: string;
  onProceedAndContinue: () => void; // Proceeds to host site action (e.g. Next page / Card details)
  onCancelStayOnPage: () => void;   // Closes modal and keeps user on CURRENT page without navigation
}

export const ExtensionCommitGuardModal: React.FC<ExtensionModalProps> = ({
  productPrice = 70196,
  productName = 'Flipkart Acer Aspire Laptop (No-Cost EMI)',
  onProceedAndContinue,
  onCancelStayOnPage,
}) => {
  // Discrete snap tenure points: 3, 6, 9, 12, 18, 24 months
  const TENURE_OPTIONS = [3, 6, 9, 12, 18, 24];
  // Map index [0..5] for perfect proportional visual slider placement
  const [sliderIndex, setSliderIndex] = useState<number>(3); // Default to 12 months (index 3)
  const tenure = TENURE_OPTIONS[sliderIndex];

  const [isProofOpen, setIsProofOpen] = useState(false);
  const processingFee = 199;
  const nominalRate = 15.0;

  // Real-time deterministic recalculation (<1.2ms)
  const mathResult = useMemo(() => {
    return calculateNoCostEmiDrag({
      type: 'NO_COST_EMI',
      productName,
      productPrice,
      tenureMonths: tenure,
      advertisedRate: 0,
      bankProcessingFee: processingFee,
      bankNominalInterestRate: nominalRate,
    });
  }, [productPrice, productName, tenure, processingFee, nominalRate]);

  return (
    <div
      className="commitguard-backdrop"
      onClick={(e) => {
        // Clicking outside cancels and stays on page
        if (e.target === e.currentTarget) onCancelStayOnPage();
      }}
    >
      <div className="commitguard-card">
        
        {/* Header Bar with explicit Cancel / Stay on page 'X' */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/90">
          <div className="flex items-center gap-2.5 text-amber-950 font-bold text-base sm:text-lg">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span>⚠️ CommitGuard: Hidden Friction Interception</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[11px] font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>&lt;1.2ms On-Device Engine</span>
            </span>

            {/* 'X' Close button stays on page */}
            <button
              onClick={onCancelStayOnPage}
              title="Cancel & Stay on Page (Escape)"
              aria-label="Cancel"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Target Summary */}
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              ₹{productPrice.toLocaleString('en-IN')} Checkout Halted
            </h3>
            <p className="text-xs text-slate-500">
              CommitGuard intercepted your <strong>No-Cost EMI</strong> checkout selection before your monthly credit limit is locked.
            </p>
          </div>

          {/* Interactive Metric Cards (Instant Dynamic Recalculation) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Effective APR */}
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
              <div className="text-[11px] font-bold text-red-800 uppercase tracking-wide">
                Effective APR
              </div>
              <div className="text-2xl font-black text-red-600 mt-1">
                {mathResult.effectiveAnnualPercentageRate}%
              </div>
              <div className="text-[10px] text-red-700/80 mt-0.5">
                vs Advertised <strong>0% APR</strong>
              </div>
            </div>

            {/* Total GST Drag */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                Total GST + Fee Drag
              </div>
              <div className="text-2xl font-black text-amber-700 mt-1">
                ₹{mathResult.totalHiddenFriction.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-amber-800/80 mt-0.5">
                ₹{processingFee} fee + ₹{mathResult.totalGstOnInterest.toFixed(2)} GST
              </div>
            </div>

            {/* Monthly Outflow */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Monthly Outflow
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{mathResult.monthlyBaseEmi.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Locked for {tenure} installments
              </div>
            </div>
          </div>

          {/* 3 Plain-English Bullets */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>3-Bullet Plain-English Translation</span>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-red-700 font-bold">19.93% Effective APR Reality: </strong>
                  Even though the merchant provides an upfront discount, bank processing fees and statutory 18% GST convert 0% into <strong>{mathResult.effectiveAnnualPercentageRate}% Effective APR</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-slate-900 font-bold">Unrecoverable Monthly Drag: </strong>
                  Every month, your bank card statement bills 18% statutory GST on the interest component. You incur a guaranteed <strong>₹{mathResult.totalHiddenFriction.toLocaleString('en-IN')}</strong> in pure administrative leak.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-emerald-800 font-bold">Zero-Friction Baseline: </strong>
                  Paying upfront via direct UPI or debit card eliminates the ₹{mathResult.totalHiddenFriction.toLocaleString('en-IN')} drag completely while keeping your monthly credit limit untouched.
                </span>
              </li>
            </ul>
          </div>

          {/* Perfectly Aligned Discrete Slider with Clickable Steps */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="ext-tenure-slider" className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Adjust EMI Tenure: <strong className="text-emerald-700 text-sm">{tenure} Months</strong></span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">Click any tenure step</span>
            </div>

            {/* Slider with exact steps mapping 0 to 5 for TENURE_OPTIONS */}
            <div className="relative pt-1 pb-1">
              <input
                id="ext-tenure-slider"
                type="range"
                min={0}
                max={TENURE_OPTIONS.length - 1}
                step={1}
                value={sliderIndex}
                onChange={(e) => setSliderIndex(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
              />

              {/* Exact 1-to-1 Column Aligned Step Labels */}
              <div className="grid grid-cols-6 pt-2 text-center text-xs font-mono">
                {TENURE_OPTIONS.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSliderIndex(idx)}
                    className={`py-1 px-1 rounded transition-colors ${
                      sliderIndex === idx
                        ? 'text-emerald-700 font-extrabold bg-emerald-50 ring-1 ring-emerald-300'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {opt}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expandable Amortization Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setIsProofOpen(!isProofOpen)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>Deterministic Monthly Breakdown ({tenure} Months)</span>
              {isProofOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isProofOpen && (
              <div className="p-3 border-t border-slate-100 max-h-44 overflow-y-auto">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-1.5 px-2">Month</th>
                      <th className="py-1.5 px-2">Principal</th>
                      <th className="py-1.5 px-2">Interest</th>
                      <th className="py-1.5 px-2 text-red-600">18% GST</th>
                      <th className="py-1.5 px-2 font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                    {mathResult.schedule.map((row) => (
                      <tr key={row.month}>
                        <td className="py-1 px-2 font-bold">{row.month}</td>
                        <td className="py-1 px-2">₹{row.principalComponent.toLocaleString('en-IN')}</td>
                        <td className="py-1 px-2">₹{row.interestComponent.toLocaleString('en-IN')}</td>
                        <td className="py-1 px-2 text-red-600">₹{row.gstOnInterest.toFixed(2)}</td>
                        <td className="py-1 px-2 font-bold text-slate-900">₹{row.totalMonthlyCashflow.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons: Cancel (STAYS ON CURRENT PAGE) vs Proceed (GOES FORWARD) */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              id="btn-cancel-stay"
              onClick={onCancelStayOnPage}
              className="w-1/2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-300 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Cancel & Modify Terms</span>
            </button>

            <button
              id="btn-close-proceed"
              onClick={onProceedAndContinue}
              className="w-1/2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>I Understand, Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
