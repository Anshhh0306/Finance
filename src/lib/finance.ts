/**
 * Deterministic money math behind CommitGuard. Pure functions, no I/O, rounded to paise.
 *
 * Indian "No-Cost EMI" works like this: the bank still charges interest, and the merchant gives an
 * upfront discount equal to that interest, so the instalments add up to the sticker price. What
 * the buyer still pays on top is a processing fee and 18% GST on the fee and on every month's
 * interest. That leftover cost, expressed as an IRR, is the "effective APR" of a "0%" loan.
 */

export const GST_RATE = 0.18;
/** Typical bank EMI processing fee in rupees, before GST. */
export const DEFAULT_PROCESSING_FEE = 199;
/** Lender rate (% a year) assumed when a checkout page does not show one. */
export const ASSUMED_LENDER_RATE = 15;
/** Return (% a year) of a near risk-free alternative: a sovereign T-bill or liquid fund. */
export const SAFE_RETURN_RATE = 7.1;

const round2 = (x: number) => Number(x.toFixed(2));

export interface EmiScheduleRow {
  month: number;
  openingBalance: number;
  principal: number;
  interest: number;
  gstOnInterest: number;
  payment: number;
  closingBalance: number;
}

export interface NoCostEmiInput {
  price: number;
  tenureMonths: number;
  /** The bank's interest rate (% a year) that the merchant discount offsets. */
  annualRate?: number;
  processingFee?: number;
}

export interface NoCostEmiResult {
  price: number;
  processingFee: number;
  gstOnFee: number;
  /** Fee + GST on the fee, paid on day one. */
  upfrontCost: number;
  /** Upfront discount the merchant gives so the instalments sum to the sticker price. */
  merchantDiscount: number;
  /** What the bank actually lends after the merchant discount. */
  borrowedPrincipal: number;
  monthlyEmi: number;
  totalInterest: number;
  gstOnInterest: number;
  /** Everything paid above the sticker price: fee, GST on fee, GST on interest. */
  hiddenCost: number;
  trueCost: number;
  /** Annualised IRR of the real cash flows, in percent. */
  effectiveApr: number;
  schedule: EmiScheduleRow[];
}

export function calculateNoCostEmi({
  price,
  tenureMonths,
  annualRate = ASSUMED_LENDER_RATE,
  processingFee = DEFAULT_PROCESSING_FEE,
}: NoCostEmiInput): NoCostEmiResult {
  const r = annualRate / 100 / 12;
  const gstOnFee = round2(processingFee * GST_RATE);
  const upfrontCost = round2(processingFee + gstOnFee);

  // Instalments sum to the sticker price; the bank lends their present value.
  const monthlyEmi = round2(price / tenureMonths);
  const factor = (1 + r) ** tenureMonths;
  const borrowedPrincipal = r === 0 ? price : round2((monthlyEmi * (factor - 1)) / (r * factor));
  const merchantDiscount = round2(price - borrowedPrincipal);

  const schedule: EmiScheduleRow[] = [];
  let balance = borrowedPrincipal;
  let totalInterest = 0;
  let gstOnInterest = 0;
  for (let month = 1; month <= tenureMonths; month++) {
    const openingBalance = round2(balance);
    const interest = round2(openingBalance * r);
    const principal = round2(monthlyEmi - interest);
    const gst = round2(interest * GST_RATE);
    balance = Math.max(0, openingBalance - principal);
    totalInterest += interest;
    gstOnInterest += gst;
    schedule.push({
      month,
      openingBalance,
      principal,
      interest,
      gstOnInterest: gst,
      payment: round2(monthlyEmi + gst),
      closingBalance: round2(balance),
    });
  }
  totalInterest = round2(totalInterest);
  gstOnInterest = round2(gstOnInterest);

  // The buyer effectively receives the loan minus the upfront fee, then repays EMI + GST monthly.
  const cashflows = [-(borrowedPrincipal - upfrontCost), ...schedule.map((row) => row.payment)];
  const monthlyIrr = solveIrr(cashflows, r || 0.01);

  return {
    price,
    processingFee,
    gstOnFee,
    upfrontCost,
    merchantDiscount,
    borrowedPrincipal,
    monthlyEmi,
    totalInterest,
    gstOnInterest,
    hiddenCost: round2(upfrontCost + gstOnInterest),
    trueCost: round2(price + upfrontCost + gstOnInterest),
    effectiveApr: round2(((1 + monthlyIrr) ** 12 - 1) * 100),
    schedule,
  };
}

/** Newton-Raphson on NPV(r) = 0. Cash flow t is discounted by (1 + r)^t. */
function solveIrr(cashflows: number[], guess: number): number {
  let r = guess;
  for (let i = 0; i < 100; i++) {
    let npv = 0;
    let slope = 0;
    for (let t = 0; t < cashflows.length; t++) {
      npv += cashflows[t] / (1 + r) ** t;
      if (t > 0) slope -= (t * cashflows[t]) / (1 + r) ** (t + 1);
    }
    if (Math.abs(npv) < 1e-7 || slope === 0) break;
    const next = r - npv / slope;
    if (Math.abs(next - r) < 1e-7) return next;
    r = next;
  }
  return r;
}

