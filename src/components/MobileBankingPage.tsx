'use client';

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ChevronRight,
  Search,
  Headphones,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  MoneyTransferSymbol,
  BhimUpiSymbol,
  MobileRechargeSymbol,
  FdRdSymbol,
  BillPaySymbol,
  DebitCardSymbol,
  AccountStatementSymbol,
  OneTrackSymbol,
  QrScanSymbol,
} from '@/components/symbols/BankingSymbols';
import { CommitGuardWidget } from '@/components/CommitGuardWidget';

export const MobileBankingPage: React.FC = () => {
  const [showBalance, setShowBalance] = useState(false);
  const [activeTab, setActiveTab] = useState<'HOME' | 'PAY' | 'SERVICES' | 'APPLY'>('HOME');
  const [interceptorActive, setInterceptorActive] = useState(false);
  const [activeScenarioPayload, setActiveScenarioPayload] = useState<any>(null);

  // Trigger scenario from a banking action (e.g. FD/RD booking)
  const handleOpenFdCommitment = () => {
    setActiveScenarioPayload({
      type: 'FD_LOCKIN',
      institutionName: '1-Year Fixed Deposit',
      principalAmount: 500000,
      contractedTenureMonths: 12,
      contractedRate: 7.10,
      prematurePenaltyRate: 1.00,
      completedMonthsBeforeExit: 6,
      applicableCompletedRate: 5.50,
      liquidFundRateBenchmark: 6.75,
      investorTaxSlabPercent: 30,
    });
    setInterceptorActive(true);
  };

  // Trigger scenario from Bill Pay / EMI purchase
  const handleOpenEmiCommitment = () => {
    setActiveScenarioPayload({
      type: 'NO_COST_EMI',
      productName: 'Pro Laptop 12-Month EMI',
      productPrice: 80000,
      tenureMonths: 12,
      advertisedRate: 0,
      bankProcessingFee: 199,
      bankNominalInterestRate: 15.0,
    });
    setInterceptorActive(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center py-0 sm:py-8 px-0 sm:px-4">
      {/* Mobile Device Viewport Canvas (Matching Exact Reference Screenshot) */}
      <div className="w-full max-w-[420px] bg-white min-h-[920px] shadow-2xl sm:rounded-[36px] flex flex-col justify-between overflow-hidden border border-slate-200">
        
        {/* Scrollable Main Screen Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          
          {/* Top Status & App Bar */}
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <button aria-label="Search" className="hover:text-slate-900 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button aria-label="Support" className="hover:text-slate-900 transition-colors">
                <Headphones className="w-5 h-5" />
              </button>
              <button aria-label="Logout" className="hover:text-slate-900 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Savings Account Balance Card */}
          <div className="px-5 py-4 text-center space-y-2">
            <div className="text-xs text-slate-500 font-medium">
              Savings Account Balance
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                ₹{showBalance ? '2,48,750' : '•••'}
              </span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Toggle Balance Visibility"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div>
              <button className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">
                Manage Savings Account
              </button>
            </div>
          </div>

          {/* Quick Actions 4x2 Circular Red Icons Grid (Exact Reference Screenshot) */}
          <div className="px-4 pt-4 pb-2">
            <div className="grid grid-cols-4 gap-y-5 gap-x-2 text-center">
              
              {/* 1. Money Transfer */}
              <button
                onClick={handleOpenEmiCommitment}
                className="group flex flex-col items-center space-y-1.5 focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-[#e53935] hover:bg-[#d32f2f] text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                  <MoneyTransferSymbol size={26} />
                </div>
                <span className="text-[11px] font-medium text-slate-700 leading-tight">
                  Money Transfer
                </span>
              </button>

              {/* 2. BHIM UPI */}
              <button
                onClick={handleOpenEmiCommitment}
                className="group flex flex-col items-center space-y-1.5 focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-[#e53935] hover:bg-[#d32f2f] text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                  <BhimUpiSymbol size={26} />
                </div>
                <span className="text-[11px] font-medium text-slate-700 leading-tight">
                  BHIM UPI
                </span>
              </button>

              {/* 3. Mobile Recharge */}
              <button
                onClick={handleOpenEmiCommitment}
                className="group flex flex-col items-center space-y-1.5 focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-[#e53935] hover:bg-[#d32f2f] text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                  <MobileRechargeSymbol size={26} />
                </div>
                <span className="text-[11px] font-medium text-slate-700 leading-tight">
                  Mobile Recharge
                </span>
              </button>

              {/* 4. FD/RD (Fixed Deposit Lock-In Interceptor Trigger) */}
              <button
                onClick={handleOpenFdCommitment}
                className="group flex flex-col items-center space-y-1.5 focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-[#e53935] hover:bg-[#d32f2f] text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105 relative">
                  <FdRdSymbol size={26} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <span className="text-[11px] font-medium text-slate-700 leading-tight">
                  FD/RD
                </span>
              </button>

              {/* 5. Bill Pay */}
              <button
                onClick={handleOpenEmiCommitment}
                className="group flex flex-col items-center space-y-1.5 focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-[#e53935] hover:bg-[#d32f2f] text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                  <BillPaySymbol size={26} />
                </div>
                <span className="text-[11px] font-medium text-slate-700 leading-tight">
                  Bill Pay
                </span>
              </button>

              {/* 6. Debit Card */}
              <button
                onClick={handleOpenEmiCommitment}
                className="group flex flex-col items-center space-y-1.5 focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-[#e53935] hover:bg-[#d32f2f] text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                  <DebitCardSymbol size={26} />
                </div>
                <span className="text-[11px] font-medium text-slate-700 leading-tight">
                  Debit Card
                </span>
              </button>

              {/* 7. Account Statement */}
              <button
                onClick={handleOpenEmiCommitment}
                className="group flex flex-col items-center space-y-1.5 focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-[#e53935] hover:bg-[#d32f2f] text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                  <AccountStatementSymbol size={26} />
                </div>
                <span className="text-[11px] font-medium text-slate-700 leading-tight">
                  Account Statement
                </span>
              </button>

              {/* 8. OneTrack / Credit Health */}
              <button
                onClick={handleOpenFdCommitment}
                className="group flex flex-col items-center space-y-1.5 focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-[#e53935] hover:bg-[#d32f2f] text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                  <OneTrackSymbol size={26} />
                </div>
                <span className="text-[11px] font-medium text-slate-700 leading-tight">
                  OneTrack
                </span>
              </button>

            </div>

            {/* Manage Shortcuts Link */}
            <div className="text-center pt-5 pb-3">
              <button className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 transition-colors">
                <span>Manage Shortcuts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Credit Health Promo Banner (Matching Exact Screenshot) */}
          <div className="px-4 py-2">
            <div className="rounded-2xl bg-gradient-to-br from-[#1e1b4b] to-[#312e81] p-4 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
              <div className="space-y-1.5 z-10 max-w-[62%]">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/30 text-[10px] font-semibold text-indigo-200">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Verified Score</span>
                </div>
                <h4 className="text-sm font-bold leading-tight">
                  Know your credit health
                </h4>
                <p className="text-[11px] text-indigo-200 leading-snug">
                  Check your score today with CommitGuard on-device privacy
                </p>
                <button
                  onClick={handleOpenFdCommitment}
                  className="mt-1 px-3 py-1 rounded-lg bg-white text-slate-900 text-[11px] font-bold shadow hover:bg-indigo-50 transition-colors"
                >
                  View Details
                </button>
              </div>

              {/* Realistic Score Meter Badge */}
              <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-indigo-200 font-mono">OneTrack</span>
                <span className="text-2xl font-black text-white">782</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-semibold mt-0.5">
                  Excellent
                </span>
              </div>
            </div>
          </div>

          {/* Pre-Commitment Demo Triggers Callout */}
          <div className="px-4 pt-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-600">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Interactive Point-of-Sale Hook</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Click <strong>FD/RD</strong> or <strong>Money Transfer</strong> above to trigger the CommitGuard Decision Clarity drawer.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Navigation Bar (Matching Exact Screenshot) */}
        <div className="fixed sm:relative bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between z-20">
          
          <button
            onClick={() => setActiveTab('HOME')}
            className={`flex flex-col items-center space-y-0.5 flex-1 ${
              activeTab === 'HOME' ? 'text-slate-900 font-bold' : 'text-slate-500'
            }`}
          >
            <span className="text-lg">🏠</span>
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('PAY');
              handleOpenEmiCommitment();
            }}
            className={`flex flex-col items-center space-y-0.5 flex-1 ${
              activeTab === 'PAY' ? 'text-slate-900 font-bold' : 'text-slate-500'
            }`}
          >
            <span className="text-lg">💳</span>
            <span className="text-[10px]">Pay</span>
          </button>

          {/* Floating Center QR Scan Button */}
          <div className="flex flex-col items-center -mt-6 flex-1">
            <button
              onClick={handleOpenFdCommitment}
              aria-label="Scan QR"
              className="w-14 h-14 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center shadow-xl border-4 border-white hover:scale-105 transition-transform"
            >
              <QrScanSymbol size={26} />
            </button>
          </div>

          <button
            onClick={() => {
              setActiveTab('SERVICES');
              handleOpenFdCommitment();
            }}
            className={`flex flex-col items-center space-y-0.5 flex-1 ${
              activeTab === 'SERVICES' ? 'text-slate-900 font-bold' : 'text-slate-500'
            }`}
          >
            <span className="text-lg">🏛️</span>
            <span className="text-[10px]">Services</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('APPLY');
              handleOpenEmiCommitment();
            }}
            className={`flex flex-col items-center space-y-0.5 flex-1 ${
              activeTab === 'APPLY' ? 'text-slate-900 font-bold' : 'text-slate-500'
            }`}
          >
            <span className="text-lg">✍️</span>
            <span className="text-[10px]">Apply</span>
          </button>

        </div>

        {/* CommitGuard Decision Clarity Interceptor (Slides in over the action) */}
        {interceptorActive && activeScenarioPayload && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-[420px] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
              <CommitGuardWidget
                commitmentType={activeScenarioPayload.type}
                initialPayload={activeScenarioPayload}
                onProceed={() => setInterceptorActive(false)}
                onAbort={() => setInterceptorActive(false)}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
