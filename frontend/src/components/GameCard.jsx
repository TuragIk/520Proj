import { theme } from "../theme";
import { fmtDate, fmtTime, fmtVol } from "../utils/formatters";
import MarketRow from "./MarketRow";

export default function GameCard({ game }) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 14,
        padding: 20,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 600,
              color: theme.colors.text,
              fontFamily: theme.fonts.body,
            }}
          >
            <span style={{ color: game.team_a.color }}>{game.team_a.abbr}</span>
            <span
              style={{
                color: theme.colors.textDim,
                margin: "0 8px",
                fontWeight: 400,
              }}
            >
              vs
            </span>
            <span style={{ color: game.team_b.color }}>{game.team_b.abbr}</span>
          </h3>
          <p
            style={{
              margin: "4px 0 0",
              color: theme.colors.textDim,
              fontSize: 12,
              fontFamily: theme.fonts.body,
            }}
          >
            {fmtDate(game.date)} · {fmtTime(game.date)} · Total Volume:{" "}
            <span style={{ color: theme.colors.accent, fontFamily: theme.fonts.mono }}>
              {fmtVol(game.markets.reduce((sum, m) => sum + m.volume, 0))}
            </span>
          </p>
        </div>
        {game.arbitrage.exists && (
          <div
            style={{
              background: theme.colors.arbitrageBg,
              border: `1px solid ${theme.colors.arbitrageBorder}`,
              borderRadius: 8,
              padding: "5px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 13 }}>✦</span>
            <span
              style={{
                color: theme.colors.arbitrage,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              ARBITRAGE
            </span>
          </div>
        )}
      </div>

      {game.markets.map((m, i) => (
        <MarketRow key={i} market={m} />
      ))}

      {game.arbitrage.exists && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 8,
            background: theme.colors.arbitrageBg,
            border: `1px solid ${theme.colors.arbitrageBorder}`,
          }}
        >
          <p
            style={{
              margin: 0,
              color: theme.colors.arbitrage,
              fontSize: 12,
              lineHeight: 1.5,
              fontFamily: theme.fonts.body,
            }}
          >
            {game.arbitrage.description}
          </p>
        </div>
      )}
    </div>
  );
}
