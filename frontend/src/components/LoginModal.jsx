// Full-screen overlay login form. Calls auth.login() which hits the backend
// and falls back to a mock (any credentials work) when the server is offline.
// Fires onLogin(user) on success so App can update its auth state.

import { useState } from "react";
import { theme } from "../theme";
import { login } from "../api/auth";

export default function LoginModal({ onLogin, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(username, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onLogin(result.user);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
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
          maxWidth: 380,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: theme.colors.text, fontFamily: theme.fonts.body }}>
            Sign In
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: theme.colors.textDim, fontSize: 20, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(null); }}
            autoFocus
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            style={inputStyle}
          />

          {error && (
            <p style={{ margin: 0, fontSize: 12, color: theme.colors.red, fontFamily: theme.fonts.body }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "11px 0",
              borderRadius: 8,
              border: "none",
              background: loading ? theme.colors.border : theme.colors.accent,
              color: "#000",
              fontSize: 13,
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              fontFamily: theme.fonts.body,
              marginTop: 4,
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.bg,
  color: theme.colors.text,
  fontSize: 14,
  fontFamily: theme.fonts.body,
  outline: "none",
  boxSizing: "border-box",
};
