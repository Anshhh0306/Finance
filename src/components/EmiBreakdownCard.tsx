'use client';

import React from 'react';
import { EmiTradeoffResult } from '@/lib/types';
import { IndianRupee, ShieldAlert, ArrowDownRight, Layers } from 'lucide-react';

interface EmiBreakdownCardProps {
  math: EmiTradeoffResult;
}

export const EmiBreakdownCard: React.FC<EmiBreakdownCardProps> = ({ math }) => {
  return (
    <div className="space-y-4">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-accent-amber" />
            Effective APR
          </div>
          <div className="text-2xl font-bold text-accent-amber tracking-tight">
            {math.effectiveAnnualPercentageRate}%
          </div>
          <div className="text-[11px] text-slate-500">
            vs 0% advertised
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-accent-rose" />
            Total Hidden Drag
          </div>
          <div className="text-2xl font-bold text-accent-rose tracking-tight">
            ₹{math.totalHiddenFriction.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Fees + 18% GST
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-500" />
            Monthly EMI
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ₹{math.monthlyBaseEmi.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            for {math.schedule.length} months
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <ArrowDownRight className="w-3.5 h-3.5 text-accent-cyan" />
            Merchant Offset
          </div>
          <div className="text-2xl font-bold text-accent-cyan tracking-tight">
            -₹{math.merchantDiscount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Subsidized interest
          </div>
        </div>
      </div>

      {/* Amortization Table Preview */}
      <div className="border border-white/5 rounded-xl overflow-hidden bg-surface-200/50">
        <div className="px-4 py-2.5 bg-surface-100/70 border-b border-white/5 flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Deterministic Cashflow Schedule (First 6 of {math.schedule.length} Months)</span>
          <span className="text-[11px] font-normal text-slate-400">18% GST Breakdown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-300/40 text-slate-400 border-b border-white/5 font-medium">
              <tr>
                <th className="px-3.5 py-2">Month</th>
                <th className="px-3.5 py-2">Balance</th>
                <th className="px-3.5 py-2">Principal</th>
                <th className="px-3.5 py-2">Interest</th>
                <th className="px-3.5 py-2 text-accent-amber">GST (18%)</th>
                <th className="px-3.5 py-2 text-right">Cash Outflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
              {math.schedule.slice(0, 6).map((item) => (
                <tr key={item.month} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-3.5 py-2 text-slate-400 font-sans">M{item.month}</td>
                  <td className="px-3.5 py-2">₹{item.openingBalance.toLocaleString('en-IN')}</td>
                  <td className="px-3.5 py-2">₹{item.principalComponent.toLocaleString('en-IN')}</td>
                  <td className="px-3.5 py-2 text-slate-400">₹{item.interestComponent.toLocaleString('en-IN')}</td>
                  <td className="px-3.5 py-2 text-accent-amber font-semibold">₹{item.gstOnInterest.toFixed(2)}</td>
                  <td className="px-3.5 py-2 text-right font-bold text-white">₹{item.totalMonthlyCashflow.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
