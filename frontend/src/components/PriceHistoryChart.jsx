import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { theme } from "../theme";
import { fetchPriceHistory } from "../api/markets";

export default function PriceHistoryChart({ gameId }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchPriceHistory(gameId).then(({ history }) => {
      if (!history.length) { setChartData([]); return; }

      const byTime = {};
      for (const row of history) {
        const t = row.recorded_at?.slice(11, 16) ?? "?";
        if (!byTime[t]) byTime[t] = { time: t };
        const cur = byTime[t][row.platform];
        byTime[t][row.platform] = cur == null ? row.odds : Math.max(cur, row.odds);
      }
      setChartData(
        Object.values(byTime).sort((a, b) => a.time.localeCompare(b.time))
      );
    });
  }, [gameId]);

  if (chartData === null) {
    return (
      <div style={{ fontSize: 12, color: theme.colors.textDim, fontFamily: theme.fonts.body, padding: "8px 0" }}>
        Loading history...
      </div>
    );
  }
  if (chartData.length === 0) {
    return (
      <div style={{ fontSize: 12, color: theme.colors.textDim, fontFamily: theme.fonts.body, padding: "8px 0" }}>
        No history available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: theme.colors.textDim }} />
        <YAxis
          domain={[0, 1]}
          tickFormatter={(v) => `${Math.round(v * 100)}%`}
          tick={{ fontSize: 10, fill: theme.colors.textDim }}
          width={36}
        />
        <Tooltip
          formatter={(v) => `${(v * 100).toFixed(1)}%`}
          contentStyle={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: theme.fonts.body }} />
        <Line type="monotone" dataKey="kalshi" stroke={theme.colors.kalshi} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="polymarket" stroke={theme.colors.polymarket} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}