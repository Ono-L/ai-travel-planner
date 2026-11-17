export const DEFAULT_CURRENCY = 'JPY';
export const MAX_RECEIPT_SIZE_MB = 10;

// 通貨フォーマット共通ユーティリティ (docs/03_Rules/coding_rules.md 準拠)
export const formatCurrency = (amount: number, currency: string = DEFAULT_CURRENCY): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};
