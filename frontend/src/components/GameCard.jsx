import { theme } from "../theme";
import { fmtDate, fmtTime, fmtVol } from "../utils/formatters";
import MarketRow from "./MarketRow";

export default function GameCard({ game }) {
  const totalVol =
    (game.volume?.kalshi ?? 0) + (game.volume?.polymarket ?? 0);

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
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
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
            <span style={{ color: game.away.color }}>{game.away.abbr}</span>
            <span
              style={{
                color: theme.colors.textDim,
                margin: "0 8px",
                fontWeight: 400,
                fontSize: 14,
              }}
            >
              @
            </span>
            <span style={{ color: game.home.color }}>{game.home.abbr}</span>
          </h3>
          <p
            style={{
              margin: "4px 0 0",
              color: theme.colors.textDim,
              fontSize: 12,
              fontFamily: theme.fonts.body,
            }}
          >
            {game.away.name} at {game.home.name}
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: theme.colors.textMuted,
              fontSize: 12,
              fontFamily: theme.fonts.body,
            }}
          >
            {fmtDate(game.game_time)} · {fmtTime(game.game_time)}
          </div>
          {totalVol > 0 && (
            <div
              style={{
                color: theme.colors.accent,
                fontSize: 12,
                fontFamily: theme.fonts.mono,
                marginTop: 2,
              }}
            >
              {fmtVol(totalVol)} total volume
            </div>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "130px 1fr 1fr 90px",
          gap: 12,
          padding: "0 0 8px",
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div />
        <div
          style={{
            color: theme.colors.textDim,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Away
        </div>
        <div
          style={{
            color: theme.colors.textDim,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Home
        </div>
        <div
          style={{
            color: theme.colors.textDim,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Vol
        </div>
      </div>

      <MarketRow
        platform="kalshi"
        away={game.away}
        home={game.home}
        volume={game.volume}
      />
      <MarketRow
        platform="polymarket"
        away={game.away}
        home={game.home}
        volume={game.volume}
      />
    </div>
  );
}
