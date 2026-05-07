# Frontend

React + Vite frontend for Dynamite Gambling. Displays live NBA odds aggregated from Kalshi and Polymarket, lets users compare markets, log placed bets, and enforces daily safety limits.

## Prerequisites

- Node.js 18+

## Setup

```bash
# From the frontend/ directory
npm install
```

## Running

```bash
npm run dev
```

The app opens at `http://localhost:<port>` (Vite picks the port automatically, usually 5173 or 5174).

## Building for Production

```bash
npm run build
```

Output is written to `dist/`.

---

## Features

| Feature | Status |
|---|---|
| Live odds from Kalshi + Polymarket (side-by-side) | ✅ |
| Arbitrage opportunity detection and display | ✅ |
| Game search by team name or abbreviation | ✅ |
| Bet modal with platform links and bet logging | ✅ |
| My Bets page — history, daily stats | ✅ |
| Daily limit enforcement (5 bets / $50) | ✅ |
| Frequency warning banner + gambling resources | ✅ |
| User login / logout (JWT, with offline mock) | ✅ |
| Mock data fallback when backend is offline | ✅ |

---

## Project Structure

```
src/
├── api/
│   ├── auth.js       # Login/logout; persists JWT in localStorage; mock fallback when offline
│   ├── bets.js       # localStorage bet storage; daily limit tracking with midnight reset
│   └── markets.js    # Fetches GET /markets; falls back to mock data on timeout/error
├── components/
│   ├── BetModal.jsx      # Game click modal: platform links + gated bet logging form
│   ├── GameCard.jsx      # Clickable card showing odds, volume, and arbitrage badge
│   ├── Header.jsx        # Sticky nav: Markets/My Bets tabs + auth controls
│   ├── LimitBanner.jsx   # Warning banner shown when daily limit is reached
│   ├── LoginModal.jsx    # Full-screen login overlay
│   ├── MarketRow.jsx     # Single platform row inside a GameCard (odds + volume)
│   └── PlatformBadge.jsx # Colored "Kalshi" / "Polymarket" pill badge
├── data/
│   ├── mockData.js   # Mock games and bets matching NormalizedGame shape; dates are relative
│   └── teamData.js   # NBA team color map keyed by 3-letter abbreviation
├── pages/
│   └── MyBetsPage.jsx  # Bet history + daily stats; shows login prompt if signed out
├── utils/
│   └── formatters.js   # pct(), fmtVol(), fmtDate(), fmtTime()
├── App.jsx    # Root component; owns all state, renders Header + active page + modals
└── theme.js   # Design tokens (colors, fonts)
```

---

## Backend Connection

The frontend consumes `GET http://localhost:8000/markets`. If the backend is unreachable or takes more than 3 seconds to respond, the app falls back to mock data automatically — a "Mock data — backend offline" badge appears at the top of the page.

See [backend/README.md](../backend/README.md) for backend setup.

---

## Authentication

Login hits `POST /auth/localhost:8000/auth/login`. When the backend is offline, **any non-empty username and password will work** — the app stores a mock token and proceeds normally. This allows the full auth flow to be demoed without the server.

To sign in during a demo: use any credentials, e.g. `admin` / `admin`.

---

## localStorage Keys

The app stores state in the browser. You can inspect or reset these via the browser console.

| Key | Contents |
|---|---|
| `dg_bets` | JSON array of all logged bets |
| `dg_limits` | Today's running totals (bets placed, amount spent) + the date they belong to |
| `dg_token` | JWT token (or `"mock-token"` when offline) |
| `dg_user` | JSON object `{ username }` for the logged-in user |

**Reset everything for a clean demo:**
```js
localStorage.removeItem('dg_bets')
localStorage.removeItem('dg_limits')
localStorage.removeItem('dg_token')
localStorage.removeItem('dg_user')
```

**Simulate hitting the daily limit:**
```js
localStorage.setItem('dg_limits', JSON.stringify({
  date: new Date().toDateString(),
  bets_today: 5, amount_today: 50,
  max_bets_per_day: 5, max_daily_amount: 50
}))
```
