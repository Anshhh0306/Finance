/**
 * CommitGuard - Sandboxed Local Storage & Goal Volatility Engine
 * 100% on-device sandboxed privacy. Zero remote telemetry.
 * Stores user financial milestones in client-side storage and detects timeline clashes.
 */

import { SandboxedGoal, GoalConflictEvaluation } from './types';

const STORAGE_KEY = 'commitguard_sandboxed_goals_v1';

// Default initial goals representing realistic short-to-medium-term retail milestones
const DEFAULT_GOALS: SandboxedGoal[] = [
  {
    id: 'goal_car_downpayment',
    title: 'Vehicle Down Payment',
    targetAmount: 300000,
    targetHorizonMonths: 6,
    earmarkedCapital: 250000,
    riskProfile: 'ZERO_CAPITAL_RISK',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'goal_emergency_cushion',
    title: 'Emergency Liquidity Cushion',
    targetAmount: 150000,
    targetHorizonMonths: 3,
    earmarkedCapital: 150000,
    riskProfile: 'ZERO_CAPITAL_RISK',
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Retrieve goals from client-side storage
 */
export function getSandboxedGoals(): SandboxedGoal[] {
  if (typeof window === 'undefined') {
    return DEFAULT_GOALS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GOALS));
      return DEFAULT_GOALS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GOALS;
  }
}

/**
 * Save goals to client-side storage
 */
export function saveSandboxedGoals(goals: SandboxedGoal[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch (err) {
    console.error('Failed to write sandboxed goals to localStorage', err);
  }
}

/**
 * Evaluate if a commitment conflicts with any active sandboxed goal
 */
export function evaluateGoalConflict(
  commitmentTenureMonths: number,
  commitmentAmount: number,
  isIlliquidOrLocked: boolean,
  goals: SandboxedGoal[]
): GoalConflictEvaluation {
  for (const goal of goals) {
    // Conflict 1: Capital amount overlaps significantly with goal earmarked capital
    const isCapitalImpacted = commitmentAmount >= goal.earmarkedCapital * 0.3;

    // Conflict 2: Commitment locks money past the goal's deadline
    const isHorizonClash = commitmentTenureMonths > goal.targetHorizonMonths;

    if (isCapitalImpacted && isHorizonClash && isIlliquidOrLocked) {
      return {
        hasConflict: true,
        conflictingGoal: goal,
        warningMessage: `Capital Conflict: Locking ₹${commitmentAmount.toLocaleString('en-IN')} for ${commitmentTenureMonths} months clashes with your active "${goal.title}" goal due in ${goal.targetHorizonMonths} months. Breaking early will incur penal rate deductions.`,
      };
    }
  }

  return {
    hasConflict: false,
  };
}
