export type CurrencyCode = 'USD' | 'IDR' | 'EUR' | 'SGD' | 'JPY' | 'GBP';

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar', locale: 'en-US' },
  { code: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah', locale: 'id-ID' },
  { code: 'EUR', symbol: '€', label: 'Euro', locale: 'de-DE' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'GBP', symbol: '£', label: 'British Pound', locale: 'en-GB' },
];

export const getCurrency = (code: CurrencyCode): CurrencyOption =>
  CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

/**
 * Format a numeric amount into the selected currency display.
 * Negative amounts get a leading "-".
 */
export const formatCurrency = (amount: number, code: CurrencyCode): string => {
  const cur = getCurrency(code);
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString(cur.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${cur.symbol}${formatted}` : `${cur.symbol}${formatted}`;
};
