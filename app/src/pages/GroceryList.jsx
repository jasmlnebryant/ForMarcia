export default function GroceryList() {
  const pending = [
    { id: 1, from: "Jasmine", item: "Orange juice" },
    { id: 2, from: "Dad", item: "Paper towels" },
  ];

  const confirmed = [
    { id: 3, item: "Eggs" },
    { id: 4, item: "Butter" },
    { id: 5, item: "Bread" },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Grocery List</h1>
      </div>

      <div className="page" style={{ paddingTop: 16 }}>

        {/* Pending family requests */}
        {pending.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="section-label">Requests</span>
              <span className="badge">{pending.length}</span>
            </div>
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {pending.map((req) => (
                <div key={req.id} className="card-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{req.item}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>from {req.from}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary btn-sm">✓ Add</button>
                    <button className="btn btn-ghost btn-sm">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed grocery list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span className="section-label">Your List</span>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {confirmed.map((item) => (
              <div key={item.id} className="card-row">
                <div style={{ flex: 1, fontWeight: 500 }}>{item.item}</div>
                <button className="btn btn-ghost btn-sm">✕</button>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary">+ Add Item</button>

      </div>
    </>
  );
}
