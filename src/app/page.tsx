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
  Bike,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { CommitGuardModal, InterceptorType } from '@/components/CommitGuardModal';
import { VehicleCatalogPage } from '@/components/VehicleCatalogPage';
import { NeutralDirectory } from '@/components/NeutralDirectory';
import { DemoController } from '@/components/DemoController';

type ActiveTab = 'TAB_ECOMMERCE' | 'TAB_VEHICLE' | 'TAB_DIRECTORY';

export default function HackathonJudgeWrapper() {
  // Scenario Switcher State
  const [activeTab, setActiveTab] = useState<ActiveTab>('TAB_ECOMMERCE');

  // Interceptor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<InterceptorType>('EMI');

  // Transaction Authorization States
  const [isEcomOrderPlaced, setIsEcomOrderPlaced] = useState(false);
  const [isVehicleLoanAuthorized, setIsVehicleLoanAuthorized] = useState(false);

  // E-Commerce purchase details
  const ecomPrice = 80000;

  // Triggers
  const handleTriggerEcom = () => {
    setModalType('EMI');
    setIsModalOpen(true);
  };

  const handleTriggerVehicle = () => {
    setModalType('VEHICLE_LOAN');
    setIsModalOpen(true);
  };

  // Reset Hackathon Demo loop
  const handleResetDemo = () => {
    setIsModalOpen(false);
    setIsEcomOrderPlaced(false);
    setIsVehicleLoanAuthorized(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Persistent Top Navigation Bar: The Judge's Scenario Switcher */}
      <header className="max-w-6xl mx-auto w-full pb-5 border-b border-slate-200 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black tracking-tight text-base shadow-sm">
              CG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">CommitGuard</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wide">
                  Embedded Pre-Commitment Interceptor
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Track 3: Payments & Embedded Finance • Finance Where the Decision Happens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Point-of-Sale Non-Financial DOM Simulation</span>
          </div>
        </div>

        {/* 3 Distinct Navigation Tabs */}
        <nav aria-label="Scenario Tabs" className="grid grid-cols-3 gap-2 bg-slate-200/70 p-1 rounded-2xl">
          {/* Tab 1: E-Commerce EMI Checkout */}
          <button
            id="tab-ecommerce"
            onClick={() => {
              setActiveTab('TAB_ECOMMERCE');
              setIsModalOpen(false);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'TAB_ECOMMERCE'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-600" />
            <span>1. E-Commerce EMI</span>
          </button>

          {/* Tab 2: Vehicle Catalog (Loan vs. SIP) */}
          <button
            id="tab-vehicle"
            onClick={() => {
              setActiveTab('TAB_VEHICLE');
              setIsModalOpen(false);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'TAB_VEHICLE'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-4 h-4 text-indigo-600" />
            <span>2. Vehicle Catalog (Loan vs SIP)</span>
          </button>

          {/* Tab 3: Neutral Reference Directory */}
          <button
            id="tab-directory"
            onClick={() => {
              setActiveTab('TAB_DIRECTORY');
              setIsModalOpen(false);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'TAB_DIRECTORY'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>3. Neutral Directory</span>
          </button>
        </nav>

      </header>

      {/* Main Viewport Content Area */}
      <main className="max-w-6xl mx-auto w-full py-6 sm:py-8 flex-1">
        
        {/* ==================================================================== */}
        {/* SCENARIO A: E-Commerce EMI Checkout (The EMI Trap)                   */}
        {/* ==================================================================== */}
        {activeTab === 'TAB_ECOMMERCE' && (
          <div className="space-y-6">
            {isEcomOrderPlaced ? (
              <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white border border-emerald-200 shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Payment Authorized with Decision Clarity
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Order <strong>#ORD-892410</strong> for <strong>₹80,000.00</strong> was authorized after the user understood the true <strong>19.93% Effective APR</strong>, ₹199 processing fee, and 18% statutory GST overhead.
                </p>
                <button
                  onClick={handleResetDemo}
                  className="mt-2 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md transition-all"
                >
                  Reset & Test Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Panel: Shopping Cart (₹80,000 Laptop) - 7 Columns */}
                <section aria-label="Shopping Cart" className="lg:col-span-7 space-y-5">
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
                            ProBook 16-inch M-Series Laptop
                          </h3>
                          <div className="text-right">
                            <div className="text-xl font-black text-slate-900">₹80,000.00</div>
                            <div className="text-xs text-slate-400 line-through">₹89,990.00</div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-normal">
                          Space Gray • 32GB Unified Memory • 1TB Superfast SSD • Liquid Retina XDR
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
                        <span>1-Year Comprehensive Warranty</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Right Panel: Hardcoded 0% No-Cost EMI & Place Order & Pay Button - 5 Columns */}
                <section aria-label="Payment Selection" className="lg:col-span-5 space-y-5">
                  <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        Payment Selection
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Selected payment method hardcoded for pre-commitment interception
                      </p>
                    </div>

                    {/* Hardcoded Selected Payment Method */}
                    <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="payment_choice"
                            id="payment_nocost_emi_hardcoded"
                            checked={true}
                            readOnly
                            className="w-4 h-4 mt-0.5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor="payment_nocost_emi_hardcoded"
                                className="font-extrabold text-sm text-slate-900 cursor-pointer"
                              >
                                0% No-Cost EMI (12 Months)
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

                    {/* Order Summary */}
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
                        <span className="text-sm font-bold text-slate-900">Order Total</span>
                        <span className="text-2xl font-black text-slate-900">₹80,000.00</span>
                      </div>
                    </div>

                    {/* Prominent Action Button: Place Order & Pay */}
                    <button
                      id="btn-place-order-pay"
                      onClick={handleTriggerEcom}
                      className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <Lock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Place Order & Pay</span>
                    </button>

                    <div className="text-center text-[10px] text-slate-400">
                      Halts checkout instantly to compute deterministic Effective APR and statutory GST.
                    </div>
                  </div>
                </section>

              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* SCENARIO B: Vehicle Catalog (The "Time vs. Debt" Engine)             */}
        {/* ==================================================================== */}
        {activeTab === 'TAB_VEHICLE' && (
          <VehicleCatalogPage
            onCalculateLoan={handleTriggerVehicle}
            isLoanAuthorized={isVehicleLoanAuthorized}
            onReset={handleResetDemo}
          />
        )}

        {/* ==================================================================== */}
        {/* SCENARIO C: Neutral Reference Directory                             */}
        {/* ==================================================================== */}
        {activeTab === 'TAB_DIRECTORY' && (
          <NeutralDirectory />
        )}

      </main>

      {/* Unified CommitGuard Interceptor Modal */}
      <CommitGuardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        initialProductPrice={modalType === 'EMI' ? ecomPrice : 1500000}
        onProceedAnyway={() => {
          setIsModalOpen(false);
          if (modalType === 'EMI') setIsEcomOrderPlaced(true);
          if (modalType === 'VEHICLE_LOAN') setIsVehicleLoanAuthorized(true);
        }}
        onModifyTerms={() => setIsModalOpen(false)}
      />

      {/* Persistent Floating Demo Controller (Bottom Right) */}
      <DemoController
        onReset={handleResetDemo}
        isInterceptionActive={isModalOpen}
      />

    </div>
  );
}
