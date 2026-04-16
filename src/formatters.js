export function formatValue(value, format, unit = "") {
  if (value === null || value === undefined || !Number.isFinite(value)) return "n/a";
  if (format === "percent") return `${(value * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
  if (format === "currency") return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (format === "ratio") return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  const maximumFractionDigits = Math.abs(value) >= 1000 ? 0 : 2;
  const suffix = unit && !["%", "$/BOE", "$/bbl", "$/ft"].includes(unit) ? ` ${unit}` : "";
  return `${value.toLocaleString(undefined, { maximumFractionDigits })}${suffix}`;
}

export function benchmark(records, kpi) {
  const values = records.map((r) => r.value).filter((v) => Number.isFinite(v));
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const best = kpi.lowerIsBetter ? sorted[0] : sorted[sorted.length - 1];
  const worst = kpi.lowerIsBetter ? sorted[sorted.length - 1] : sorted[0];
  return { average, best, worst };
}

export function trendFor(value, average, lowerIsBetter = false) {
  if (!Number.isFinite(value) || !Number.isFinite(average) || average === 0) return { label: "No trend", tone: "flat", delta: 0 };
  const delta = (value - average) / Math.abs(average);
  const favorable = lowerIsBetter ? delta < 0 : delta > 0;
  return { label: favorable ? "Above peer signal" : "Watchlist signal", tone: favorable ? "good" : "risk", delta };
}
