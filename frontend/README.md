# Frontend

React + Vite frontend for Dynamite Gambling. Displays live NBA odds aggregated from Kalshi and Polymarket, lets users track placed bets, and enforces configurable safety limits.

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

The app will be available at `http://localhost:5173`.

## Building for Production

```bash
npm run build
```

Output is written to `dist/`.

## Backend Connection

The frontend consumes the backend API. Make sure the backend is running at `http://localhost:8000` before starting the dev server. The primary endpoint used is:

```
GET http://localhost:8000/markets
```

See [backend/README.md](../backend/README.md) for backend setup instructions.
