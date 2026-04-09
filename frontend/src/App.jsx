import { useState } from "react";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import { MOCK_GAMES } from "./data/mockData";
import { theme } from "./theme";

function App() {
  const [search, setSearch] = useState("");

  const sorted = [...MOCK_GAMES].sort((a, b) => {
    const totalA = a.markets.reduce((sum, m) => sum + m.volume, 0);
    const totalB = b.markets.reduce((sum, m) => sum + m.volume, 0);
    return totalB - totalA;
  });

  const filtered = sorted.filter(
    (g) =>
      g.event_name.toLowerCase().includes(search.toLowerCase()) ||
      g.team_a.name.toLowerCase().includes(search.toLowerCase()) ||
      g.team_b.name.toLowerCase().includes(search.toLowerCase()) ||
      g.team_a.abbr.toLowerCase().includes(search.toLowerCase()) ||
      g.team_b.abbr.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.colors.bg,
        fontFamily: theme.fonts.body,
      }}
    >
      <Header />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ position: "relative", marginBottom: 20 }}>
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.colors.textDim,
              fontSize: 16,
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search NBA games... (e.g. Celtics, LAL, Warriors)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px 12px 42px",
              borderRadius: 10,
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.surface,
              color: theme.colors.text,
              fontSize: 14,
              fontFamily: theme.fonts.body,
              outline: "none",
            }}
          />
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: theme.colors.textDim,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏀</div>
            <p style={{ fontSize: 14 }}>No games found matching "{search}"</p>
          </div>
        ) : (
          filtered.map((game) => <GameCard key={game.id} game={game} />)
        )}
      </div>
    </div>
  );
}

export default App;
