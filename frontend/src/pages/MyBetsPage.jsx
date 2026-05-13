import { useState } from "react";
import { theme } from "../theme";
import { fmtTime, fmtDate } from "../utils/formatters";
import PlatformBadge from "../components/PlatformBadge";
import { updateLimits } from "../api/bets";

export default function MyBetsPage({ bets, limits, user, onLoginClick, onLimitsUpdated }) {
  const openBets = bets.filter((b) => b.status === "open");

  if (!user) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: theme.colors.text, fontFamily: theme.fonts.body }}>
          My Bets
        </h2>
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
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <p style={{ fontSize: 14, margin: "0 0 20px" }}>Sign in to view your bet history and daily stats.</p>
          <button
            onClick={onLoginClick}
            style={{
              background: theme.colors.accent,
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              color: "#000",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: theme.fonts.body,
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

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

      {/* User-editable daily limits */}
      <LimitSettings limits={limits} onUpdated={onLimitsUpdated} />

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

function LimitSettings({ limits, onUpdated }) {
  const [maxBets, setMaxBets] = useState(limits.max_bets_per_day);
  const [maxSpend, setMaxSpend] = useState(limits.max_daily_amount);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    const result = await updateLimits({
      max_bets_per_day: parseInt(maxBets),
      max_daily_spend: parseFloat(maxSpend),
    });
    if (result.ok) {
      onUpdated(result.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError("Failed to save — are you logged in?");
    }
  }

  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 24,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: theme.colors.text, fontFamily: theme.fonts.body, marginBottom: 14 }}>
        Daily Limits
      </div>
      <form onSubmit={handleSave} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: theme.colors.textDim, fontFamily: theme.fonts.body }}>
          Max bets / day
          <input
            type="number"
            min="1"
            value={maxBets}
            onChange={(e) => setMaxBets(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, background: theme.colors.bg, color: theme.colors.text, fontSize: 14, fontFamily: theme.fonts.mono, width: 90 }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: theme.colors.textDim, fontFamily: theme.fonts.body }}>
          Max spend / day ($)
          <input
            type="number"
            min="1"
            step="0.01"
            value={maxSpend}
            onChange={(e) => setMaxSpend(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, background: theme.colors.bg, color: theme.colors.text, fontSize: 14, fontFamily: theme.fonts.mono, width: 110 }}
          />
        </label>
        <button
          type="submit"
          style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: theme.colors.accent, color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: theme.fonts.body }}
        >
          {saved ? "Saved!" : "Save"}
        </button>
      </form>
      {error && <p style={{ margin: "8px 0 0", fontSize: 12, color: theme.colors.red, fontFamily: theme.fonts.body }}>{error}</p>}
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
  const isToday = new Date(bet.placed_at).toDateString() === new Date().toDateString();
  const displayStatus = bet.status === "open" && !isToday ? "closed" : bet.status;
  const statusColor =
    displayStatus === "won"
      ? theme.colors.green
      : displayStatus === "lost" || displayStatus === "closed"
      ? theme.colors.red
      : theme.colors.green;

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
        {displayStatus}
      </div>
    </div>
  );
}
