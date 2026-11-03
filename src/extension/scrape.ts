import { scrapeAmazon } from './sites/amazon';
import { scrapeFlipkart } from './sites/flipkart';
import { scrapeMakeMyTrip } from './sites/makemytrip';
import { scrapeUdemy } from './sites/udemy';
import type { CheckoutInfo, Surface } from './types';

export function detectSurface(hostname: string): Surface | null {
  const host = hostname.toLowerCase();
  if (host.includes('amazon')) return 'AMAZON';
  if (host.includes('flipkart')) return 'FLIPKART';
  if (host.includes('udemy')) return 'UDEMY';
  if (host.includes('makemytrip')) return 'TRAVEL';
  return null;
}

/** Reads the product, price and payment options off the current checkout page. */
export function scrapeCheckout(surface: Surface, clicked: HTMLElement | null): CheckoutInfo {
  switch (surface) {
    case 'AMAZON':
      return scrapeAmazon(clicked);
    case 'FLIPKART':
      return scrapeFlipkart(clicked);
    case 'UDEMY':
      return scrapeUdemy(clicked);
    case 'TRAVEL':
      return scrapeMakeMyTrip(clicked);
  }
}
