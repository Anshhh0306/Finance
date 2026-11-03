export type Surface = 'AMAZON' | 'FLIPKART' | 'UDEMY' | 'TRAVEL';

/** card, emi and bnpl block credit; the rest are paid from the bank account or are not payments. */
export type OfferKind = 'upi' | 'card' | 'emi' | 'bnpl' | 'wait' | 'discount' | 'gst-invoice';

export type OfferRating = 'BEST' | 'GOOD' | 'NEUTRAL' | 'AVOID';

/** One way to pay (or not pay) for the checkout, with its all-in cost. */
export interface PaymentOffer {
  id: string;
  kind: OfferKind;
  label: string;
  description: string;
  /** One-line summary, e.g. "₹373 above the sticker price". */
  benefit: string;
  rating: OfferRating;
  reason: string;
  /** What the buyer really pays, in rupees. */
  trueCost: number;
  /** True when this is the option currently picked on the page. */
  selected?: boolean;
  /** EMI terms, so the modal can re-run the math for other tenures. annualRate 0 = No-Cost EMI. */
  emi?: { tenureMonths: number; annualRate: number };
}

export interface CheckoutInfo {
  surface: Surface;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  offers: PaymentOffer[];
  /** Present only for carts with more than one item. */
  cart?: { count: number; preview: string[] };
}

export const CREDIT_KINDS: ReadonlySet<OfferKind> = new Set(['card', 'emi', 'bnpl']);
