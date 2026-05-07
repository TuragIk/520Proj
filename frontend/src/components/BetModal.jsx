import { useState } from "react";
import { theme } from "../theme";
import { fmtDate, fmtTime, pct } from "../utils/formatters";
import PlatformBadge from "./PlatformBadge";
import { addBet, getLimits } from "../api/bets";

function platformUrl(platform) {
  if (platform === "kalshi") return "https://kalshi.com/markets/kxnbagame";
  return "https://polymarket.com/sports/basketball";
}

export default function BetModal({ game, onClose, onBetLogged }) {
  const [platform, setPlatform] = useState("kalshi");
  const [team, setTeam] = useState(game.home.abbr);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const selectedTeam = team === game.home.abbr ? game.home : game.away;
  const priceAtEntry = selectedTeam.odds[platform];

  function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    const result = addBet({
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
          ? "Daily bet limit reached (5 bets/day)."
          : "Daily amount limit reached ($50/day)."
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
          maxWidth: 480,
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

        {/* Log a bet form */}
        <p style={{ margin: "0 0 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.colors.textDim, fontFamily: theme.fonts.body }}>
          Log a Bet
        </p>

        {success ? (
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
      </div>
    </div>
  );
}
