'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  CreditCard,
  Truck,
  ShieldCheck,
  Lock,
  Laptop,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { InterceptorModal } from '@/components/InterceptorModal';
import { DemoController } from '@/components/DemoController';

export default function CheckoutPage() {
  // Modal visibility and post-commitment state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // E-Commerce purchase details
  const productPrice = 80000;
  const tenureMonths = 12;
  const processingFee = 199;
  const nominalRate = 15.0;

  // Intercept trigger when user clicks "Place Order & Pay"
  const handlePlaceOrderClick = () => {
    setIsModalOpen(true);
  };

  // Reset hackathon demo state loop
  const handleResetDemo = () => {
    setIsModalOpen(false);
    setIsOrderPlaced(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Top E-Commerce Header Bar */}
      <header className="max-w-6xl mx-auto w-full pb-6 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black tracking-tight text-lg shadow-sm">
            CG
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">TechStore India</span>
            <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              CommitGuard Verified Checkout
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">256-Bit SSL Encrypted Payment Gate</span>
        </div>
      </header>

      {/* Main Checkout Viewport Container */}
      <main className="max-w-6xl mx-auto w-full py-8 flex-1">
        
        {/* Order Completion State (Post-Commitment) */}
        {isOrderPlaced ? (
          <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white border border-emerald-200 shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Payment Successfully Authorized
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Order <strong>#ORD-892410</strong> for <strong>₹80,000.00</strong> was authorized with full pre-commitment decision clarity.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1">
              <div className="font-bold text-slate-800">CommitGuard Verification Record:</div>
              <div>• Effective APR Disclosed: <strong>16.4%</strong> (vs Advertised 0%)</div>
              <div>• Non-refundable Processing Fee: <strong>₹199 + 18% GST</strong></div>
              <div>• Monthly Repayment Schedule: <strong>12 Installments</strong></div>
            </div>
            <button
              onClick={handleResetDemo}
              className="mt-2 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md transition-all"
            >
              Reset & Test Checkout Again
            </button>
          </div>
        ) : (
          /* High-Fidelity 2-Panel E-Commerce Checkout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Panel: Shopping Cart (₹80,000 Laptop) - 7 Columns */}
            <section aria-label="Shopping Cart" className="lg:col-span-7 space-y-6">
              
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                    <ShoppingBag className="w-5 h-5 text-slate-700" />
                    <span>Review Shopping Bag (1 Item)</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Ready to Dispatch
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-inner">
                    <Laptop className="w-12 h-12 text-slate-700" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-lg text-slate-900">
                        ProBook 16-inch M-Series
                      </h3>
                      <div className="text-right">
                        <div className="text-xl font-black text-slate-900">₹80,000.00</div>
                        <div className="text-xs text-slate-400 line-through">₹89,990.00</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal">
                      Midnight Finish • 32GB Unified Memory • 1TB Superfast SSD • Liquid Retina XDR
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                      <span>Qty: 1</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">Free Express Shipping</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <Truck className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Delivers Tomorrow to Bangalore 560001</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>1-Year Comprehensive Warranty Included</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address Snapshot */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">Shipping to: Anshul Sharma</div>
                  <div className="text-slate-500">Flat 402, Embassy Heights, MG Road, Bangalore 560001</div>
                </div>
                <span className="text-emerald-600 font-semibold hover:underline cursor-pointer">
                  Change
                </span>
              </div>
            </section>

            {/* Right Panel: Payment Selection & Order Total - 5 Columns */}
            <section aria-label="Payment Method & Summary" className="lg:col-span-5 space-y-6">
              
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Payment Method
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hardcoded to test the pre-commitment interception hook
                  </p>
                </div>

                {/* Hardcoded Option: "0% No-Cost EMI for 12 Months" */}
                <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_option"
                        id="payment_nocost_emi"
                        checked={true}
                        readOnly
                        className="w-4 h-4 mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="payment_nocost_emi"
                            className="font-extrabold text-sm text-slate-900 cursor-pointer"
                          >
                            0% No-Cost EMI for 12 Months
                          </label>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                            Advertised 0%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          HDFC Bank Credit Card • ₹6,667 / month
                        </p>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-emerald-700 shrink-0" />
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800">
                    <span>Upfront Merchant Interest Subsidy:</span>
                    <strong className="font-bold">-₹6,400.00</strong>
                  </div>
                </div>

                {/* Order Summary Calculations */}
                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Product Subtotal</span>
                    <span className="font-semibold text-slate-900">₹80,000.00</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Estimated Shipping</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Advertised Interest</span>
                    <span className="font-semibold text-slate-900">₹0.00 (0% EMI)</span>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-slate-900">Final Order Amount</span>
                    <span className="text-2xl font-black text-slate-900">₹80,000.00</span>
                  </div>
                </div>

                {/* Prominent Commitment Button: "Place Order & Pay" */}
                <button
                  id="btn-place-order-pay"
                  onClick={handlePlaceOrderClick}
                  className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <Lock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Place Order & Pay</span>
                </button>

                <div className="text-center text-[10px] text-slate-400">
                  By clicking Place Order & Pay, your payment commitment will be authorized.
                </div>
              </div>
            </section>

          </div>
        )}
      </main>

      {/* Embedded Pre-Commitment Interceptor Modal */}
      <InterceptorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onModifyTerms={() => setIsModalOpen(false)}
        onProceedAnyway={() => {
          setIsModalOpen(false);
          setIsOrderPlaced(true);
        }}
        productPrice={productPrice}
        tenureMonths={tenureMonths}
        processingFee={processingFee}
        nominalRate={nominalRate}
      />

      {/* Floating Demo Controller Button Fixed to Bottom Right */}
      <DemoController
        onReset={handleResetDemo}
        isInterceptionActive={isModalOpen}
      />
    </div>
  );
}
