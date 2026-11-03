import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  addEmiCharges,
  calculateCardReward,
  calculateCreditUtilization,
  calculateInterestEmi,
  calculateNoCostEmi,
  evaluateMixedCartRisk,
  futureValue,
  savingsPlanValue,
} from '../src/lib/finance';
import { CARD_REWARD_PROFILES, findCardRewardProfile, getCardRewardRate } from '../src/lib/card-rewards';

describe('calculateNoCostEmi', () => {
  const laptop = calculateNoCostEmi({ price: 80000, tenureMonths: 12 });

  it('prices a "0%" 12-month EMI on ₹80,000 at 19.93% effective APR', () => {
    assert.equal(laptop.effectiveApr, 19.93);
    assert.equal(laptop.hiddenCost, 1339.65);
    assert.equal(laptop.trueCost, 81339.65);
  });

  it('builds one schedule row per month that pays the loan off', () => {
    assert.equal(laptop.schedule.length, 12);
    assert.equal(laptop.schedule.at(-1)?.closingBalance, 0);
  });

  it('has the merchant discount cancel out the bank interest', () => {
    assert.ok(Math.abs(laptop.merchantDiscount - laptop.totalInterest) < 0.1);
  });

  it('itemises the hidden cost as fee + GST on fee + GST on interest', () => {
    const phone = calculateNoCostEmi({ price: 9982, tenureMonths: 12 });
    assert.equal(phone.processingFee, 199);
    assert.equal(phone.gstOnFee, 35.82);
    assert.equal(phone.gstOnInterest, 137.85);
    assert.equal(phone.hiddenCost, 372.67);
    assert.equal(phone.effectiveApr, 25.24);
  });

  it('costs more per year on a shorter tenure, because the fee is spread over fewer months', () => {
    const sixMonths = calculateNoCostEmi({ price: 9982, tenureMonths: 6 });
    assert.equal(sixMonths.effectiveApr, 30.01);
    assert.ok(sixMonths.effectiveApr > calculateNoCostEmi({ price: 9982, tenureMonths: 12 }).effectiveApr);
  });
});

describe('calculateInterestEmi', () => {
  it('uses the reducing-balance EMI formula and adds GST and the fee', () => {
    const emi = calculateInterestEmi({ price: 10000, tenureMonths: 12, annualRate: 12 });
    assert.equal(emi.monthlyEmi, 888.49);
    assert.equal(emi.totalInterest, 661.85);
    assert.equal(emi.gstOnInterest, 119.13);
    assert.equal(emi.trueCost, 11015.8);
  });

  it('handles a zero rate without dividing by zero', () => {
    const emi = calculateInterestEmi({ price: 1200, tenureMonths: 12, annualRate: 0 });
    assert.equal(emi.monthlyEmi, 100);
    assert.equal(emi.totalInterest, 0);
  });
});

describe('addEmiCharges', () => {
  it('adds 18% GST on stated interest plus the fee to the stated total', () => {
    const charges = addEmiCharges(14340, 1279);
    assert.equal(charges.gstOnInterest, 230.22);
    assert.equal(charges.upfrontCost, 234.82);
    assert.equal(charges.trueCost, 14805.04);
  });
});

describe('evaluateMixedCartRisk', () => {
  it('flags no risk for a single item, and checks the ₹3,000 minimum', () => {
    const single = evaluateMixedCartRisk(2500, 1);
    assert.equal(single.isMultiItem, false);
    assert.equal(single.meetsMinimum, false);
    assert.equal(single.totalAtRisk, 0);
  });

  it('estimates the interest and GST if a mixed cart loses No-Cost EMI', () => {
    const cart = evaluateMixedCartRisk(45000, 3, 6, 15);
    assert.equal(cart.interestAtRisk, 3375);
    assert.equal(cart.gstAtRisk, 607.5);
    assert.equal(cart.totalAtRisk, 3982.5);
  });
});

describe('calculateCreditUtilization', () => {
  it('rates under 30% as safe', () => {
    const u = calculateCreditUtilization({ orderAmount: 9000, existingBalance: 0, creditLimit: 50000 });
    assert.equal(u.tier, 'SAFE');
    assert.equal(u.scoreDropEstimate, '0');
  });

  it('counts the existing balance towards the blocked amount', () => {
    const u = calculateCreditUtilization({ orderAmount: 18000, existingBalance: 6000, creditLimit: 50000 });
    assert.equal(u.blockedAmount, 24000);
    assert.equal(u.tier, 'CAUTION');
  });

  it('rates over 50% as danger', () => {
    const u = calculateCreditUtilization({ orderAmount: 60000, existingBalance: 0, creditLimit: 80000 });
    assert.equal(u.utilizationPercent, 75);
    assert.equal(u.tier, 'DANGER');
    assert.equal(u.scoreDropEstimate, '20-40');
  });

  it('returns 0% instead of dividing by a zero limit', () => {
    assert.equal(calculateCreditUtilization({ orderAmount: 500, existingBalance: 0, creditLimit: 0 }).utilizationPercent, 0);
  });
});

describe('card rewards', () => {
  it('reads category-specific rates from the card database', () => {
    const icici = findCardRewardProfile('amazon-pay-icici');
    assert.ok(icici);
    assert.equal(getCardRewardRate(icici, 'online'), 5);
    assert.equal(getCardRewardRate(icici, 'travel'), 1);
    assert.ok(CARD_REWARD_PROFILES.length >= 10);
  });

  it('computes the reward kept by paying in full', () => {
    const r = calculateCardReward(65000, 5);
    assert.equal(r.reward, 3250);
    assert.equal(r.costIfPaidInFull, 61750);
  });
});

describe('savings growth', () => {
  it('compounds a lump sum yearly', () => {
    assert.equal(futureValue(1000, 7.1, 1), 1071);
    assert.equal(futureValue(1000, 7.1, 5), 1409.12);
  });

  it('compounds monthly savings', () => {
    assert.equal(savingsPlanValue(1000, 12, 12), 12809.33);
    assert.equal(savingsPlanValue(1000, 0, 12), 12000);
  });
});
