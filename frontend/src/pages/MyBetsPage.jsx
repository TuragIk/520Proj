import { theme } from "../theme";
import { fmtTime, fmtDate } from "../utils/formatters";
import PlatformBadge from "../components/PlatformBadge";

export default function MyBetsPage({ bets, limits }) {
  const openBets = bets.filter((b) => b.status === "open");
  const todayBets = bets.filter((b) => {
    return new Date(b.placed_at).toDateString() === new Date().toDateString();
  });

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
      <h2
        style={{
          margin: "0 0 20px",
          fontSize: 20,
          fontWeight: 700,
          color: theme.colors.text,
          fontFamily: theme.fonts.body,
        }}
      >
        My Bets
      </h2>

      {/* Daily stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Bets Today"
          value={`${limits.bets_today} / ${limits.max_bets_per_day}`}
          warning={limits.bets_today >= limits.max_bets_per_day}
        />
        <StatCard
          label="Spent Today"
          value={`$${limits.amount_today.toFixed(2)} / $${limits.max_daily_amount.toFixed(0)}`}
          warning={limits.amount_today >= limits.max_daily_amount}
        />
        <StatCard
          label="Open Bets"
          value={openBets.length}
        />
      </div>

      {/* Bet list */}
      {bets.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: theme.colors.textDim,
            background: theme.colors.surface,
            borderRadius: 14,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <p style={{ fontSize: 14, margin: 0 }}>
            No bets logged yet. Click a game to log one.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {bets.map((bet, i) => (
            <BetRow key={bet.id} bet={bet} last={i === bets.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, warning }) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${warning ? theme.colors.warningBorder : theme.colors.border}`,
        borderRadius: 12,
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: warning ? theme.colors.warning : theme.colors.textDim,
          fontFamily: theme.fonts.body,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: warning ? theme.colors.warning : theme.colors.text,
          fontFamily: theme.fonts.mono,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function BetRow({ bet, last }) {
  const statusColor =
    bet.status === "won"
      ? theme.colors.green
      : bet.status === "lost"
      ? theme.colors.red
      : theme.colors.textMuted;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr auto auto",
        alignItems: "center",
        gap: 16,
        padding: "14px 20px",
        borderBottom: last ? "none" : `1px solid ${theme.colors.border}`,
      }}
    >
      <PlatformBadge platform={bet.platform} />

      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
          }}
        >
          {bet.event_name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: theme.colors.textDim,
            fontFamily: theme.fonts.body,
            marginTop: 2,
          }}
        >
          {bet.team_name} wins · {fmtDate(bet.placed_at)} {fmtTime(bet.placed_at)}
        </div>
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: theme.colors.text,
          fontFamily: theme.fonts.mono,
          textAlign: "right",
        }}
      >
        ${bet.amount.toFixed(2)}
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: statusColor,
          fontFamily: theme.fonts.body,
          minWidth: 40,
          textAlign: "right",
        }}
      >
        {bet.status}
      </div>
    </div>
  );
}
