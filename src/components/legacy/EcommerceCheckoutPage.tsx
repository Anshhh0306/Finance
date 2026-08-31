'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ChevronRight,
  Info,
  Laptop,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CommitGuardWidget } from './CommitGuardWidget';

interface EcommerceCheckoutProps {
  onTriggerInterceptor: () => void;
  isInterceptorOpen: boolean;
  onProceed: () => void;
  onAbort: () => void;
  proceedTriggered: boolean;
  onReset: () => void;
}

export const EcommerceCheckoutPage: React.FC<EcommerceCheckoutProps> = ({
  onTriggerInterceptor,
  isInterceptorOpen,
  onProceed,
  onAbort,
  proceedTriggered,
  onReset,
}) => {
  const [selectedPayment, setSelectedPayment] = useState<'NO_COST_EMI' | 'CARD' | 'UPI'>('NO_COST_EMI');
  const [selectedTenure, setSelectedTenure] = useState<12 | 6 | 3>(12);

  const emiPayload = {
    type: 'NO_COST_EMI' as const,
    productName: 'Pro Laptop M-Series 16-inch (32GB RAM / 1TB SSD)',
    productPrice: 80000,
    tenureMonths: selectedTenure,
    advertisedRate: 0,
    bankProcessingFee: 199,
    bankNominalInterestRate: 15.0,
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* Zero-Click Hackathon Judge Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 sm:p-5 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Judge Interactive Evaluation Sandbox</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            Scenario A: Zero-Click E-Commerce Checkout (₹80,000 Laptop)
          </h2>
          <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
            Click <strong>“Place Order / Authorize Payment”</strong> below. CommitGuard intercepts at the exact moment of payment commitment to expose the 16.4% Effective APR and GST friction hidden behind the "0% No-Cost EMI" label.
          </p>
        </div>

        <button
          onClick={onReset}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition-all shadow flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Scenario</span>
        </button>
      </div>

      {/* Main E-Commerce Checkout Grid (Desktop 2-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Order Items & Payment Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Product Details Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-700" />
                Review Your Cart Item (1)
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                In Stock • Instant Dispatch
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <Laptop className="w-10 h-10 text-slate-800" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Pro Laptop M-Series 16-inch
                </h3>
                <p className="text-xs text-slate-500">
                  Space Black • 32GB Unified Memory • 1TB NVMe SSD • Retina XDR Display
                </p>
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-xl font-extrabold text-slate-900">₹80,000</span>
                  <span className="text-xs text-slate-400 line-through">₹89,900</span>
                  <span className="text-xs font-bold text-emerald-600">11% Off</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-400" />
                Free Express Delivery Tomorrow
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                1-Year AppleCare Coverage
              </span>
            </div>
          </div>

          {/* Payment Method Selection Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">
                Select Payment Option
              </h4>
              <p className="text-xs text-slate-500">
                Choose how you want to settle this purchase
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: 0% No-Cost EMI (Selected & Targeted by CommitGuard) */}
              <div
                onClick={() => setSelectedPayment('NO_COST_EMI')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPayment === 'NO_COST_EMI'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={selectedPayment === 'NO_COST_EMI'}
                      onChange={() => setSelectedPayment('NO_COST_EMI')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          Credit Card No-Cost EMI
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wide">
                          Advertised 0%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Zero nominal interest charged on your HDFC / ICICI / Axis card
                      </p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-slate-400" />
                </div>

                {/* Sub-Tenure Selector */}
                {selectedPayment === 'NO_COST_EMI' && (
                  <div className="mt-4 pt-3 border-t border-emerald-200/60 space-y-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Select Tenure:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { tenure: 12, emi: '₹6,667/mo', sub: '₹0 Interest' },
                        { tenure: 6, emi: '₹13,333/mo', sub: '₹0 Interest' },
                        { tenure: 3, emi: '₹26,667/mo', sub: '₹0 Interest' },
                      ].map((t) => (
                        <button
                          key={t.tenure}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTenure(t.tenure as 12 | 6 | 3);
                          }}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            selectedTenure === t.tenure
                              ? 'bg-white border-emerald-600 shadow-sm font-bold text-slate-900'
                              : 'bg-white/60 border-slate-200 hover:border-slate-300 text-slate-600 text-xs'
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-900">{t.tenure} Months</div>
                          <div className="text-[11px] text-emerald-700 font-medium">{t.emi}</div>
                          <div className="text-[10px] text-slate-400">{t.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Full Card Payment */}
              <div
                onClick={() => setSelectedPayment('CARD')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPayment === 'CARD'
                    ? 'border-emerald-600 bg-emerald-50/40'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={selectedPayment === 'CARD'}
                    onChange={() => setSelectedPayment('CARD')}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800">
                      Credit / Debit Card (One-Time Full Settlement)
                    </span>
                    <p className="text-xs text-slate-500">Pay entire ₹80,000 upfront with zero fees</p>
                  </div>
                </div>
              </div>

              {/* Option 3: UPI Instant Pay */}
              <div
                onClick={() => setSelectedPayment('UPI')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPayment === 'UPI'
                    ? 'border-emerald-600 bg-emerald-50/40'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={selectedPayment === 'UPI'}
                    onChange={() => setSelectedPayment('UPI')}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800">
                      BHIM UPI / Google Pay / PhonePe
                    </span>
                    <p className="text-xs text-slate-500">Instant direct account debit with 0 fees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary & Commitment Button (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Order Summary & Fee Transparency */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 sticky top-6">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Items Total</span>
                <span className="font-semibold text-slate-900">₹80,000.00</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Advertised EMI Scheme</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  0% Interest
                </span>
              </div>
              
              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-900">Order Total</span>
                <span className="text-2xl font-black text-slate-900">₹80,000.00</span>
              </div>
            </div>

            {/* CommitGuard Point-of-Sale Hook Notice */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pre-Commitment Protection Active</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                CommitGuard will verify true contractual terms before your card or credit facility is debited.
              </p>
            </div>

            {/* Primary Commitment Action Button (Target of Interception) */}
            <button
              id="btn-place-order"
              onClick={onTriggerInterceptor}
              className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <Lock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Place Order / Authorize Payment</span>
            </button>

            <div className="text-center text-[10px] text-slate-400">
              Safe & Secure 256-Bit SSL Encrypted Checkout
            </div>
          </div>
        </div>

      </div>

      {/* Post-Transaction Confirmation State */}
      {proceedTriggered && (
        <div className="p-8 rounded-2xl bg-white border border-emerald-200 shadow-md text-center space-y-3 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Transaction Authorized with Full Decision Clarity
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            The customer authorized this commitment after being fully informed of the <strong>16.4% Effective APR</strong>, statutory GST on interest, and processing fees.
          </p>
          <button
            onClick={onReset}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow"
          >
            Reset Demo & Retest Interception
          </button>
        </div>
      )}

      {/* Desktop-Scale Interceptor Modal / Drawer */}
      {isInterceptorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-3xl my-auto animate-in zoom-in-95 duration-200">
            <CommitGuardWidget
              commitmentType={emiPayload.type}
              initialPayload={emiPayload}
              onProceed={onProceed}
              onAbort={onAbort}
            />
          </div>
        </div>
      )}

    </div>
  );
};
