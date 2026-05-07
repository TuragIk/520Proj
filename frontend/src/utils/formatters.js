// Shared display formatters used across components.
// pct: implied probability (0–1) → percentage string, e.g. 0.72 → "72%"
// fmtVol: dollar volume → compact string, e.g. 1340000 → "$1.3M"
// fmtDate/fmtTime: ISO timestamp → locale-friendly strings using the user's local timezone

export const fmt = (n) => `$${n.toFixed(2)}`;
export const pct = (n) => `${(n * 100).toFixed(0)}%`;

export const fmtVol = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
