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
    <div className="rounded-3xl p-6 sm:p-8 space-y-5 text-slate-900 bg-white border border-slate-200 shadow-2xl max-w-xl mx-auto dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 transition-all">
      {/* Top Handle bar (Mobile Sheet Style) */}
      <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2" />

      {/* Clean Pill Header */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>CommitGuard • Decision Clarity</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
          <span>&lt;5ms Math Engine</span>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          True Cost Breakdown: {initialPayload.productName || initialPayload.institutionName || initialPayload.fundName || 'Transaction'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Pre-commitment verification for ₹{(initialPayload.productPrice || initialPayload.principalAmount || initialPayload.investmentAmount || 0).toLocaleString('en-IN')}
        </p>
      </div>

      {/* Pill Metric Badges (Directly Matching User Reference Image) */}
      <div className="flex flex-wrap gap-2 pt-1">
        {commitmentType === 'NO_COST_EMI' && emiResult && (
          <>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Effective APR: <strong className="ml-1.5 text-emerald-600 dark:text-emerald-400">{emiResult.effectiveAnnualPercentageRate}%</strong> (not 0%)
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Processing Fee: <strong className="ml-1.5 text-slate-900 dark:text-white">₹{initialPayload.bankProcessingFee || 199} + 18% GST</strong>
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Total GST Drag: <strong className="ml-1.5 text-rose-600 dark:text-rose-400">₹{emiResult.totalGstOnInterest.toLocaleString('en-IN')}</strong>
            </span>
          </>
        )}

        {commitmentType === 'FD_LOCKIN' && lockInResult && (
          <>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Contracted Rate: <strong className="ml-1.5 text-emerald-600 dark:text-emerald-400">{initialPayload.contractedRate}%</strong>
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Premature Penalty: <strong className="ml-1.5 text-rose-600 dark:text-rose-400">{initialPayload.prematurePenaltyRate}% Exit Drag</strong>
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Net Drag vs Liquid: <strong className="ml-1.5 text-amber-600 dark:text-amber-400">₹{lockInResult.netLossVsLiquid.toLocaleString('en-IN')}</strong>
            </span>
          </>
        )}

        {commitmentType === 'DEBT_MF' && (
          <>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Tax Regime: <strong className="ml-1.5 text-rose-600 dark:text-rose-400">Section 50AA (No Indexation)</strong>
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Marginal Slab: <strong className="ml-1.5 text-slate-900 dark:text-white">{initialPayload.investorTaxSlabPercent}% Bracket</strong>
            </span>
          </>
        )}
      </div>

      {/* Sandboxed Goal Volatility Conflict Banner */}
      <GoalVolatilityAlert evaluation={goalConflict} />

      {/* 3-Bullet Plain-English Risk Trade-off List (Directly Styled like Reference Image) */}
      <div className="pt-3 pb-3 border-t border-b border-slate-200 dark:border-slate-800">
        {isLoadingAi && !narrative ? (
          <div className="space-y-2.5 animate-pulse py-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
          </div>
        ) : (
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="text-slate-900 dark:text-white font-bold text-base leading-none">•</span>
              <span>
                <strong className="text-slate-900 dark:text-white font-bold">Friction: </strong>
                {narrative?.bullet_1_hidden_friction}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-slate-900 dark:text-white font-bold text-base leading-none">•</span>
              <span>
                <strong className="text-slate-900 dark:text-white font-bold">Liquidity: </strong>
                {narrative?.bullet_2_liquidity_horizon}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-slate-900 dark:text-white font-bold text-base leading-none">•</span>
              <span>
                <strong className="text-slate-900 dark:text-white font-bold">Baseline: </strong>
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
                  ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                  : alert.severity === 'WARNING'
                  ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
                  : 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
              }`}
            >
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <div className="font-semibold flex items-center gap-2">
                  <span>{alert.clauseTitle}</span>
                  <span className="text-[10px] font-mono opacity-75">({alert.statuteReference})</span>
                </div>
                <p className="text-[11px] opacity-90 leading-normal">{alert.detailedNotice}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mathematical Breakdown Drawer */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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

      {/* User Agency Action Controls (Matching User Reference: Outline Button + Solid Black Button) */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onAbort}
          className="w-full sm:w-1/2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          Change Terms
        </button>

        <button
          onClick={onProceed}
          className="w-full sm:w-1/2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          I Understand, Proceed
        </button>
      </div>
    </div>
  );
};
