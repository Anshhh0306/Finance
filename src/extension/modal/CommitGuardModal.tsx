import { useEffect, useState } from 'react';
import { ArrowRight, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { calculateNoCostEmi, evaluateMixedCartRisk } from '../../lib/finance';
import { inr } from '../format';
import { withTenure } from '../offers';
import { CREDIT_KINDS, type CheckoutInfo, type PaymentOffer, type Surface } from '../types';
import { CardRewardCheck } from './CardRewardCheck';
import { Chip } from './Chip';
import { CreditLimitImpact } from './CreditLimitImpact';
import { EmiCostBreakdown } from './EmiCostBreakdown';
import { OfferList } from './OfferList';
import { RatingStamp, ratingInk } from './RatingStamp';

const SURFACE_LABEL: Record<Surface, string> = {
  AMAZON: 'Amazon order',
  FLIPKART: 'Flipkart order',
  UDEMY: 'Course purchase',
  TRAVEL: 'Trip booking',
};

const DEFAULT_CARD: Record<Surface, string> = {
  AMAZON: 'amazon-pay-icici',
  FLIPKART: 'flipkart-axis',
  UDEMY: 'other-standard',
  TRAVEL: 'other-standard',
};

const TENURE_CHOICES = [3, 6, 9, 12, 18, 24, 36];

function verdict(offer: PaymentOffer): string {
  if (offer.rating === 'BEST') return `Best value: ${offer.benefit}.`;
  if (offer.rating === 'AVOID') return `Costs more than it looks: ${offer.benefit}.`;
  return `${offer.benefit.charAt(0).toUpperCase()}${offer.benefit.slice(1)}.`;
}

function whyFlagged(surface: Surface, price: number): string {
  if (surface === 'UDEMY') return 'Paying in full by UPI or card avoids pay-later late fees. If you are not sure you will take the course, waiting costs nothing.';
  if (surface === 'TRAVEL') return `EMI and pay-later plans add interest, 18% GST on that interest and a processing fee. Paying ${inr(price)} upfront by UPI avoids all three.`;
  const { hiddenCost } = calculateNoCostEmi({ price, tenureMonths: 12 });
  return `Paying in full keeps any card cashback. A 12-month No-Cost EMI forfeits it and adds about ${inr(hiddenCost)} in GST and fees.`;
}

interface Props {
  info: CheckoutInfo;
  onContinue: () => void;
  onCancel: () => void;
}

export function CommitGuardModal({ info, onContinue, onCancel }: Props) {
  const { surface, name, price, originalPrice, discountPercent, offers, cart } = info;
  const [chosenId, setChosenId] = useState<string | null>(null);
  // Re-priced version of an offer at a tenure the user tried, plus the offer it came from.
  const [retenured, setRetenured] = useState<{ base: PaymentOffer; offer: PaymentOffer } | null>(null);

  const allOffers = retenured ? [retenured.offer, ...offers] : offers;
  const selected = allOffers.find((o) => o.id === chosenId) ?? allOffers.find((o) => o.selected) ?? allOffers[0];
  const showsRetenured = !!retenured && selected === retenured.offer;
  const tenureBase = showsRetenured ? retenured.base : selected;
  const offersEmi = surface !== 'UDEMY';
  const mixedCart = cart && offersEmi ? evaluateMixedCartRisk(price, cart.count, 12) : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const chooseOffer = (id: string) => {
    setRetenured(null);
    setChosenId(id);
  };
  const chooseTenure = (months: number) => {
    const offer = withTenure(tenureBase, price, months);
    setRetenured({ base: tenureBase, offer });
    setChosenId(offer.id);
  };

  return (
    <div className="commitguard-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="commitguard-card" role="dialog" aria-modal="true" aria-label="CommitGuard: the real cost of this payment">
        <header className="bg-ledger-navy px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <ShieldCheck className="w-5 h-5 text-ledger-seal shrink-0" />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-white font-bold text-lg">CommitGuard</span>
                <span className="text-white/50 text-sm font-medium">{SURFACE_LABEL[surface]}</span>
              </div>
              <p className="text-white/70 text-sm mt-0.5">The real cost, before you pay.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            title="Cancel and stay on this page (Esc)"
            aria-label="Cancel"
            className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="bg-ledger-paper max-h-[85vh] overflow-y-auto">
          <div className="px-6 py-3.5 border-b border-ledger-rule flex items-center justify-between gap-3">
            <span className="text-base font-semibold text-ledger-navy truncate">{name}</span>
            <span className="flex items-baseline gap-2 shrink-0 font-mono tabular-nums">
              {!!originalPrice && <span className="text-sm text-ledger-navy/40 line-through">{inr(originalPrice)}</span>}
              <span className="text-xl font-bold text-ledger-navy">{inr(price)}</span>
              {!!discountPercent && <span className="text-[11px] font-bold text-ledger-credit">{discountPercent}% off</span>}
            </span>
          </div>

          {cart && mixedCart && (
            <div className="mx-6 mt-3.5 p-3 border border-ledger-rule bg-white text-sm text-ledger-navy space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold">
                  {cart.count} items in this cart, {inr(price)} total
                </span>
                <span className={`font-mono tabular-nums font-bold ${mixedCart.meetsMinimum ? 'text-ledger-credit' : 'text-ledger-debit'}`}>
                  {mixedCart.meetsMinimum ? 'Meets the EMI minimum' : `Below the ${inr(mixedCart.minimum)} EMI minimum`}
                </span>
              </div>
              <p className="text-ledger-navy/70 leading-relaxed">
                If even one item doesn't qualify for No-Cost EMI, banks often drop the discount for the whole order, which could add about {inr(mixedCart.totalAtRisk)} in
                interest and GST. Checking out the expensive item on its own keeps the EMI discount.
              </p>
              {cart.preview.length > 0 && <p className="text-ledger-navy/40 text-xs italic">In cart: {cart.preview.join(', ')}</p>}
            </div>
          )}

          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-ledger-navy/70">Payment methods on this page</span>
              <div className="flex flex-wrap gap-1.5">
                {allOffers.map((offer) => (
                  <Chip key={offer.id} active={selected.id === offer.id} onClick={() => chooseOffer(offer.id)} className="px-3 py-1.5 text-sm font-semibold">
                    {offer.label}
                  </Chip>
                ))}
              </div>
              {(tenureBase.kind === 'card' || tenureBase.kind === 'emi') && offersEmi && (
                <div className="pt-2 border-t border-ledger-rule flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ledger-navy/70">Try a different tenure on this card:</span>
                  <div className="flex items-center gap-1.5">
                    {TENURE_CHOICES.map((months) => (
                      <Chip
                        key={months}
                        active={showsRetenured && retenured.offer.emi?.tenureMonths === months}
                        onClick={() => chooseTenure(months)}
                        className="px-2 py-1 text-xs font-mono tabular-nums font-bold"
                      >
                        {months}m
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <section className="border-t-2 border-b-2 border-ledger-navy py-3.5 space-y-2" aria-label="Selected payment option">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-ledger-navy/50">You selected</span>
                    <RatingStamp rating={selected.rating} />
                  </div>
                  <p className="font-bold text-ledger-navy text-lg leading-tight">{selected.label}</p>
                  <p className="text-sm text-ledger-navy/70">{verdict(selected)}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-ledger-navy/50 font-semibold">True cost</div>
                  <div className={`text-2xl font-bold font-mono tabular-nums ${ratingInk(selected.rating)}`}>{inr(selected.trueCost)}</div>
                </div>
              </div>
              <p className="text-sm text-ledger-navy/80 leading-relaxed border-l-2 border-ledger-rule pl-2.5">{selected.reason}</p>
            </section>

            <div className="divide-y divide-ledger-rule border border-ledger-rule bg-white">
              <OfferList offers={allOffers.filter((o) => o.id !== selected.id)} onChoose={chooseOffer} />
              {CREDIT_KINDS.has(selected.kind) && (
                <>
                  <CreditLimitImpact orderAmount={price} />
                  <CardRewardCheck amount={price} spendCategory={surface === 'TRAVEL' ? 'travel' : 'online'} defaultCardId={DEFAULT_CARD[surface]} />
                </>
              )}
              {offersEmi && <EmiCostBreakdown price={price} />}
            </div>

            <p className="text-sm text-ledger-navy/80 leading-relaxed border-l-2 border-ledger-seal pl-3">
              <span className="font-bold text-ledger-navy">Why we're flagging this. </span>
              {whyFlagged(surface, price)}
            </p>
          </div>
        </div>

        <footer className="bg-white px-6 py-3.5 border-t border-ledger-rule flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 py-2.5 px-4 border border-ledger-rule text-ledger-navy text-sm sm:text-base font-semibold hover:bg-ledger-paper transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Cancel and change terms
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="w-1/2 py-2.5 px-4 bg-ledger-navy text-white text-sm sm:text-base font-semibold hover:bg-ledger-navy/90 transition-colors flex items-center justify-center gap-1.5"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </footer>
      </div>
    </div>
  );
}
