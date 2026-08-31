/**
 * CommitGuard - Contextual Macro & Regulatory Policy Engine
 * Evaluates Indian financial regulations, Union Budget updates, and RBI monetary policy frameworks.
 * Matching specifications from docs/PRD.md & docs/PROJECT_ANALYSIS.md
 */

import { PolicyAlert } from './types';

/**
 * Evaluates active regulatory statutes based on commitment context.
 */
export function evaluatePolicyAlerts(params: {
  commitmentType: 'NO_COST_EMI' | 'FD_LOCKIN' | 'DEBT_MF';
  interestEarnedOrYield?: number;
  equityAllocationPercent?: number;
  tenureMonths?: number;
  advertisedRate?: number;
  processingFee?: number;
}): PolicyAlert[] {
  const alerts: PolicyAlert[] = [];

  // Policy PR-1: Section 50AA - Specified Debt Mutual Funds Taxation
  if (params.commitmentType === 'DEBT_MF') {
    if (params.equityAllocationPercent !== undefined && params.equityAllocationPercent <= 35) {
      alerts.push({
        policyId: 'PR-1',
        clauseTitle: 'Section 50AA: Indexation Benefit Withdrawn',
        statuteReference: 'Income Tax Act §50AA (Finance Act 2023 / 2024)',
        severity: 'CRITICAL',
        headline: 'Capital gains taxed at marginal income slab (up to 39%)',
        detailedNotice:
          'Because equity exposure is below 35%, capital gains no longer qualify for 20% indexation. Gains will be added directly to your taxable income and taxed at your top slab bracket.',
      });
    }
  }

  // Policy PR-2: Section 111A / 112 - Capital Gains Tax Realignment
  if (params.tenureMonths && params.tenureMonths < 12 && params.commitmentType === 'DEBT_MF') {
    alerts.push({
      policyId: 'PR-2',
      clauseTitle: 'Section 111A: Short-Term Gains Policy',
      statuteReference: 'Union Budget 2024 Tax Realignment',
      severity: 'WARNING',
      headline: 'Short-term commitments bear heightened immediate tax friction',
      detailedNotice:
        'Liquidating market-linked instruments in under 12 months subjects gains to immediate short-term tax friction before compounding can offset fee drag.',
    });
  }

  // Policy PR-3: Section 194A - Bank TDS Deduction on Fixed Deposits
  if (params.commitmentType === 'FD_LOCKIN' && params.interestEarnedOrYield) {
    if (params.interestEarnedOrYield > 40000) {
      alerts.push({
        policyId: 'PR-3',
        clauseTitle: 'Section 194A: Statutory TDS at Source',
        statuteReference: 'Income Tax Act §194A',
        severity: 'WARNING',
        headline: '10% TDS automatically deducted on interest > ₹40,000',
        detailedNotice:
          'Cumulative annual interest exceeds ₹40,000 (₹50,000 for senior citizens). The bank will deduct 10% TDS at source (20% if PAN is not linked) before crediting payouts.',
      });
    }
  }

  // Policy PR-4: RBI Repo Rate & Sovereign Spread Benchmark
  const RBI_REPO_RATE = 6.50;
  if (params.advertisedRate !== undefined && params.advertisedRate < RBI_REPO_RATE && params.commitmentType === 'FD_LOCKIN') {
    alerts.push({
      policyId: 'PR-4',
      clauseTitle: 'RBI Repo Spread Underperformance',
      statuteReference: 'RBI Monetary Policy Benchmark (Repo 6.50%)',
      severity: 'INFO',
      headline: 'Nominal yield is currently below the sovereign monetary policy rate',
      detailedNotice:
        `The advertised deposit yield (${params.advertisedRate}%) is lower than the risk-free RBI repo rate of ${RBI_REPO_RATE}%. Sovereign 91-Day Treasury Bills offer ~6.85% with zero lock-in penalty.`,
    });
  }

  // E-Commerce Policy: Non-refundable fee and 18% GST alert
  if (params.commitmentType === 'NO_COST_EMI') {
    alerts.push({
      policyId: 'PR-EMI-GST',
      clauseTitle: 'Statutory 18% GST on Financial Services',
      statuteReference: 'Central Goods and Services Tax Act 2017',
      severity: 'WARNING',
      headline: '18% GST applies to both upfront loan fees and monthly interest',
      detailedNotice:
        'Even when merchant discounts offset the base interest, Indian tax law mandates 18% GST billed on the bank’s internal interest portion each month plus the upfront processing fee.',
    });
  }

  return alerts;
}
