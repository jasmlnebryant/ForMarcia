// Login.jsx — Marcia's one-time setup screen

export default function Login() {
  return (
    <div className="page center" style={{ gap: 32 }}>
      <div style={{ fontSize: 72 }}>🛒</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1>For Marcia</h1>
        <p>Your kitchen, always organized.</p>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <button className="btn btn-primary">Get Started</button>
      </div>
    </div>
  );
}
