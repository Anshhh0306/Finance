'use client';

import React, { useState } from 'react';
import { CommitGuardWidget } from '@/components/CommitGuardWidget';
import { NeutralDirectory } from '@/components/NeutralDirectory';
import { MobileBankingPage } from '@/components/MobileBankingPage';
import {
  ShieldCheck,
  ShoppingBag,
  Building2,
  TrendingUp,
  FolderLock,
  Smartphone,
  RotateCcw,
} from 'lucide-react';

type ActiveScenario = 'BANK_APP' | 'EMI' | 'FD' | 'DEBT_MF' | 'DIRECTORY';

export default function DemoStudioPage() {
  const [activeScenario, setActiveScenario] = useState<ActiveScenario>('BANK_APP');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [proceedTriggered, setProceedTriggered] = useState(false);

  // Scenario default payloads
  const emiPayload = {
    type: 'NO_COST_EMI',
    productName: 'Pro Laptop M-Series 16-inch',
    productPrice: 80000,
    tenureMonths: 12,
    advertisedRate: 0,
    bankProcessingFee: 199,
    bankNominalInterestRate: 15.0,
  };

  const fdPayload = {
    type: 'FD_LOCKIN',
    institutionName: 'HDFC Bank Term Deposit',
    principalAmount: 500000,
    contractedTenureMonths: 12,
    contractedRate: 7.10,
    prematurePenaltyRate: 1.00,
    completedMonthsBeforeExit: 6,
    applicableCompletedRate: 5.50,
    liquidFundRateBenchmark: 6.75,
    investorTaxSlabPercent: 30,
  };

  const debtMfPayload = {
    type: 'DEBT_MF',
    fundName: 'Ultra Short Duration Debt Fund',
    investmentAmount: 250000,
    horizonMonths: 18,
    expectedGrossYield: 7.20,
    equityAllocationPercent: 10,
    investorTaxSlabPercent: 30,
    expectedInflationPercent: 5.50,
  };

  const handleScenarioSwitch = (scenario: ActiveScenario) => {
    setActiveScenario(scenario);
    setIsModalOpen(true);
    setProceedTriggered(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      {/* Studio Header & Mode Switcher */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                CommitGuard Demo Studio
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-mono font-medium">
                  Track 3 • Problem 7
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Decision Clarity at the Point of Financial Commitment
              </p>
            </div>
          </div>
        </div>

        {/* 5-Scenario Clean Selector Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => handleScenarioSwitch('BANK_APP')}
            className={`p-3 rounded-xl border text-left transition-all space-y-0.5 ${
              activeScenario === 'BANK_APP'
                ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                : 'bg-white/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mobile Banking UI</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Reference Screen (White)
            </div>
          </button>

          <button
            onClick={() => handleScenarioSwitch('EMI')}
            className={`p-3 rounded-xl border text-left transition-all space-y-0.5 ${
              activeScenario === 'EMI'
                ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                : 'bg-white/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              <span>Scenario A: EMI</span>
            </div>
            <div className="text-[11px] text-slate-500">
              ₹80k Laptop (12m EMI)
            </div>
          </button>

          <button
            onClick={() => handleScenarioSwitch('FD')}
            className={`p-3 rounded-xl border text-left transition-all space-y-0.5 ${
              activeScenario === 'FD'
                ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                : 'bg-white/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Scenario B: FD</span>
            </div>
            <div className="text-[11px] text-slate-500">
              ₹5L 1-Yr FD Lock-In
            </div>
          </button>

          <button
            onClick={() => handleScenarioSwitch('DEBT_MF')}
            className={`p-3 rounded-xl border text-left transition-all space-y-0.5 ${
              activeScenario === 'DEBT_MF'
                ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                : 'bg-white/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
              <span>Scenario C: Debt MF</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Sec 50AA Slab Tax Drag
            </div>
          </button>

          <button
            onClick={() => handleScenarioSwitch('DIRECTORY')}
            className={`p-3 rounded-xl border text-left transition-all space-y-0.5 ${
              activeScenario === 'DIRECTORY'
                ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                : 'bg-white/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <FolderLock className="w-3.5 h-3.5 text-slate-600" />
              <span>Scenario D: Rates</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Neutral Directory
            </div>
          </button>
        </div>
      </div>

      {/* Main Interactive Display Area */}
      {activeScenario === 'BANK_APP' ? (
        <MobileBankingPage />
      ) : activeScenario === 'DIRECTORY' ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <NeutralDirectory />
        </div>
      ) : (
        <div className="space-y-6">
          {proceedTriggered ? (
            <div className="p-8 rounded-2xl glass-panel text-center space-y-3 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-accent-emerald/20 text-accent-emerald mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Transaction Completed with Decision Clarity
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                User understood the Effective APR, GST friction, and liquidity impacts before authorizing capital.
              </p>
              <button
                onClick={() => {
                  setProceedTriggered(false);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-colors"
              >
                Reset & Test Another Flow
              </button>
            </div>
          ) : isModalOpen ? (
            <CommitGuardWidget
              commitmentType={
                activeScenario === 'EMI'
                  ? 'NO_COST_EMI'
                  : activeScenario === 'FD'
                  ? 'FD_LOCKIN'
                  : 'DEBT_MF'
              }
              initialPayload={
                activeScenario === 'EMI'
                  ? emiPayload
                  : activeScenario === 'FD'
                  ? fdPayload
                  : debtMfPayload
              }
              onProceed={() => setProceedTriggered(true)}
              onAbort={() => setIsModalOpen(false)}
            />
          ) : (
            <div className="p-8 rounded-2xl glass-panel text-center space-y-3 max-w-xl mx-auto">
              <h3 className="text-base font-semibold text-slate-300">
                Interceptor Overlay Dismissed by User
              </h3>
              <p className="text-xs text-slate-500">
                User modified their terms or backed out of checkout.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
              >
                Re-open CommitGuard Interceptor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
