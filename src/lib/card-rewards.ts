/**
 * Reward rates for common Indian credit cards, per spend category, cross-checked against the
 * banks' own pages and card-review sources (Sep 2026). Travel and online rates differ a lot on
 * premium cards, so a single "5% cashback" figure would be wrong for most of them.
 *
 * Most of these cards earn nothing on EMI transactions, so converting a purchase to EMI forfeits
 * the reward. Where that rule could not be confirmed for a specific card, its `notes` say so.
 */

export type SpendCategory = 'online' | 'travel' | 'default';

export interface CardRewardProfile {
  id: string;
  shortLabel: string; // e.g. "Amazon Pay ICICI"
  name: string; // e.g. "Amazon Pay ICICI Bank Credit Card"
  rewardRates: Record<SpendCategory, number>; // percent
  notes: string; // caveat shown in the UI
}

export const CARD_REWARD_PROFILES: CardRewardProfile[] = [
  {
    id: 'amazon-pay-icici',
    shortLabel: 'Amazon Pay ICICI',
    name: 'Amazon Pay ICICI Bank Credit Card',
    rewardRates: { online: 5, travel: 1, default: 1 },
    notes: '5% unlimited cashback on Amazon.in for Prime members (3% for non-Prime), 1% elsewhere. Zero cashback on EMI — confirmed, and expanded from Oct 2025 to also exclude gold, rent, fuel, utilities and international spends.',
  },
  {
    id: 'flipkart-axis',
    shortLabel: 'Flipkart Axis Bank',
    name: 'Flipkart Axis Bank Credit Card',
    rewardRates: { online: 5, travel: 4, default: 1 },
    notes: '5% on Flipkart (capped ₹4,000/quarter), 7.5% on Myntra, 4% unlimited on preferred merchants (Swiggy/Uber/PVR), 1% base elsewhere. EMI forfeits all cashback.',
  },
  {
    id: 'hdfc-millennia',
    shortLabel: 'HDFC Millennia',
    name: 'HDFC Millennia Credit Card',
    rewardRates: { online: 5, travel: 1, default: 1 },
    notes: '5% on 10 named partner brands incl. Amazon/Flipkart/Myntra (capped 1,000 CashPoints/cycle), 1% elsewhere. UNVERIFIED EMI TERMS: sources conflict on whether EMI still earns the 1% since a Sept 2024 change — treat the forfeiture figure here as an estimate, not a confirmed fact.',
  },
  {
    id: 'hdfc-regalia-gold',
    shortLabel: 'HDFC Regalia Gold',
    name: 'HDFC Regalia Gold Credit Card',
    rewardRates: { online: 1.25, travel: 8, default: 1.25 },
    notes: 'Base rate is only ~1.25% (5 pts/₹200) — Amazon/Flipkart are NOT on its accelerated list. Via SmartBuy: ~12.5% on hotels, ~6.25% on flights. EMI strips all points.',
  },
  {
    id: 'hdfc-infinia',
    shortLabel: 'HDFC Infinia',
    name: 'HDFC Infinia Credit Card',
    rewardRates: { online: 3.3, travel: 10, default: 3.3 },
    notes: 'Base 3.3% reward value (5 pts/₹150); up to ~10% via SmartBuy travel after the Jan 2026 cut from 5X to 3X points. Standard SmartBuy bonus stripped on EMI.',
  },
  {
    id: 'sbi-cashback',
    shortLabel: 'SBI Cashback',
    name: 'SBI Cashback Credit Card',
    rewardRates: { online: 5, travel: 1, default: 1 },
    notes: '5% cashback on online spends, capped at ₹2,000/cycle (i.e. only the first ~₹40,000 online spend earns it); ₹4,000/cycle total cap from Apr 2026. EMIs explicitly excluded.',
  },
  {
    id: 'axis-atlas',
    shortLabel: 'Axis Atlas',
    name: 'Axis Atlas Credit Card',
    rewardRates: { online: 2, travel: 5, default: 2 },
    notes: '5 EDGE Miles/₹100 (~5%) on travel/airline/hotel merchants up to ₹2L/month, 2 EDGE Miles/₹100 (~2%) on everything else — including online travel agencies. Zero EDGE Miles on EMI conversions.',
  },
  {
    id: 'axis-magnus',
    shortLabel: 'Axis Magnus',
    name: 'Axis Magnus Credit Card',
    rewardRates: { online: 2, travel: 9, default: 2 },
    notes: '60 EDGE pts/₹200 (~6-12%) via Travel EDGE bookings up to ₹2L/month; 12 EDGE pts/₹200 (~1.2-2.4%) on regular spends. EMI transactions earn no EDGE Reward Points.',
  },
  {
    id: 'idfc-first-wealth',
    shortLabel: 'IDFC FIRST Wealth',
    name: 'IDFC FIRST Wealth Credit Card',
    rewardRates: { online: 0.4, travel: 1.25, default: 0.4 },
    notes: 'Real reward value is modest: 10X pts/₹200 (~1.25%) on dining/travel/international, 3X pts/₹200 (~0.4%) on regular spends. EMI conversions earn no bonus points (only a one-time 5% welcome cashback on your first EMI).',
  },
  {
    id: 'au-lit',
    shortLabel: 'AU LIT',
    name: 'AU Small Finance Bank LIT Credit Card',
    rewardRates: { online: 2, travel: 5, default: 1 },
    notes: '5% cashback on up to 2 user-chosen categories (travel/dining/grocery/electronics/apparel — capped), 1 pt/₹100 (~1%) baseline elsewhere. No cashback on EMI.',
  },
  {
    id: 'kotak-myntra',
    shortLabel: 'Kotak Myntra',
    name: 'Kotak Myntra Credit Card',
    rewardRates: { online: 5, travel: 1.25, default: 1.25 },
    notes: 'DISCONTINUED by Kotak Mahindra Bank on 10 July 2025 — no longer issued to new applicants; kept here only for existing cardholders. Was 5% on preferred partners (capped ₹1,000/month), 1.25% elsewhere. EMI transactions explicitly excluded from cashback.',
  },
  {
    id: 'bobcard-standard',
    shortLabel: 'BOBCARD',
    name: 'Bank of Baroda Credit Card',
    rewardRates: { online: 1, travel: 1, default: 1 },
    notes: '"BOBCARD" spans many different card variants (Eterna/Aspire/Prime/Easy) with different terms — this is a generic 1% base-tier estimate. EMI-forfeiture is assumed (industry-standard) but not separately confirmed for BOBCARD specifically — use Custom % if you know your exact card.',
  },
  {
    id: 'other-standard',
    shortLabel: 'Other / Standard Card',
    name: 'Standard Credit or Debit Card',
    rewardRates: { online: 1, travel: 1, default: 1 },
    notes: 'Generic 1% baseline used when your specific card is not in this list — use Custom % for an exact figure.',
  },
];

export function findCardRewardProfile(id: string): CardRewardProfile | undefined {
  return CARD_REWARD_PROFILES.find((c) => c.id === id);
}

export function getCardRewardRate(card: CardRewardProfile, spendCategory: SpendCategory): number {
  return card.rewardRates[spendCategory];
}
