/** Builders for the payment options shown in the modal. All money math goes through src/lib/finance. */
import { addEmiCharges, calculateCardReward, calculateInterestEmi, calculateNoCostEmi } from '../lib/finance';
import { findCardRewardProfile, getCardRewardRate } from '../lib/card-rewards';
import { inr } from './format';
import type { PaymentOffer } from './types';

export function upiOffer(price: number, { label = 'UPI / direct debit', selected = false } = {}): PaymentOffer {
  return {
    id: 'upi',
    kind: 'upi',
    label,
    description: `One payment of ${inr(price)} from your bank account`,
    benefit: 'no interest, no fees, no credit used',
    rating: 'BEST',
    reason: 'Settles instantly from your bank account, so nothing is added on top and your card limit stays free.',
    trueCost: price,
    selected,
  };
}

/** A co-branded card's cashback for paying in full. `cashback` overrides the card's standard rate. */
export function cardCashbackOffer({ id, cardId, price, cashback, selected = false }: { id: string; cardId: string; price: number; cashback?: number; selected?: boolean }): PaymentOffer {
  const card = findCardRewardProfile(cardId);
  if (!card) throw new Error(`Unknown card profile: ${cardId}`);
  const rate = getCardRewardRate(card, 'online');
  const amount = cashback ?? calculateCardReward(price, rate).reward;
  return {
    id,
    kind: 'card',
    label: card.name,
    description: `Pay in full and get ${rate}% back as cashback`,
    benefit: `${inr(amount)} cashback`,
    rating: 'BEST',
    reason: `Paying the full amount keeps the card's ${inr(amount)} cashback. Converting the same purchase to EMI forfeits it.`,
    trueCost: Math.round(price - amount),
    selected,
  };
}

/** Any credit or debit card paid in full, with the page's bank offer applied when there is one. */
export function cardOffer({ price, bankDiscount = 0, selected = false }: { price: number; bankDiscount?: number; selected?: boolean }): PaymentOffer {
  return {
    id: 'card',
    kind: 'card',
    label: bankDiscount ? 'Credit card with bank offer' : 'Credit or debit card',
    description: bankDiscount ? `Instant discount of up to ${inr(bankDiscount)} on select credit cards` : 'One payment, no instalments',
    benefit: bankDiscount ? `${inr(bankDiscount)} off upfront` : 'no interest if the bill is paid on time',
    rating: bankDiscount ? 'GOOD' : 'NEUTRAL',
    reason: 'Paid in full, a card adds no fees. The amount still counts against your credit limit until the bill is paid.',
    trueCost: Math.round(price - bankDiscount),
    selected,
  };
}

export function couponOffer(price: number, amount: number): PaymentOffer {
  return {
    id: 'coupon',
    kind: 'discount',
    label: `Coupon: ${inr(amount)} off`,
    description: 'A coupon shown on this page, applied before payment',
    benefit: `${inr(amount)} off`,
    rating: 'BEST',
    reason: 'A straight price cut that stacks with whichever payment method you choose.',
    trueCost: Math.round(price - amount),
  };
}

export function noCostEmiOffer({ id, label, price, tenureMonths, note, selected = false }: { id: string; label: string; price: number; tenureMonths: number; note?: string; selected?: boolean }): PaymentOffer {
  const emi = calculateNoCostEmi({ price, tenureMonths });
  return {
    id,
    kind: 'emi',
    label: `${label} (${tenureMonths} months)`,
    description: `${tenureMonths} × ${inr(emi.monthlyEmi)} a month${note ? ` (${note})` : ''}`,
    benefit: `${inr(emi.hiddenCost)} above the sticker price`,
    rating: 'AVOID',
    reason: `"No-Cost" still carries a ${inr(emi.processingFee)} processing fee, plus 18% GST on that fee and on the interest the merchant discounts. That works out to a ${emi.effectiveApr}% effective APR.`,
    trueCost: Math.round(emi.trueCost),
    selected,
    emi: { tenureMonths, annualRate: 0 },
  };
}

/** Terms printed on the page, e.g. "12 months x ₹1,195 · Incl. ₹1,279 interest · ₹14,340 total payable". */
export interface StatedEmiTerms {
  monthlyEmi: number;
  interest: number;
  totalPayable: number;
}

function emiCosts(price: number, tenureMonths: number, annualRate: number, stated?: StatedEmiTerms) {
  if (stated) return { ...addEmiCharges(stated.totalPayable, stated.interest), monthlyEmi: stated.monthlyEmi, totalPayable: stated.totalPayable };
  const emi = calculateInterestEmi({ price, tenureMonths, annualRate });
  return { ...emi, totalPayable: price + emi.totalInterest };
}

export function interestEmiOffer({ id, label, price, tenureMonths, annualRate, stated, selected = false }: { id: string; label: string; price: number; tenureMonths: number; annualRate: number; stated?: StatedEmiTerms; selected?: boolean }): PaymentOffer {
  const cost = emiCosts(price, tenureMonths, annualRate, stated);
  return {
    id,
    kind: 'emi',
    label: `${label} (${tenureMonths} months at ${annualRate}%)`,
    description: `${tenureMonths} × ${inr(cost.monthlyEmi)} a month, ${inr(cost.totalPayable)} total payable`,
    benefit: `${inr(cost.hiddenCost)} in GST and fees on top`,
    rating: 'AVOID',
    reason: `On top of the ${inr(cost.totalPayable)} payable, the lender adds 18% GST on the interest (${inr(cost.gstOnInterest)}) and a processing fee with GST (${inr(cost.upfrontCost)}), so you pay ${inr(cost.trueCost)} in all.`,
    trueCost: Math.round(cost.trueCost),
    selected,
    emi: { tenureMonths, annualRate },
  };
}

/**
 * GST-registered buyers can claim input tax credit on business purchases (Section 16, CGST Act),
 * but only on a GST invoice requested before paying: a consumer invoice cannot be converted later.
 */
export function gstInvoiceOffer(price: number, gstRatePercent: number, platform: string): PaymentOffer | null {
  if (price < 5000) return null;
  const credit = Math.round(price * (gstRatePercent / 100));
  return {
    id: 'gst-invoice',
    kind: 'gst-invoice',
    label: `Business purchase? Ask ${platform} for a GST invoice`,
    description: `Claim ${gstRatePercent}% GST as input tax credit`,
    benefit: `reclaim up to ${inr(credit)}`,
    rating: 'GOOD',
    reason: `A GST-registered business or freelancer can offset ${inr(credit)} of output tax under Section 16 of the CGST Act, but only with a GST invoice requested before paying. A consumer invoice cannot be converted afterwards.`,
    trueCost: price - credit,
  };
}

/** The same purchase as an EMI over a different tenure, priced with the offer's own rate. */
export function withTenure(base: PaymentOffer, price: number, tenureMonths: number): PaymentOffer {
  const id = `${base.id}-${tenureMonths}m`;
  const name = base.label.replace(/\s*\(.*\)$/, '');
  const annualRate = base.emi?.annualRate ?? 0;
  if (annualRate > 0) return interestEmiOffer({ id, label: name, price, tenureMonths, annualRate, selected: true });
  return noCostEmiOffer({ id, label: base.kind === 'emi' ? name : `${name} No-Cost EMI`, price, tenureMonths, selected: true });
}
