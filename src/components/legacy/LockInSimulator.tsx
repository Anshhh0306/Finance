'use client';

import React from 'react';
import { LockInTradeoffResult } from '@/lib/types';
import { AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';

interface LockInSimulatorProps {
  math: LockInTradeoffResult;
  currentExitMonth: number;
  onExitMonthChange: (month: number) => void;
}

export const LockInSimulator: React.FC<LockInSimulatorProps> = ({
  math,
  currentExitMonth,
  onExitMonthChange,
}) => {
  return (
    <div className="space-y-4 spring-in">
      {/* Interactive Exit Month Slider */}
      <div className="p-4 rounded-xl bg-surface-100 border border-white/5 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">
            Simulate Premature Liquidation Month:
          </span>
          <span className="font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-100 border border-brand-500/30 font-bold spring-in">
            Month {currentExitMonth} of {math.contractedTenureMonths}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={math.contractedTenureMonths - 1}
          value={currentExitMonth}
          onChange={(e) => onExitMonthChange(Number(e.target.value))}
          className="w-full h-2 bg-surface-300 rounded-lg appearance-none cursor-pointer accent-brand-500 transition-all hover:brightness-110"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Month 1 (Emergency)</span>
          <span>Month 6 (Mid-Tenure)</span>
          <span>Month {math.contractedTenureMonths - 1} (Late Break)</span>
        </div>
      </div>

      {/* Side-by-side Payout Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Broken FD Column */}
        <div className="p-4 rounded-xl bg-surface-100 border border-accent-rose/20 space-y-2 spring-in hover:border-accent-rose/40 transition-colors shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-accent-rose" />
              Premature Broken FD
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-rose/10 text-accent-rose font-mono font-medium">
              {math.penalizedRate}% Yield
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-mono spring-in">
            ₹{math.fdPrematurePayout.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400">
            Includes <span className="text-accent-rose font-semibold">1.00% penal deduction</span> + bracket downgrade.
          </div>
        </div>

        {/* Liquid Fund Alternative Column */}
        <div className="p-4 rounded-xl bg-surface-100 border border-accent-emerald/20 space-y-2 spring-in hover:border-accent-emerald/40 transition-colors shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" />
              Zero-Penalty Liquid Fund
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-emerald/10 text-accent-emerald font-mono font-medium">
              6.75% Benchmark
            </span>
          </div>
          <div className="text-2xl font-bold text-accent-emerald font-mono spring-in">
            ₹{math.liquidFundPayout.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400">
            Zero exit penalties. Complete liquidity anytime.
          </div>
        </div>
      </div>

      {/* Liquidity Trap Callout */}
      {math.isLiquidityTrap && (
        <div className="p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 flex items-start gap-2.5 text-xs text-rose-200 spring-in animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-accent-rose shrink-0 mt-0.5" />
          <div>
            <strong>Liquidity Trap Confirmed:</strong> Breaking at month {currentExitMonth} costs you{' '}
            <span className="font-mono font-bold text-white">
              ₹{math.netLossVsLiquid.toLocaleString('en-IN')}
            </span>{' '}
            compared to staying in a zero-penalty liquid fund, with zero flexibility benefit.
          </div>
        </div>
      )}
    </div>
  );
};

