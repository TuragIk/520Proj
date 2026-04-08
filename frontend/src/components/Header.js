import { theme } from "../theme";

export default function Header() {
  return (
    <div
      style={{
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: "16px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(17,24,39,0.8)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 24 }}>🎲</span>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: theme.colors.accent,
              fontFamily: theme.fonts.body,
              letterSpacing: "-0.02em",
            }}
          >
            Dynamite Gambling
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: theme.colors.textDim,
              fontFamily: theme.fonts.body,
            }}
          >
            Prediction Market Aggregator
          </p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            padding: "4px 12px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            background: `${theme.colors.green}15`,
            color: theme.colors.green,
            border: `1px solid ${theme.colors.green}30`,
            fontFamily: theme.fonts.body,
          }}
        >
          🏀 NBA
        </div>
      </div>
    </div>
  );
}
