import { useState, useEffect } from "react";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import { getAllMarkets } from "./api/markets";
import { theme } from "./theme";

function App() {
  const [games, setGames] = useState([]);
  const [dataSource, setDataSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllMarkets().then(({ games: g, source }) => {
      setGames(g);
      setDataSource(source);
      setLoading(false);
    });
  }, []);

  const sorted = [...games].sort((a, b) => {
    const volA = (a.volume?.kalshi ?? 0) + (a.volume?.polymarket ?? 0);
    const volB = (b.volume?.kalshi ?? 0) + (b.volume?.polymarket ?? 0);
    return volB - volA;
  });

  const filtered = sorted.filter((g) => {
    const q = search.toLowerCase();
    return (
      g.home.name.toLowerCase().includes(q) ||
      g.away.name.toLowerCase().includes(q) ||
      g.home.abbr.toLowerCase().includes(q) ||
      g.away.abbr.toLowerCase().includes(q)
    );
  });

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
        {/* Source badge */}
        {dataSource && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 16,
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background:
                dataSource === "live"
                  ? `${theme.colors.green}15`
                  : `${theme.colors.warning}15`,
              color:
                dataSource === "live"
                  ? theme.colors.green
                  : theme.colors.warning,
              border: `1px solid ${
                dataSource === "live"
                  ? `${theme.colors.green}30`
                  : `${theme.colors.warning}30`
              }`,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background:
                  dataSource === "live"
                    ? theme.colors.green
                    : theme.colors.warning,
              }}
            />
            {dataSource === "live" ? "Live data" : "Mock data — backend offline"}
          </div>
        )}

        {/* Search */}
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
            placeholder="Search teams… (e.g. Celtics, LAL, Thunder)"
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
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Game list */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: theme.colors.textDim,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
            <p style={{ fontSize: 14 }}>Loading markets…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: theme.colors.textDim,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏀</div>
            <p style={{ fontSize: 14 }}>
              {search
                ? `No games matching "${search}"`
                : "No games available right now"}
            </p>
          </div>
        ) : (
          filtered.map((game) => <GameCard key={game.game_id} game={game} />)
        )}
      </div>
    </div>
  );
}

export default App;
