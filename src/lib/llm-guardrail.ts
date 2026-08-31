/**
 * CommitGuard - AI Translator Guardrail & Anti-Advisory Engine
 * Role: Factual Trade-Off Narrator ONLY. Zero financial advice. Zero subjective opinions.
 * Enforces strict 3-bullet schema and instant deterministic fallback on network timeout.
 */

import { NarratorSummary, ExplainRequestPayload } from './types';

// Prohibited tokens that constitute subjective investment advice under SEBI safe-harbor guidelines
const PROHIBITED_ADVISORY_PATTERNS = [
  /\brecommend\b/i,
  /\byou should\b/i,
  /\bbest bank\b/i,
  /\btop pick\b/i,
  /\bbad deal\b/i,
  /\bgood deal\b/i,
  /\bbuy now\b/i,
  /\bdon't buy\b/i,
  /\binvest in\b/i,
  /\bavoid this\b/i,
  /\bopt for\b/i,
  /\byou must\b/i,
];

/**
 * System prompt strictly confining the LLM to an objective translator role
 */
export const COMMITGUARD_NARRATOR_SYSTEM_PROMPT = `
You are CommitGuard's Deterministic Financial Narrator.
Your sole purpose is to translate deterministic computed numbers into exactly 3 factual, neutral plain-English trade-off bullet points.

CRITICAL CONSTRAINTS:
1. You are NOT a financial advisor. You must NEVER give subjective recommendations (never say "we recommend", "you should", "avoid this", "top pick", "best bank", "good/bad deal").
2. You must NEVER invent, calculate, or hallucinate numbers. Use ONLY the exact numbers provided in the input JSON payload.
3. Return STRICTLY a valid JSON object matching this schema with NO markdown formatting, no commentary:
{
  "bullet_1_hidden_friction": "<1 sentence explaining processing fees, GST, or early break penalties in rupees and APR>",
  "bullet_2_liquidity_horizon": "<1 sentence explaining monthly cashflow drain or lock-in timeline clash>",
  "bullet_3_neutral_baseline": "<1 sentence contrasting mathematically against sovereign baselines or upfront payment>"
}
`;

/**
 * Validates generated text against prohibited advisory words
 */
export function validateAntiAdvisoryGuardrail(text: string): boolean {
  for (const pattern of PROHIBITED_ADVISORY_PATTERNS) {
    if (pattern.test(text)) {
      return false; // Violates safe harbor
    }
  }
  return true;
}

/**
 * Deterministic Instant Fallback Generator (<1ms latency)
 * Used when offline, API key not provided, or network latency exceeds 1800ms.
 */
export function generateDeterministicFallbackSummary(payload: ExplainRequestPayload): NarratorSummary {
  const start = performance.now();
  const { commitmentType, principalOrPrice, tenureMonths, computedMetrics } = payload;

  let b1 = '';
  let b2 = '';
  let b3 = '';

  if (commitmentType === 'NO_COST_EMI') {
    const apr = computedMetrics.effectiveAnnualPercentageRate || 15.2;
    const fee = computedMetrics.upfrontProcessingFee || 199;
    const gstTotal = computedMetrics.totalGstOnInterest || 1438;
    const monthlyEmi = computedMetrics.monthlyBaseEmi || Math.round(principalOrPrice / tenureMonths);
    const hiddenTotal = computedMetrics.totalHiddenFriction || Math.round(fee * 1.18 + gstTotal);

    b1 = `While advertised at 0% interest, an upfront fee of ₹${fee} plus 18% monthly GST on interest charges creates an Effective APR of ${apr}%.`;
    b2 = `Selecting this ${tenureMonths}-month installment locks ₹${monthlyEmi.toLocaleString('en-IN')}/month in committed outflows from your regular liquid cashflow.`;
    b3 = `Mathematically, settling upfront or choosing a shorter tenure eliminates ₹${hiddenTotal.toLocaleString('en-IN')} in combined statutory fee and tax friction.`;
  } else if (commitmentType === 'FD_LOCKIN') {
    const penaltyRate = computedMetrics.penalizedRate !== undefined ? computedMetrics.penalizedRate : 4.5;
    const prematureMonth = computedMetrics.prematureExitMonth || 6;
    const lossVsLiquid = computedMetrics.netLossVsLiquid || 2850;

    b1 = `Breaking this term deposit at month ${prematureMonth} recalculates your interest to ${penaltyRate}% after the 1.00% premature penal fee.`;
    b2 = `Committing ₹${principalOrPrice.toLocaleString('en-IN')} for ${tenureMonths} months leaves capital illiquid; an early exit results in ₹${lossVsLiquid.toLocaleString('en-IN')} lower return than a zero-penalty liquid fund.`;
    b3 = `Sovereign 91-Day Treasury Bills (6.85%) and overnight liquid funds offer complete liquidity preservation without pre-closure penalty penalties.`;
  } else {
    // DEBT_MF
    const realYield = computedMetrics.postTaxRealYield || 1.25;
    const slab = computedMetrics.marginalTaxSlab || 30;

    b1 = `Under Section 50AA, gains are classified as short-term income and taxed at your ${slab}% marginal slab bracket without indexation benefits.`;
    b2 = `Holding for ${tenureMonths} months under projected 5.5% inflation reduces your post-tax real purchasing power yield to ${realYield}%.`;
    b3 = `Sovereign Gold Bonds or equity-diversified allocations offer alternative statutory tax schedules depending on your holding horizon.`;
  }

  const duration = Math.round(performance.now() - start);

  return {
    bullet_1_hidden_friction: b1,
    bullet_2_liquidity_horizon: b2,
    bullet_3_neutral_baseline: b3,
    status: 'DETERMINISTIC_FALLBACK',
    executionTimeMs: duration,
  };
}
