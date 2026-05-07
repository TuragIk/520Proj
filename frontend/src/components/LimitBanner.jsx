// Shown on the home page when the user has hit their daily bet or spending limit.
// isAtLimit() is exported so BetModal and App can check the same condition without
// duplicating the logic.

import { theme } from "../theme";

export function isAtLimit(limits) {
  return (
    limits.bets_today >= limits.max_bets_per_day ||
    limits.amount_today >= limits.max_daily_amount
  );
}

export default function LimitBanner({ limits }) {
  const betLimitHit = limits.bets_today >= limits.max_bets_per_day;
  const amountLimitHit = limits.amount_today >= limits.max_daily_amount;

  const reason = betLimitHit && amountLimitHit
    ? "You've reached your daily bet and spending limits."
    : betLimitHit
    ? `You've placed ${limits.max_bets_per_day} bets today — your daily limit.`
    : `You've spent $${limits.amount_today.toFixed(2)} today — your daily limit.`;

  return (
    <div
      style={{
        background: `${theme.colors.warning}12`,
        border: `1px solid ${theme.colors.warning}40`,
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: theme.colors.warning,
              fontFamily: theme.fonts.body,
              marginBottom: 4,
            }}
          >
            Daily limit reached — bet logging is paused until tomorrow
          </div>
          <div
            style={{
              fontSize: 13,
              color: theme.colors.textDim,
              fontFamily: theme.fonts.body,
              marginBottom: 14,
            }}
          >
            {reason} If gambling feels out of control, free help is available now.
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <ResourceChip label="📞 Gambling Helpline" detail="1-800-522-4700" />
            <ResourceChip label="💬 Crisis Text Line" detail="Text HOME to 741741" />
            <ResourceChip label="🏫 Five College Counseling" detail="speak with your college counselor" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceChip({ label, detail }) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        fontFamily: theme.fonts.body,
      }}
    >
      <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ color: theme.colors.textDim }}>{detail}</div>
    </div>
  );
}
