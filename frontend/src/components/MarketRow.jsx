import { theme } from "../theme";
import { pct, fmt, fmtVol } from "../utils/formatters";
import PlatformBadge from "./PlatformBadge";

export default function MarketRow({ market }) {
  const bestYes = market.yes_bid ?? market.yes_price;
  const bestNo = market.no_bid ?? market.no_price;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr 100px",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <PlatformBadge platform={market.platform} />
      <div style={{ display: "flex", gap: 24 }}>
        <div>
          <div
            style={{
              color: theme.colors.textDim,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 2,
            }}
          >
            Yes
          </div>
          <div
            style={{
              color: theme.colors.green,
              fontSize: 18,
              fontWeight: 700,
              fontFamily: theme.fonts.mono,
            }}
          >
            {pct(bestYes)}
          </div>
          {market.yes_bid != null && (
            <div
              style={{
                color: theme.colors.textDim,
                fontSize: 10,
                fontFamily: theme.fonts.mono,
              }}
            >
              {fmt(market.yes_bid)} / {fmt(market.yes_ask)}
            </div>
          )}
        </div>
        <div>
          <div
            style={{
              color: theme.colors.textDim,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 2,
            }}
          >
            No
          </div>
          <div
            style={{
              color: theme.colors.red,
              fontSize: 18,
              fontWeight: 700,
              fontFamily: theme.fonts.mono,
            }}
          >
            {pct(bestNo)}
          </div>
          {market.no_bid != null && (
            <div
              style={{
                color: theme.colors.textDim,
                fontSize: 10,
                fontFamily: theme.fonts.mono,
              }}
            >
              {fmt(market.no_bid)} / {fmt(market.no_ask)}
            </div>
          )}
        </div>
      </div>
      <div>
        <div
          style={{
            color: theme.colors.textDim,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 2,
          }}
        >
          Volume
        </div>
        <div
          style={{
            color: theme.colors.text,
            fontSize: 14,
            fontFamily: theme.fonts.mono,
          }}
        >
          {fmtVol(market.volume)}
        </div>
        <div
          style={{
            color: theme.colors.textDim,
            fontSize: 10,
            fontFamily: theme.fonts.mono,
          }}
        >
          {fmtVol(market.volume_24h)} 24h
        </div>
      </div>
    </div>
  );
}
