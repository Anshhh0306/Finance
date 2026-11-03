import type { OfferRating } from '../types';

const LABEL: Record<OfferRating, string> = { BEST: 'Best value', GOOD: 'Fair deal', NEUTRAL: '', AVOID: 'Costly' };

/** Text colour for an amount, by how good the option is. */
export const ratingInk = (rating: OfferRating) =>
  rating === 'BEST' ? 'text-ledger-credit' : rating === 'AVOID' ? 'text-ledger-debit' : 'text-ledger-navy';

/** A slightly tilted, ink-stamp style verdict badge. */
export function RatingStamp({ rating }: { rating: OfferRating }) {
  if (!LABEL[rating]) return null;
  const ink =
    rating === 'BEST' ? 'border-ledger-credit text-ledger-credit' : rating === 'AVOID' ? 'border-ledger-debit text-ledger-debit' : 'border-ledger-navy/40 text-ledger-navy';
  return <span className={`inline-block -rotate-2 border px-2 py-0.5 text-[11px] font-bold tracking-tight ${ink}`}>{LABEL[rating]}</span>;
}
