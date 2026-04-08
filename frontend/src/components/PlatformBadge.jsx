import { theme } from "../theme";

export default function PlatformBadge({ platform }) {
  const isKalshi = platform === "kalshi";
  const color = isKalshi ? theme.colors.kalshi : theme.colors.polymarket;
  const bg = isKalshi ? theme.colors.kalshiBg : theme.colors.polymarketBg;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        background: bg,
        color: color,
        border: `1px solid ${color}33`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
        }}
      />
      {isKalshi ? "Kalshi" : "Polymarket"}
    </span>
  );
}
