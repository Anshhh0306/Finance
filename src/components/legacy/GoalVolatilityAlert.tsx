'use client';

import React from 'react';
import { GoalConflictEvaluation } from '@/lib/types';
import { ShieldAlert, CalendarClock } from 'lucide-react';

interface GoalVolatilityAlertProps {
  evaluation: GoalConflictEvaluation;
}

export const GoalVolatilityAlert: React.FC<GoalVolatilityAlertProps> = ({ evaluation }) => {
  if (!evaluation.hasConflict || !evaluation.conflictingGoal) {
    return null;
  }

  const { conflictingGoal, warningMessage } = evaluation;

  return (
    <div className="p-4 rounded-xl bg-accent-amber/10 border border-accent-amber/30 space-y-2 text-xs">
      <div className="flex items-center gap-2 text-accent-amber font-semibold">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>Sandboxed Goal Volatility Conflict Detected</span>
      </div>

      <p className="text-slate-300 leading-relaxed">
        {warningMessage}
      </p>

      <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <CalendarClock className="w-3.5 h-3.5 text-accent-amber" />
          Target: {conflictingGoal.title} ({conflictingGoal.targetHorizonMonths} months)
        </span>
        <span>
          Earmarked: ₹{conflictingGoal.earmarkedCapital.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
};
