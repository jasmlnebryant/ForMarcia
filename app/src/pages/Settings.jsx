import { useState } from "react";

export default function Settings() {
  const [notifs, setNotifs] = useState({
    expiring3: true,
    expiring1: true,
    expired:   true,
    requests:  true,
  });

  function toggle(key) {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="page" style={{ paddingTop: 16 }}>

        {/* Notification settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span className="section-label">Notifications</span>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            <ToggleRow
              label="Expiring in 3 days"
              description="Heads up before items get close"
              checked={notifs.expiring3}
              onChange={() => toggle("expiring3")}
            />
            <ToggleRow
              label="Expiring tomorrow"
              description="Last chance reminder"
              checked={notifs.expiring1}
              onChange={() => toggle("expiring1")}
            />
            <ToggleRow
              label="Item expired"
              description="Alert when something has passed its date"
              checked={notifs.expired}
              onChange={() => toggle("expired")}
            />
            <ToggleRow
              label="Family requests"
              description="When someone adds a request to your list"
              checked={notifs.requests}
              onChange={() => toggle("requests")}
            />

          </div>
        </div>

        {/* Family sharing */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span className="section-label">Family Sharing</span>
          <div className="card">
            <p style={{ fontSize: 14, marginBottom: 12 }}>
              Share this link with family members so they can send you grocery requests.
            </p>
            <div style={{
              background: "var(--cream)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 14px",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--green)",
              wordBreak: "break-all",
              marginBottom: 12,
            }}>
              formarcia.web.app/request
            </div>
            <button className="btn btn-secondary">Copy Link</button>
          </div>
        </div>

      </div>
    </>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="card-row" style={{ alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{description}</div>
      </div>
      <label style={{
        position: "relative",
        display: "inline-block",
        width: 48,
        height: 28,
        flexShrink: 0,
        marginTop: 2,
      }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: checked ? "var(--green)" : "var(--border)",
          transition: "background 0.2s",
          cursor: "pointer",
        }}>
          <span style={{
            position: "absolute",
            top: 3,
            left: checked ? 23 : 3,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }} />
        </span>
      </label>
    </div>
  );
}
