import { useState } from "react";
import { theme } from "../theme";
import { fmtDate, fmtTime, pct } from "../utils/formatters";
import PlatformBadge from "./PlatformBadge";
import { addBet, getLimits } from "../api/bets";
import { isAtLimit } from "./LimitBanner";
import PriceHistoryChart from "./PriceHistoryChart";
import { isWatched, addWatch, removeWatch } from "../api/watchlist";

function platformUrl(platform) {
  if (platform === "kalshi") return "https://kalshi.com/markets/kxnbagame";
  return "https://polymarket.com/sports/basketball";
}

export default function BetModal({ game, limits, user, onClose, onBetLogged, onLoginClick }) {
  const [platform, setPlatform] = useState("kalshi");
  const [team, setTeam] = useState(game.home.abbr);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [watched, setWatched] = useState(() => isWatched(game.game_id));
  const [threshold, setThreshold] = useState("10");

  const selectedTeam = team === game.home.abbr ? game.home : game.away;
  const priceAtEntry = selectedTeam.odds[platform];
  const locked = isAtLimit(limits);

  async function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    const result = await addBet({
      game_id: game.game_id,
      event_name: `${game.away.abbr} @ ${game.home.abbr}`,
      platform,
      team,
      team_name: selectedTeam.name,
      amount: amt,
      price_at_entry: priceAtEntry ?? null,
    });

    if (!result.ok) {
      setError(
        result.reason === "daily_bet_limit"
          ? `Daily bet limit reached (${limits.max_bets_per_day} bets/day).`
          : `Daily amount limit reached ($${limits.max_daily_amount.toFixed(0)}/day).`
      );
      return;
    }

    setSuccess(true);
    onBetLogged(result.limits);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: 16,
          padding: 28,
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: theme.colors.text, fontFamily: theme.fonts.body }}>
              <span style={{ color: game.away.color }}>{game.away.abbr}</span>
              <span style={{ color: theme.colors.textDim, margin: "0 8px", fontWeight: 400 }}>@</span>
              <span style={{ color: game.home.color }}>{game.home.abbr}</span>
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: theme.colors.textDim, fontFamily: theme.fonts.body }}>
              {fmtDate(game.game_time)} · {fmtTime(game.game_time)}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: theme.colors.textDim, fontSize: 20, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Platform links */}
        <p style={{ margin: "0 0 10px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.colors.textDim, fontFamily: theme.fonts.body }}>
          Open Market
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {["kalshi", "polymarket"].map((p) => (
            <a
              key={p}
              href={platformUrl(p)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: 10,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.bg,
                textDecoration: "none",
                color: theme.colors.text,
                fontSize: 13,
                fontFamily: theme.fonts.body,
              }}
            >
              <PlatformBadge platform={p} />
              <span style={{ color: theme.colors.textDim, fontSize: 12 }}>Open →</span>
            </a>
          ))}
        </div>

        {/* Odds history chart */}
        <p style={{ margin: "0 0 10px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.colors.textDim, fontFamily: theme.fonts.body }}>
          Win Probability Over Time
        </p>
        <div style={{ marginBottom: 24 }}>
          <PriceHistoryChart gameId={game.game_id} home={game.home} away={game.away} />
        </div>

        {/* Log a bet / lockout */}
        <p style={{ margin: "0 0 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.colors.textDim, fontFamily: theme.fonts.body }}>
          Log a Bet
        </p>

        {!user ? (
          <div
            style={{
              padding: "16px 18px",
              borderRadius: 10,
              background: `${theme.colors.accent}0a`,
              border: `1px solid ${theme.colors.accent}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, color: theme.colors.textDim, fontFamily: theme.fonts.body }}>
              Sign in to log bets and track your history.
            </span>
            <button
              onClick={onLoginClick}
              style={{
                background: theme.colors.accent,
                border: "none",
                borderRadius: 6,
                padding: "7px 14px",
                color: "#000",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: theme.fonts.body,
                flexShrink: 0,
              }}
            >
              Sign In
            </button>
          </div>
        ) : locked ? (
          <div
            style={{
              background: `${theme.colors.warning}10`,
              border: `1px solid ${theme.colors.warning}35`,
              borderRadius: 10,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.colors.warning, fontFamily: theme.fonts.body, marginBottom: 6 }}>
              ⚠️ Daily limit reached — logging paused until tomorrow
            </div>
            <div style={{ fontSize: 12, color: theme.colors.textDim, fontFamily: theme.fonts.body, marginBottom: 14 }}>
              You can still view markets and open them directly on Kalshi or Polymarket above.
              If gambling is feeling out of control, free help is available:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <HelpLine label="📞 National Helpline" detail="1-800-522-4700 (call or text, 24/7)" />
              <HelpLine label="💬 Crisis Text Line" detail="Text HOME to 741741" />
              <HelpLine label="🏫 Five College Counseling" detail="Contact your college counseling center" />
            </div>
          </div>
        ) : success ? (
          <div style={{ padding: "14px 16px", borderRadius: 10, background: `${theme.colors.green}15`, border: `1px solid ${theme.colors.green}30`, color: theme.colors.green, fontSize: 13, fontFamily: theme.fonts.body }}>
            Bet logged successfully.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Platform select */}
            <div style={{ display: "flex", gap: 8 }}>
              {["kalshi", "polymarket"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 8,
                    border: `1px solid ${platform === p ? (p === "kalshi" ? theme.colors.kalshi : theme.colors.polymarket) : theme.colors.border}`,
                    background: platform === p ? (p === "kalshi" ? theme.colors.kalshiBg : theme.colors.polymarketBg) : "transparent",
                    color: platform === p ? (p === "kalshi" ? theme.colors.kalshi : theme.colors.polymarket) : theme.colors.textDim,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: theme.fonts.body,
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            {/* Team select */}
            <div style={{ display: "flex", gap: 8 }}>
              {[game.away, game.home].map((t) => (
                <button
                  key={t.abbr}
                  type="button"
                  onClick={() => setTeam(t.abbr)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 8,
                    border: `1px solid ${team === t.abbr ? t.color : theme.colors.border}`,
                    background: team === t.abbr ? `${t.color}18` : "transparent",
                    color: team === t.abbr ? t.color : theme.colors.textDim,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: theme.fonts.body,
                  }}
                >
                  {t.abbr} {priceAtEntry != null && team === t.abbr ? `· ${pct(priceAtEntry)}` : ""}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: theme.colors.textDim, fontSize: 14 }}>$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Amount"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(null); }}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 26px",
                  borderRadius: 8,
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.bg,
                  color: theme.colors.text,
                  fontSize: 14,
                  fontFamily: theme.fonts.mono,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <p style={{ margin: 0, fontSize: 12, color: theme.colors.red, fontFamily: theme.fonts.body }}>{error}</p>
            )}

            <button
              type="submit"
              style={{
                padding: "11px 0",
                borderRadius: 8,
                border: "none",
                background: theme.colors.accent,
                color: "#000",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: theme.fonts.body,
              }}
            >
              Log Bet
            </button>
          </form>
        )}
        {/* Watch section */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${theme.colors.border}` }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.colors.textDim, fontFamily: theme.fonts.body }}>
            Price Alert
          </p>
          {watched ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, background: `${theme.colors.accent}0d`, border: `1px solid ${theme.colors.accent}30` }}>
              <span style={{ fontSize: 12, color: theme.colors.accent, fontFamily: theme.fonts.body, fontWeight: 600 }}>
                Watching · alerts at ≥{threshold}% move
              </span>
              <button
                onClick={() => { removeWatch(game.game_id); setWatched(false); }}
                style={{ background: "none", border: "none", color: theme.colors.textDim, fontSize: 12, cursor: "pointer", fontFamily: theme.fonts.body, padding: 0 }}
              >
                Unwatch
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 28px 9px 12px",
                    borderRadius: 8,
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.bg,
                    color: theme.colors.text,
                    fontSize: 13,
                    fontFamily: theme.fonts.mono,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: theme.colors.textDim, fontSize: 12 }}>%</span>
              </div>
              <button
                onClick={() => { addWatch(game, threshold); setWatched(true); }}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: `1px solid ${theme.colors.accent}`,
                  background: "transparent",
                  color: theme.colors.accent,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: theme.fonts.body,
                  whiteSpace: "nowrap",
                }}
              >
                Watch
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HelpLine({ label, detail }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "7px 10px",
        borderRadius: 6,
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.border}`,
        fontSize: 12,
        fontFamily: theme.fonts.body,
      }}
    >
      <span style={{ fontWeight: 600, color: theme.colors.text }}>{label}</span>
      <span style={{ color: theme.colors.textDim }}>{detail}</span>
    </div>
  );
}