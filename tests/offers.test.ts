import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, rupeeAmounts } from '../src/extension/dom';
import { cardCashbackOffer, gstInvoiceOffer, interestEmiOffer, noCostEmiOffer, upiOffer, withTenure } from '../src/extension/offers';
import { calculateNoCostEmi } from '../src/lib/finance';

describe('parseAmount', () => {
  it('reads rupee amounts with Indian grouping and paise', () => {
    assert.equal(parseAmount('₹3,439.00'), 3439);
    assert.equal(parseAmount('Total Due ₹ 13,061'), 13061);
    assert.equal(parseAmount('₹539.00'), 539);
  });

  it('returns 0 when there is no amount', () => {
    assert.equal(parseAmount('Free delivery'), 0);
  });
});

describe('rupeeAmounts', () => {
  it('lists every ₹ figure in page order', () => {
    assert.deepEqual(rupeeAmounts('MRP ₹11,999 now ₹9,982'), [11999, 9982]);
  });
});

describe('payment offers', () => {
  it('prices No-Cost EMI with the engine', () => {
    const offer = noCostEmiOffer({ id: 'emi', label: 'ICICI Bank No-Cost EMI', price: 9982, tenureMonths: 12 });
    assert.equal(offer.trueCost, Math.round(calculateNoCostEmi({ price: 9982, tenureMonths: 12 }).trueCost));
    assert.equal(offer.label, 'ICICI Bank No-Cost EMI (12 months)');
    assert.deepEqual(offer.emi, { tenureMonths: 12, annualRate: 0 });
  });

  it('uses EMI terms printed on the page when there are any', () => {
    const offer = interestEmiOffer({
      id: 'bank-emi',
      label: 'HDFC Bank EMI',
      price: 13061,
      tenureMonths: 12,
      annualRate: 14,
      stated: { monthlyEmi: 1195, interest: 1279, totalPayable: 14340 },
    });
    assert.equal(offer.trueCost, 14805);
  });

  it('re-prices an EMI at another tenure, keeping its interest rate', () => {
    const base = interestEmiOffer({ id: 'bank-emi', label: 'HDFC Bank EMI', price: 10000, tenureMonths: 12, annualRate: 12 });
    const nine = withTenure(base, 10000, 9);
    assert.equal(nine.id, 'bank-emi-9m');
    assert.equal(nine.label, 'HDFC Bank EMI (9 months at 12%)');
    assert.equal(nine.selected, true);
  });

  it('turns a card paid in full into a No-Cost EMI on that card', () => {
    const card = cardCashbackOffer({ id: 'axis', cardId: 'flipkart-axis', price: 9982 });
    assert.equal(card.trueCost, 9483);
    assert.equal(withTenure(card, 9982, 6).label, 'Flipkart Axis Bank Credit Card No-Cost EMI (6 months)');
  });

  it('suggests a GST invoice only from ₹5,000', () => {
    assert.equal(gstInvoiceOffer(4999, 18, 'Flipkart'), null);
    assert.equal(gstInvoiceOffer(10000, 18, 'Flipkart')?.trueCost, 8200);
  });

  it('treats UPI as the zero-cost baseline', () => {
    assert.equal(upiOffer(1138).trueCost, 1138);
  });
});
