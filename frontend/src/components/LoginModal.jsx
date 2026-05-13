import { useState } from "react";
import { theme } from "../theme";
import { login, register } from "../api/auth";

export default function LoginModal({ onLogin, onClose }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError(null);
    setUsername("");
    setPassword("");
    setConfirm("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (mode === "register" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const result = mode === "login"
      ? await login(username, password)
      : await register(username, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onLogin(result.user);
  }

  const isLogin = mode === "login";

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
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: theme.colors.text, fontFamily: theme.fonts.body }}>
            {isLogin ? "Sign In" : "Create Account"}
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
            placeholder="Email"
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

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(null); }}
              style={inputStyle}
            />
          )}

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
            {loading
              ? (isLogin ? "Signing in…" : "Creating account…")
              : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: theme.colors.textDim, fontFamily: theme.fonts.body }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          {" "}
          <button
            onClick={() => switchMode(isLogin ? "register" : "login")}
            style={{
              background: "none",
              border: "none",
              color: theme.colors.accent,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: theme.fonts.body,
              padding: 0,
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
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