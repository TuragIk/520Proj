// One row inside a GameCard showing odds and volume for a single platform.
// Odds are colored green (≥50%) or red (<50%) to highlight the favored team.
// Returns null if both sides have no data for this platform, so the row is omitted.

import { theme } from "../theme";
import { pct, fmtVol } from "../utils/formatters";
import PlatformBadge from "./PlatformBadge";

// platform: "kalshi" | "polymarket"
// away/home: { abbr, odds: { kalshi, polymarket } }
// volume: { kalshi, polymarket } — may be null for live data
export default function MarketRow({ platform, away, home, volume }) {
  const awayOdds = away.odds[platform];
  const homeOdds = home.odds[platform];
  const vol = volume?.[platform];

  if (awayOdds == null && homeOdds == null) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "130px 1fr 1fr 90px",
        alignItems: "center",
        gap: 12,
        padding: "11px 0",
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <PlatformBadge platform={platform} />

      <div>
        <div
          style={{
            color: theme.colors.textDim,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 3,
          }}
        >
          {away.abbr} (away)
        </div>
        <div
          style={{
            color:
              awayOdds == null
                ? theme.colors.textDim
                : awayOdds >= 0.5
                ? theme.colors.green
                : theme.colors.red,
            fontSize: 20,
            fontWeight: 700,
            fontFamily: theme.fonts.mono,
          }}
        >
          {awayOdds != null ? pct(awayOdds) : "—"}
        </div>
      </div>

      <div>
        <div
          style={{
            color: theme.colors.textDim,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 3,
          }}
        >
          {home.abbr} (home)
        </div>
        <div
          style={{
            color:
              homeOdds == null
                ? theme.colors.textDim
                : homeOdds >= 0.5
                ? theme.colors.green
                : theme.colors.red,
            fontSize: 20,
            fontWeight: 700,
            fontFamily: theme.fonts.mono,
          }}
        >
          {homeOdds != null ? pct(homeOdds) : "—"}
        </div>
      </div>

      <div>
        <div
          style={{
            color: theme.colors.textDim,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 3,
          }}
        >
          Volume
        </div>
        <div
          style={{
            color: vol != null ? theme.colors.text : theme.colors.textDim,
            fontSize: 13,
            fontFamily: theme.fonts.mono,
          }}
        >
          {vol != null ? fmtVol(vol) : "—"}
        </div>
      </div>
    </div>
  );
}
