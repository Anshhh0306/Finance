import { NextRequest, NextResponse } from 'next/server';
import {
  calculateNoCostEmiDrag,
  calculateLockInVsLiquidity,
  calculatePostTaxRealYield,
  calculateOpportunityCost,
} from '@/lib/financial-engine';
import { evaluatePolicyAlerts } from '@/lib/policy-alerts';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type === 'NO_COST_EMI') {
      const math = calculateNoCostEmiDrag(body);
      const alerts = evaluatePolicyAlerts({
        commitmentType: 'NO_COST_EMI',
        tenureMonths: body.tenureMonths,
        processingFee: body.bankProcessingFee,
      });
      return NextResponse.json({ math, alerts });
    }

    if (type === 'FD_LOCKIN') {
      const math = calculateLockInVsLiquidity(body);
      const alerts = evaluatePolicyAlerts({
        commitmentType: 'FD_LOCKIN',
        interestEarnedOrYield: math.fdPrematurePayout - body.principalAmount,
        advertisedRate: body.contractedRate,
        tenureMonths: body.contractedTenureMonths,
      });
      return NextResponse.json({ math, alerts });
    }

    if (type === 'DEBT_MF') {
      const realYield = calculatePostTaxRealYield(
        body.expectedGrossYield,
        body.investorTaxSlabPercent,
        body.expectedInflationPercent
      );
      const opportunity = calculateOpportunityCost(
        body.expectedGrossYield,
        body.investmentAmount,
        body.horizonMonths
      );
      const alerts = evaluatePolicyAlerts({
        commitmentType: 'DEBT_MF',
        equityAllocationPercent: body.equityAllocationPercent,
        tenureMonths: body.horizonMonths,
      });
      return NextResponse.json({ math: { realYield, opportunity }, alerts });
    }

    return NextResponse.json({ error: 'Unknown commitment type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Calculation failed' }, { status: 500 });
  }
}
