import { useState, useEffect } from "react";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import BetModal from "./components/BetModal";
import MyBetsPage from "./pages/MyBetsPage";
import LimitBanner, { isAtLimit } from "./components/LimitBanner";
import LoginModal from "./components/LoginModal";
import { getAllMarkets } from "./api/markets";
import { getBets, getLimits } from "./api/bets";
import { getUser, logout } from "./api/auth";
import { theme } from "./theme";

function App() {
  const [games, setGames] = useState([]);
  const [dataSource, setDataSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [limits, setLimits] = useState(() => getLimits());
  const [page, setPage] = useState("home");
  const [bets, setBets] = useState(() => getBets());
  const [user, setUser] = useState(() => getUser());
  const [showLogin, setShowLogin] = useState(false);

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setShowLogin(false);
  }

  function handleLogout() {
    logout();
    setUser(null);
  }

  useEffect(() => {
    getAllMarkets().then(({ games: g, source }) => {
      setGames(g);
      setDataSource(source);
      setLoading(false);
    });
  }, []);

  const now = Date.now();
  const upcoming = games.filter((g) => new Date(g.game_time).getTime() > now);

  const sorted = [...upcoming].sort((a, b) => {
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
      <Header
        page={page}
        onNavigate={setPage}
        betsCount={bets.length}
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />
      {page === "bets" ? (
        <MyBetsPage bets={bets} limits={limits} user={user} onLoginClick={() => setShowLogin(true)} />
      ) : (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
        {/* Limit warning */}
        {isAtLimit(limits) && <LimitBanner limits={limits} />}

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
          filtered.map((game) => (
            <GameCard key={game.game_id} game={game} onSelect={setSelectedGame} />
          ))
        )}
      </div>
      )}

      {selectedGame && (
        <BetModal
          game={selectedGame}
          limits={limits}
          user={user}
          onClose={() => setSelectedGame(null)}
          onBetLogged={(updatedLimits) => { setLimits(updatedLimits); setBets(getBets()); }}
          onLoginClick={() => { setSelectedGame(null); setShowLogin(true); }}
        />
      )}

      {showLogin && (
        <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
}

export default App;
