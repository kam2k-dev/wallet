import { CurrencyCode } from './currency';

// Default exchange rates (base USD) as reliable fallback
export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  IDR: 16250.0,
  EUR: 0.92,
  SGD: 1.34,
  JPY: 153.5,
  GBP: 0.78,
};

let cachedRates: Record<CurrencyCode, number> = { ...FALLBACK_RATES };
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch live exchange rates from open.er-api.com (free, no API key needed).
 * Falls back gracefully to static rates if offline or fetch fails.
 */
export async function fetchLiveRates(): Promise<Record<CurrencyCode, number>> {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        cachedRates = {
          USD: 1.0,
          IDR: data.rates.IDR || FALLBACK_RATES.IDR,
          EUR: data.rates.EUR || FALLBACK_RATES.EUR,
          SGD: data.rates.SGD || FALLBACK_RATES.SGD,
          JPY: data.rates.JPY || FALLBACK_RATES.JPY,
          GBP: data.rates.GBP || FALLBACK_RATES.GBP,
        };
        lastFetchTime = now;
      }
    }
  } catch (err) {
    console.warn('Using fallback exchange rates:', err);
  }
  return cachedRates;
}

/**
 * Convert an amount from `fromCurrency` to `toCurrency` based on base USD rates.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number> = cachedRates
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = rates[fromCurrency] || FALLBACK_RATES[fromCurrency] || 1;
  const toRate = rates[toCurrency] || FALLBACK_RATES[toCurrency] || 1;

  // Convert `amount` to USD first, then convert from USD to `toCurrency`
  const amountInUSD = amount / fromRate;
  const converted = amountInUSD * toRate;

  // Round smartly based on currency (IDR/JPY round to integer or 2 decimal places)
  if (toCurrency === 'IDR' || toCurrency === 'JPY') {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}
