import { Sliders } from 'lucide-react';
import { inr } from '../format';
import type { PaymentOffer } from '../types';
import { Collapsible } from './Collapsible';
import { RatingStamp, ratingInk } from './RatingStamp';

/** "Compare other ways to pay": every option the page offers, priced all-in. */
export function OfferList({ offers, onChoose }: { offers: PaymentOffer[]; onChoose: (id: string) => void }) {
  if (offers.length === 0) return null;
  return (
    <Collapsible title={`Compare other ways to pay (${offers.length})`} icon={<Sliders className="w-3.5 h-3.5 text-ledger-navy/50" />} className="space-y-2">
      {offers.map((offer) => (
        <button
          key={offer.id}
          type="button"
          onClick={() => onChoose(offer.id)}
          className="w-full text-left p-3 border border-ledger-rule hover:border-ledger-navy/40 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-base text-ledger-navy">{offer.label}</span>
                <RatingStamp rating={offer.rating} />
              </div>
              <p className="text-sm text-ledger-navy/60">{offer.description}</p>
            </div>
            <div className="text-right shrink-0">
              <div className={`text-base font-bold font-mono tabular-nums ${ratingInk(offer.rating)}`}>{inr(offer.trueCost)}</div>
              <div className="text-[11px] text-ledger-navy/50">{offer.benefit}</div>
            </div>
          </div>
        </button>
      ))}
    </Collapsible>
  );
}
