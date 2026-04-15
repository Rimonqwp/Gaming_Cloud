export type SupportedCurrency = "USD" | "CNY" | "HKD" | "NTD";

export const DEFAULT_SUPPORTED_CURRENCY: SupportedCurrency = "CNY";
const INTERNAL_USD_PRECISION = 6;

export const SUPPORTED_CURRENCY_OPTIONS: {
  code: SupportedCurrency;
  label: string;
  symbol: string;
  usdRate: number;
}[] = [
  { code: "USD", label: "US Dollar", symbol: "$", usdRate: 1 },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥", usdRate: 7.2 },
  { code: "HKD", label: "Hong Kong Dollar", symbol: "HK$", usdRate: 7.8 },
  { code: "NTD", label: "New Taiwan Dollar", symbol: "NT$", usdRate: 32.2 },
];

const SUPPORTED_CURRENCY_SET = new Set<SupportedCurrency>(
  SUPPORTED_CURRENCY_OPTIONS.map((option) => option.code),
);

export function normalizeSupportedCurrency(
  value: string | null | undefined,
  fallback: SupportedCurrency = DEFAULT_SUPPORTED_CURRENCY,
): SupportedCurrency {
  const normalized = String(value || "").trim().toUpperCase();
  return SUPPORTED_CURRENCY_SET.has(normalized as SupportedCurrency)
    ? (normalized as SupportedCurrency)
    : fallback;
}

export function getCurrencyOption(currency: SupportedCurrency) {
  return (
    SUPPORTED_CURRENCY_OPTIONS.find((option) => option.code === currency) ??
    SUPPORTED_CURRENCY_OPTIONS[0]
  );
}

export function getCurrencySymbol(currency: SupportedCurrency) {
  return getCurrencyOption(currency).symbol;
}

export function convertUsdToCurrency(amountUsd: number, currency: SupportedCurrency) {
  const rate = getCurrencyOption(currency).usdRate;
  return Number((amountUsd * rate).toFixed(2));
}

export function convertCurrencyToUsd(amount: number, currency: SupportedCurrency) {
  const rate = getCurrencyOption(currency).usdRate;
  return Number((amount / rate).toFixed(INTERNAL_USD_PRECISION));
}

export function formatCurrencyAmount(amount: number, currency: SupportedCurrency) {
  const option = getCurrencyOption(currency);
  return `${option.symbol}${amount.toFixed(2)}`;
}

export function formatCurrencyWithCode(amount: number, currency: SupportedCurrency) {
  return `${currency} ${formatCurrencyAmount(amount, currency)}`;
}
