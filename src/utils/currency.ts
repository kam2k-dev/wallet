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
 * - Menghilangkan desimal ,00
 * - Untuk nominal besar (>= 1.000.000 / jutaan), diringkas contoh:
 *   - 10.450.000 -> Rp10.450k (atau 10jt jika pas kelipatan juta/10jt)
 */
export const formatCurrency = (amount: number, code: CurrencyCode = 'IDR'): string => {
  const cur = getCurrency(code);
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  // Khusus format Rupiah (IDR) atau format ringkas
  if (code === 'IDR') {
    if (abs >= 1_000_000) {
      // Jika kelipatan tepat 1 juta (cth 10.000.000 -> 10 jt, 1.000.000 -> 1 jt)
      if (abs % 1_000_000 === 0) {
        return `${sign}Rp${abs / 1_000_000} jt`;
      }
      // Jika ribuan (cth 10.450.000 -> 10.450k)
      const inThousands = Math.round(abs / 1000);
      return `${sign}Rp${inThousands.toLocaleString('id-ID')}k`;
    }

    // Nominal di bawah 1 juta (cth: 25.000, 200.000) tanpa desimal ,00
    const formatted = Math.round(abs).toLocaleString('id-ID');
    return `${sign}Rp${formatted}`;
  }

  // Untuk mata uang lainnya (USD, EUR, dll) tanpa desimal jika bulat
  const hasDecimals = abs % 1 !== 0;
  const formatted = abs.toLocaleString(cur.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  });

  return `${sign}${cur.symbol}${formatted}`;
};
