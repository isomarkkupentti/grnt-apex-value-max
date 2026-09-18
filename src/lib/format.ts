export function formatEur(n: number, digits = 0) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1_000_000_000) return `${sign}€${(abs / 1_000_000_000).toFixed(2)}bn`;
  if (abs >= 1_000_000) return `${sign}€${(abs / 1_000_000).toFixed(2)}m`;
  if (abs >= 10_000) return `${sign}€${(abs / 1_000).toFixed(1)}k`;
  return `${sign}€${abs.toLocaleString("en-GB", { maximumFractionDigits: digits })}`;
}

export function formatPct(n: number, digits = 1) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${(Math.abs(n) * 100).toFixed(digits)}%`;
}

export function formatOdds(p: number) {
  if (p <= 0 || p >= 1) return "—";
  return (1 / p).toFixed(3);
}
