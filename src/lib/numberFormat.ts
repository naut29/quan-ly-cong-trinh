export const formatCurrencyCompact = (value: number): string => {
  const numeric = Number.isFinite(value) ? value : 0;

  if (Math.abs(numeric) >= 1_000_000_000) {
    return `${(numeric / 1_000_000_000).toFixed(1)} ty`;
  }

  if (Math.abs(numeric) >= 1_000_000) {
    return `${(numeric / 1_000_000).toFixed(0)} tr`;
  }

  return new Intl.NumberFormat("vi-VN").format(numeric);
};

export const formatCurrencyFull = (value: number, currency = "VND"): string => {
  const numeric = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numeric);
};

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};
