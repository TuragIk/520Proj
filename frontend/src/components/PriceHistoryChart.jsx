import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { theme } from "../theme";
import { fetchPriceHistory } from "../api/markets";

// Four series: each team × each platform, distinguished by color and dash style
function seriesConfig(home, away) {
  return [
    { key: `kalshi_home`,      label: `Kalshi · ${home.abbr}`,      stroke: theme.colors.kalshi,      dash: "0" },
    { key: `kalshi_away`,      label: `Kalshi · ${away.abbr}`,      stroke: theme.colors.kalshi,      dash: "4 3" },
    { key: `polymarket_home`,  label: `Polymarket · ${home.abbr}`,  stroke: theme.colors.polymarket,  dash: "0" },
    { key: `polymarket_away`,  label: `Polymarket · ${away.abbr}`,  stroke: theme.colors.polymarket,  dash: "4 3" },
  ];
}

export default function PriceHistoryChart({ gameId, home, away }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchPriceHistory(gameId).then(({ history }) => {
      if (!history.length) { setChartData([]); return; }

      const byTime = {};
      for (const row of history) {
        const t = row.recorded_at?.slice(11, 16) ?? "?";
        if (!byTime[t]) byTime[t] = { time: t };
        const key = `${row.platform}_${row.side}`;
        byTime[t][key] = row.odds;
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

  const series = seriesConfig(home, away);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: theme.colors.textDim }} />
        <YAxis
          domain={[0, 1]}
          tickFormatter={(v) => `${Math.round(v * 100)}%`}
          tick={{ fontSize: 10, fill: theme.colors.textDim }}
          width={36}
        />
        <Tooltip
          formatter={(v, name) => [`${(v * 100).toFixed(1)}%`, name]}
          contentStyle={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 10, fontFamily: theme.fonts.body }} />
        {series.map(({ key, label, stroke, dash }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={label}
            stroke={stroke}
            strokeWidth={2}
            strokeDasharray={dash}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}