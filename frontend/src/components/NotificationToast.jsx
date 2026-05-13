import { useEffect } from "react";
import { theme } from "../theme";

export default function NotificationToast({ notifications, onDismiss }) {
  useEffect(() => {
    if (!notifications.length) return;
    const id = notifications[0].id;
    const timer = setTimeout(() => onDismiss(id), 5000);
    return () => clearTimeout(timer);
  }, [notifications, onDismiss]);

  if (!notifications.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 340,
      }}
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.accent}50`,
            borderLeft: `3px solid ${theme.colors.accent}`,
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.colors.accent, fontFamily: theme.fonts.body, marginBottom: 3 }}>
              Price Alert
            </div>
            <div style={{ fontSize: 12, color: theme.colors.text, fontFamily: theme.fonts.body, lineHeight: 1.4 }}>
              {n.message}
            </div>
          </div>
          <button
            onClick={() => onDismiss(n.id)}
            style={{ background: "none", border: "none", color: theme.colors.textDim, fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1, flexShrink: 0 }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
