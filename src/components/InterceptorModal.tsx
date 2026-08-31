'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { calculateNoCostEmiDrag } from '@/lib/financial-engine';
import { EmiTradeoffResult } from '@/lib/types';

interface InterceptorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModifyTerms: () => void;
  onProceedAnyway: () => void;
  productPrice?: number;
  tenureMonths?: number;
  processingFee?: number;
  nominalRate?: number;
}

export const InterceptorModal: React.FC<InterceptorModalProps> = ({
  isOpen,
  onClose,
  onModifyTerms,
  onProceedAnyway,
  productPrice = 80000,
  tenureMonths = 12,
  processingFee = 199,
  nominalRate = 15.0,
}) => {
  const [isProofOpen, setIsProofOpen] = useState(false);

  // Instant deterministic calculation (<2ms execution, pure mathematical IRR & GST drag)
  const [mathResult, setMathResult] = useState<EmiTradeoffResult>(() =>
    calculateNoCostEmiDrag({
      type: 'NO_COST_EMI',
      productName: 'Pro Laptop M-Series 16-inch',
      productPrice,
      tenureMonths,
      advertisedRate: 0,
      bankProcessingFee: processingFee,
      bankNominalInterestRate: nominalRate,
    })
  );

  useEffect(() => {
    setMathResult(
      calculateNoCostEmiDrag({
        type: 'NO_COST_EMI',
        productName: 'Pro Laptop M-Series 16-inch',
        productPrice,
        tenureMonths,
        advertisedRate: 0,
        bankProcessingFee: processingFee,
        bankNominalInterestRate: nominalRate,
      })
    );
  }, [productPrice, tenureMonths, processingFee, nominalRate]);

  // Handle ESC key to dismiss modal quickly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Centered Frosted Glass Interceptor Modal */}
      <div className="relative w-full max-w-2xl my-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-150">
        
        {/* Top Header Bar with 'X' Close Escape Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/80">
          <div className="flex items-center gap-2.5 text-amber-950 font-bold text-base sm:text-lg">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span>⚠️ Hidden Friction Alert</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900 text-[11px] font-mono font-medium">
              <Zap className="w-3 h-3 text-amber-700" />
              <span>&lt;2ms Math Engine</span>
            </span>

            {/* Prominent 'X' Escape Button */}
            <button
              onClick={onClose}
              aria-label="Close modal (Escape)"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Main Context Headline */}
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Commitment Clarity: ₹{productPrice.toLocaleString('en-IN')} Laptop Checkout
            </h3>
            <p className="text-xs text-slate-500">
              CommitGuard intercepted your 12-Month No-Cost EMI selection to verify statutory costs before payment authorization.
            </p>
          </div>

          {/* Key Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80">
              <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
                Advertised vs True APR
              </div>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {mathResult.effectiveAnnualPercentageRate}%
              </div>
              <div className="text-[10px] text-amber-800/80 mt-0.5">
                Advertised as <strong>0% No-Cost</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80">
              <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wide">
                Total Hidden Outflow
              </div>
              <div className="text-2xl font-black text-rose-700 mt-1">
                ₹{mathResult.totalHiddenFriction.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-rose-800/80 mt-0.5">
                Upfront Fee + 18% GST Drag
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Monthly Repayment
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{mathResult.monthlyBaseEmi.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Committed for {tenureMonths} installments
              </div>
            </div>
          </div>

          {/* 3-Bullet Plain-English Translation (Core PRD Requirement) */}
          <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>3-Bullet Plain-English Trade-Off Summary</span>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-slate-900 font-semibold">True Cost & Fee Friction: </strong>
                  The advertised <strong>0% No-Cost EMI</strong> carries a <strong>{mathResult.effectiveAnnualPercentageRate}% Effective APR</strong> due to the non-refundable ₹{processingFee} bank processing fee and statutory 18% GST applied across monthly interest charges.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-slate-900 font-semibold">Liquidity & Cashflow Drag: </strong>
                  Locks <strong>₹{mathResult.monthlyBaseEmi.toLocaleString('en-IN')}/month</strong> of your credit limit for the next {tenureMonths} months, adding ₹{mathResult.totalGstOnInterest.toLocaleString('en-IN')} in pure tax overhead that is not recoverable.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-slate-900 font-semibold">Neutral Baseline Alternative: </strong>
                  Paying upfront in full (via UPI or Card) saves <strong>₹{mathResult.totalHiddenFriction.toLocaleString('en-IN')}</strong> in statutory GST and processing drag with zero credit lock-in.
                </span>
              </li>
            </ul>
          </div>

          {/* Proof Toggle Accordion: "View Mathematical Proof" */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setIsProofOpen(!isProofOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>View Mathematical Proof (Deterministic Amortization Schedule)</span>
              </div>
              {isProofOpen ? (
                <div className="flex items-center gap-1 text-slate-500">
                  <span>Hide Schedule</span>
                  <ChevronUp className="w-4 h-4" />
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-500">
                  <span>Show Schedule</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              )}
            </button>

            {isProofOpen && (
              <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
                <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                  <span>IRR Formula: <code>NPV(Cashflows, r_monthly) = 0</code></span>
                  <span>Statutory GST: <strong>18.00%</strong> applied on bank interest</span>
                </div>

                <div className="overflow-x-auto max-h-56 border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-2.5">Month</th>
                        <th className="py-2 px-2.5">Opening Bal</th>
                        <th className="py-2 px-2.5">Principal</th>
                        <th className="py-2 px-2.5">Interest</th>
                        <th className="py-2 px-2.5 text-rose-600">18% GST</th>
                        <th className="py-2 px-2.5 font-bold">Total Cashflow</th>
                        <th className="py-2 px-2.5">Closing Bal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {mathResult.schedule.map((row) => (
                        <tr key={row.month} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2.5 font-medium">{row.month}</td>
                          <td className="py-1.5 px-2.5">₹{row.openingBalance.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-2.5">₹{row.principalComponent.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-2.5">₹{row.interestComponent.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-2.5 text-rose-600 font-medium">₹{row.gstOnInterest.toFixed(2)}</td>
                          <td className="py-1.5 px-2.5 font-semibold text-slate-900">₹{row.totalMonthlyCashflow.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-2.5">₹{row.closingBalance.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] text-slate-500 leading-tight">
                  * Merchant Discount (₹{mathResult.merchantDiscount.toLocaleString('en-IN')}) offsets the bank interest, but does not offset the statutory ₹{mathResult.totalGstOnInterest.toLocaleString('en-IN')} GST drag or upfront ₹{processingFee} fee.
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Prominent 'Modify Payment Terms' + Muted 'I Understand, Proceed Anyway' */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={onModifyTerms}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Modify Payment Terms</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onProceedAnyway}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>I Understand, Proceed Anyway</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
