'use client';

import React, { useState } from 'react';
import { CommitGuardWidget } from '@/components/CommitGuardWidget';
import { NeutralDirectory } from '@/components/NeutralDirectory';
import {
  ShieldCheck,
  ShoppingBag,
  Building2,
  TrendingUp,
  FolderLock,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

type ActiveScenario = 'EMI' | 'FD' | 'DEBT_MF' | 'DIRECTORY';

export default function DemoStudioPage() {
  const [activeScenario, setActiveScenario] = useState<ActiveScenario>('EMI');
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
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Studio Header & Hackathon Framing */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-500 border border-brand-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                CommitGuard Demo Studio
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-100 border border-brand-500/30 font-mono font-semibold">
                  Track 3 • Problem 7
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Interactive Pre-Commitment Interceptor & POS Simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setProceedTriggered(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-Trigger Interceptor
            </button>
          </div>
        </div>

        {/* 4-Scenario Selector Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleScenarioSwitch('EMI')}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1 ${
              activeScenario === 'EMI'
                ? 'bg-surface-100 border-brand-500 shadow-glow'
                : 'bg-surface-200/60 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-accent-amber" />
                Scenario A: E-Commerce
              </span>
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-1">
              ₹80k Laptop (12m No-Cost EMI)
            </div>
          </button>

          <button
            onClick={() => handleScenarioSwitch('FD')}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1 ${
              activeScenario === 'FD'
                ? 'bg-surface-100 border-brand-500 shadow-glow'
                : 'bg-surface-200/60 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-500" />
                Scenario B: Banking FD
              </span>
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-1">
              ₹5L 1-Yr FD vs 6m Car Downpayment
            </div>
          </button>

          <button
            onClick={() => handleScenarioSwitch('DEBT_MF')}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1 ${
              activeScenario === 'DEBT_MF'
                ? 'bg-surface-100 border-brand-500 shadow-glow'
                : 'bg-surface-200/60 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-accent-rose" />
                Scenario C: Debt MF
              </span>
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-1">
              Sec 50AA Indexation Withdrawal
            </div>
          </button>

          <button
            onClick={() => handleScenarioSwitch('DIRECTORY')}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1 ${
              activeScenario === 'DIRECTORY'
                ? 'bg-surface-100 border-brand-500 shadow-glow'
                : 'bg-surface-200/60 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <FolderLock className="w-3.5 h-3.5 text-accent-emerald" />
                Scenario D: Rates
              </span>
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-1">
              Unranked Neutral Directory
            </div>
          </button>
        </div>
      </div>

      {/* Main Interactive Display Area */}
      {activeScenario === 'DIRECTORY' ? (
        <div className="glass-panel p-6 rounded-2xl">
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