export interface EmiCharges {
  gstOnInterest: number;
  /** Processing fee + its GST. */
  upfrontCost: number;
  hiddenCost: number;
  trueCost: number;
}

/**
 * For an EMI whose interest the lender already states (e.g. "₹14,340 total payable, incl. ₹1,279
 * interest"): GST on that interest and the processing fee still come on top.
 */
export function addEmiCharges(totalPayable: number, interest: number, processingFee = DEFAULT_PROCESSING_FEE): EmiCharges {
  const gstOnInterest = round2(interest * GST_RATE);
  const upfrontCost = round2(processingFee * (1 + GST_RATE));
  const hiddenCost = round2(gstOnInterest + upfrontCost);
  return { gstOnInterest, upfrontCost, hiddenCost, trueCost: round2(totalPayable + hiddenCost) };
}

export interface InterestEmiInput {
  price: number;
  tenureMonths: number;
  annualRate: number;
  processingFee?: number;
}

export interface InterestEmiResult extends EmiCharges {
  monthlyEmi: number;
  totalInterest: number;
}

/** A regular reducing-balance EMI at a stated rate, with GST and the processing fee added. */
export function calculateInterestEmi({
  price,
  tenureMonths,
  annualRate,
  processingFee = DEFAULT_PROCESSING_FEE,
}: InterestEmiInput): InterestEmiResult {
  const r = annualRate / 100 / 12;
  const emi = r === 0 ? price / tenureMonths : (price * r * (1 + r) ** tenureMonths) / ((1 + r) ** tenureMonths - 1);
  const totalInterest = round2(emi * tenureMonths - price);
  return { monthlyEmi: round2(emi), totalInterest, ...addEmiCharges(price + totalInterest, totalInterest, processingFee) };
}

export interface MixedCartRisk {
  isMultiItem: boolean;
  meetsMinimum: boolean;
  minimum: number;
  interestAtRisk: number;
  gstAtRisk: number;
  totalAtRisk: number;
}

const EMI_CART_MINIMUM = 3000;

/**
 * No-Cost EMI usually needs a ₹3,000 cart, and one ineligible item in a mixed cart can turn the
 * whole order into a regular interest-bearing EMI. This estimates what that would cost.
 */
export function evaluateMixedCartRisk(
  cartValue: number,
  itemCount: number,
  tenureMonths = 6,
  annualRate = ASSUMED_LENDER_RATE,
): MixedCartRisk {
  const isMultiItem = itemCount > 1;
  const interestAtRisk = isMultiItem ? round2(cartValue * (annualRate / 100) * (tenureMonths / 12)) : 0;
  const gstAtRisk = round2(interestAtRisk * GST_RATE);
  return {
    isMultiItem,
    meetsMinimum: cartValue >= EMI_CART_MINIMUM,
    minimum: EMI_CART_MINIMUM,
    interestAtRisk,
    gstAtRisk,
    totalAtRisk: round2(interestAtRisk + gstAtRisk),
  };
}

export type UtilizationTier = 'SAFE' | 'CAUTION' | 'DANGER';

export interface CreditUtilization {
  blockedAmount: number;
  utilizationPercent: number;
  tier: UtilizationTier;
  /** Rough CIBIL score impact, in points. */
  scoreDropEstimate: string;
}

/**
 * An EMI blocks the full order amount on the card limit on day one, not one instalment.
 * Utilization (blocked / limit) is one of the biggest inputs to a CIBIL score.
 */
export function calculateCreditUtilization({
  orderAmount,
  existingBalance,
  creditLimit,
}: {
  orderAmount: number;
  existingBalance: number;
  creditLimit: number;
}): CreditUtilization {
  const blockedAmount = round2(Math.max(0, orderAmount) + Math.max(0, existingBalance));
  const utilizationPercent = creditLimit > 0 ? round2((blockedAmount / creditLimit) * 100) : 0;
  if (utilizationPercent < 30) return { blockedAmount, utilizationPercent, tier: 'SAFE', scoreDropEstimate: '0' };
  if (utilizationPercent <= 50) return { blockedAmount, utilizationPercent, tier: 'CAUTION', scoreDropEstimate: '5-15' };
  return { blockedAmount, utilizationPercent, tier: 'DANGER', scoreDropEstimate: '20-40' };
}

export interface CardReward {
  /** Reward earned when paying in full; converting to EMI forfeits all of it. */
  reward: number;
  costIfPaidInFull: number;
}

export function calculateCardReward(amount: number, ratePercent: number): CardReward {
  const reward = round2(Math.max(0, amount) * (Math.max(0, ratePercent) / 100));
  return { reward, costIfPaidInFull: round2(amount - reward) };
}

/** Value of a lump sum after `years`, compounding yearly. */
export function futureValue(amount: number, annualRate: number, years: number): number {
  return round2(amount * (1 + annualRate / 100) ** years);
}

/** Value of saving `monthly` at the start of each month for `months`, compounding monthly. */
export function savingsPlanValue(monthly: number, annualRate: number, months: number): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return round2(monthly * months);
  return round2(monthly * (((1 + r) ** months - 1) / r) * (1 + r));
}
