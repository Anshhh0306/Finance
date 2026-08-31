'use client';

import React, { useState, useEffect } from 'react';
import {
  CommitmentType,
  EmiCommitmentInput,
  LockInCommitmentInput,
  DebtMfCommitmentInput,
  NarratorSummary,
  PolicyAlert,
  GoalConflictEvaluation,
} from '@/lib/types';
import {
  calculateNoCostEmiDrag,
  calculateLockInVsLiquidity,
  calculatePostTaxRealYield,
  calculateOpportunityCost,
} from '@/lib/financial-engine';
import { evaluatePolicyAlerts } from '@/lib/policy-alerts';
import { getSandboxedGoals, evaluateGoalConflict } from '@/lib/storage';
import { generateDeterministicFallbackSummary } from '@/lib/llm-guardrail';
import { EmiBreakdownCard } from './EmiBreakdownCard';
import { LockInSimulator } from './LockInSimulator';
import { GoalVolatilityAlert } from './GoalVolatilityAlert';
import {
  ShieldAlert,
  Sparkles,
  Zap,
  FileCheck2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface CommitGuardWidgetProps {
  commitmentType: CommitmentType;
  initialPayload: any;
  onProceed: () => void;
  onAbort: () => void;
}

export const CommitGuardWidget: React.FC<CommitGuardWidgetProps> = ({
  commitmentType,
  initialPayload,
  onProceed,
  onAbort,
}) => {
  // Scenario state synchronized with initialPayload
  const [exitMonth, setExitMonth] = useState(initialPayload.completedMonthsBeforeExit || 6);

  // Computed results state
  const [emiResult, setEmiResult] = useState(() =>
    commitmentType === 'NO_COST_EMI' ? calculateNoCostEmiDrag(initialPayload) : null
  );
  const [lockInResult, setLockInResult] = useState(() =>
    commitmentType === 'FD_LOCKIN' ? calculateLockInVsLiquidity(initialPayload) : null
  );

  // Synchronize when initialPayload changes (tab switch)
  useEffect(() => {
    if (initialPayload.completedMonthsBeforeExit) {
      setExitMonth(initialPayload.completedMonthsBeforeExit);
    }
  }, [initialPayload]);

  // Policy & Goals
  const [policyAlerts, setPolicyAlerts] = useState<PolicyAlert[]>([]);
  const [goalConflict, setGoalConflict] = useState<GoalConflictEvaluation>({ hasConflict: false });

  // AI Narrator
  const [narrative, setNarrative] = useState<NarratorSummary | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Recalculate deterministic math instantly (<2ms)
  useEffect(() => {
    const goals = getSandboxedGoals();

    if (commitmentType === 'NO_COST_EMI') {
      const res = calculateNoCostEmiDrag(initialPayload);
      setEmiResult(res);

      const alerts = evaluatePolicyAlerts({
        commitmentType: 'NO_COST_EMI',
        tenureMonths: initialPayload.tenureMonths,
        processingFee: initialPayload.bankProcessingFee,
      });
      setPolicyAlerts(alerts);

      const conflict = evaluateGoalConflict(initialPayload.tenureMonths, initialPayload.productPrice, false, goals);
      setGoalConflict(conflict);

      fetchAiNarrative({
        commitmentType: 'NO_COST_EMI',
        productOrInstrumentName: initialPayload.productName,
        principalOrPrice: initialPayload.productPrice,
        tenureMonths: initialPayload.tenureMonths,
        computedMetrics: res,
        policyAlerts: alerts,
        goalConflict: conflict,
      });
    } else if (commitmentType === 'FD_LOCKIN') {
      const currentInput = { ...initialPayload, completedMonthsBeforeExit: exitMonth };
      const res = calculateLockInVsLiquidity(currentInput);
      setLockInResult(res);

      const alerts = evaluatePolicyAlerts({
        commitmentType: 'FD_LOCKIN',
        interestEarnedOrYield: res.fdPrematurePayout - initialPayload.principalAmount,
        advertisedRate: initialPayload.contractedRate,
        tenureMonths: initialPayload.contractedTenureMonths,
      });
      setPolicyAlerts(alerts);

      const conflict = evaluateGoalConflict(
        initialPayload.contractedTenureMonths,
        initialPayload.principalAmount,
        true,
        goals
      );
      setGoalConflict(conflict);

      fetchAiNarrative({
        commitmentType: 'FD_LOCKIN',
        productOrInstrumentName: initialPayload.institutionName,
        principalOrPrice: initialPayload.principalAmount,
        tenureMonths: initialPayload.contractedTenureMonths,
        computedMetrics: res,
        policyAlerts: alerts,
        goalConflict: conflict,
      });
    } else {
      // DEBT_MF
      const realYield = calculatePostTaxRealYield(
        initialPayload.expectedGrossYield,
        initialPayload.investorTaxSlabPercent,
        initialPayload.expectedInflationPercent
      );
      const opportunity = calculateOpportunityCost(
        initialPayload.expectedGrossYield,
        initialPayload.investmentAmount,
        initialPayload.horizonMonths
      );

      const alerts = evaluatePolicyAlerts({
        commitmentType: 'DEBT_MF',
        equityAllocationPercent: initialPayload.equityAllocationPercent,
        tenureMonths: initialPayload.horizonMonths,
      });
      setPolicyAlerts(alerts);

      const conflict = evaluateGoalConflict(
        initialPayload.horizonMonths,
        initialPayload.investmentAmount,
        false,
        goals
      );
      setGoalConflict(conflict);

      fetchAiNarrative({
        commitmentType: 'DEBT_MF',
        productOrInstrumentName: initialPayload.fundName,
        principalOrPrice: initialPayload.investmentAmount,
        tenureMonths: initialPayload.horizonMonths,
        computedMetrics: { ...realYield, ...opportunity },
        policyAlerts: alerts,
        goalConflict: conflict,
      });
    }
  }, [commitmentType, initialPayload, exitMonth]);

  const fetchAiNarrative = async (payload: any) => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setNarrative(data);
      } else {
        setNarrative(generateDeterministicFallbackSummary(payload));
      }
    } catch {
      setNarrative(generateDeterministicFallbackSummary(payload));
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="glass-panel-glow rounded-2xl p-5 sm:p-7 space-y-6 text-white max-w-3xl mx-auto border border-brand-500/30">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-500 border border-brand-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">CommitGuard Pre-Commitment Interceptor</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-accent-emerald border border-emerald-500/30 font-mono">
                &lt;5ms Math Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic Trade-Off Clarity before transaction authorization
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono bg-surface-100 px-3 py-1.5 rounded-lg border border-white/5">
          <Zap className="w-3.5 h-3.5 text-accent-amber" />
          <span>Point-of-Sale Hook Active</span>
        </div>
      </div>

      {/* Sandboxed Goal Volatility Conflict Banner */}
      <GoalVolatilityAlert evaluation={goalConflict} />

      {/* 3-Bullet Plain-English AI Trade-off Narrator */}
      <div className="p-4 sm:p-5 rounded-xl bg-surface-100/90 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-100">
            <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
            <span>3-Second Plain-English Decision Clarity</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {narrative?.status === 'GUARDRAIL_VERIFIED' ? '🛡️ Guardrail Verified' : '⚡ Deterministic Fallback'}
          </span>
        </div>

        {isLoadingAi && !narrative ? (
          <div className="space-y-2 animate-pulse py-2">
            <div className="h-4 bg-surface-300 rounded w-3/4"></div>
            <div className="h-4 bg-surface-300 rounded w-5/6"></div>
            <div className="h-4 bg-surface-300 rounded w-2/3"></div>
          </div>
        ) : (
          <ul className="space-y-2.5 text-xs text-slate-200 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amber mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Hidden Friction: </strong>
                {narrative?.bullet_1_hidden_friction}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Liquidity Horizon: </strong>
                {narrative?.bullet_2_liquidity_horizon}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Neutral Baseline: </strong>
                {narrative?.bullet_3_neutral_baseline}
              </span>
            </li>
          </ul>
        )}
      </div>

      {/* Contextual Macro Policy Badges */}
      {policyAlerts.length > 0 && (
        <div className="space-y-2">
          {policyAlerts.map((alert) => (
            <div
              key={alert.policyId}
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                alert.severity === 'CRITICAL'
                  ? 'bg-accent-rose/10 border-accent-rose/30 text-rose-200'
                  : alert.severity === 'WARNING'
                  ? 'bg-accent-amber/10 border-accent-amber/30 text-amber-200'
                  : 'bg-surface-100 border-white/10 text-slate-300'
              }`}
            >
              {alert.severity === 'CRITICAL' ? (
                <AlertTriangle className="w-4 h-4 text-accent-rose shrink-0 mt-0.5" />
              ) : alert.severity === 'WARNING' ? (
                <AlertTriangle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-semibold flex items-center gap-2">
                  <span>{alert.clauseTitle}</span>
                  <span className="text-[10px] font-mono opacity-70">({alert.statuteReference})</span>
                </div>
                <p className="text-[11px] opacity-90 leading-normal">{alert.detailedNotice}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mathematical Breakdown Drawer */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <FileCheck2 className="w-4 h-4 text-accent-cyan" />
          <span>Verifiable Mathematical Proof</span>
        </div>

        {commitmentType === 'NO_COST_EMI' && emiResult && (
          <EmiBreakdownCard math={emiResult} />
        )}

        {commitmentType === 'FD_LOCKIN' && lockInResult && (
          <LockInSimulator
            math={lockInResult}
            currentExitMonth={exitMonth}
            onExitMonthChange={setExitMonth}
          />
        )}
      </div>

      {/* User Agency Action Controls */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onAbort}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4 text-slate-400" />
          Modify Terms / Exit Interceptor
        </button>

        <button
          onClick={onProceed}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-accent-emerald" />
          I Understand the Trade-Offs, Proceed
        </button>
      </div>
    </div>
  );
};
