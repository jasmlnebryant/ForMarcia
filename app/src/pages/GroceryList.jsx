import { useState } from "react";
import DogGracie from "../components/dogs/DogGracie";
import { useGrocery } from "../context/GroceryContext";

export default function GroceryList() {
  const {
    pending,
    confirmed,
    dismissing,
    acceptRequest,
    dismissRequest,
    removeConfirmed,
    addItems,
  } = useGrocery();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItems, setNewItems]         = useState([{ item: "", qty: "" }]);

  /* ── Add Item modal ── */
  function handleAddRow() {
    setNewItems(prev => [...prev, { item: "", qty: "" }]);
  }

  function handleNewItemChange(index, field, value) {
    setNewItems(prev =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function handleRemoveRow(index) {
    setNewItems(prev => prev.filter((_, i) => i !== index));
  }

  function handleSubmitItems() {
    addItems(newItems);
    setNewItems([{ item: "", qty: "" }]);
    setShowAddModal(false);
  }

  function closeModal() {
    setShowAddModal(false);
    setNewItems([{ item: "", qty: "" }]);
  }

  const isEmpty = pending.length === 0 && confirmed.length === 0;

  return (
    <>
      <div className="page-header">
        <div>
          <p style={{ fontSize: 14, color: "var(--green)", marginBottom: 2 }}>Good morning!</p>
          <h1 style={{ color: "var(--green-dark)" }}>Grocery List</h1>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 16 }}>

        {/* ── Pending requests ── */}
        {pending.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="section-label coral">Requests</span>
              <span className="badge">{pending.length}</span>
            </div>
            <div className="card card-accent-coral" style={{ display: "flex", flexDirection: "column", gap: 0, overflow: "hidden" }}>
              {pending.map((req) => (
                <div
                  key={req.id}
                  className="card-row"
                  style={{
                    maxHeight: dismissing.has(req.id) ? 0 : 100,
                    opacity:   dismissing.has(req.id) ? 0 : 1,
                    paddingTop:    dismissing.has(req.id) ? 0 : undefined,
                    paddingBottom: dismissing.has(req.id) ? 0 : undefined,
                    overflow: "hidden",
                    transition: "max-height 0.3s ease, opacity 0.25s ease, padding 0.3s ease",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{req.item}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>from {req.from}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => acceptRequest(req)}>Add</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => dismissRequest(req.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Your List ── */}
        {!isEmpty && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span className="section-label green">Your List</span>
            {confirmed.length > 0 && (
              <div className="card card-accent-green" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {confirmed.map((item) => (
                  <div key={item.id} className="card-row">
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 500 }}>{item.item}</span>
                      {item.qty && (
                        <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 8 }}>× {item.qty}</span>
                      )}
                      {item.from && (
                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>from {item.from}</div>
                      )}
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeConfirmed(item.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Empty state ── */}
        {isEmpty && (
          <div className="empty-state">
            <DogGracie size={100} />
            <h3>All clear!</h3>
            <p>Gracie checked — nothing on the list yet.</p>
          </div>
        )}

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Item</button>

      </div>

      {/* ── Add Item bottom sheet ── */}
      {showAddModal && (
        <>
          <div
            onClick={closeModal}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 100,
            }}
          />
          <div style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 480,
            background: "var(--white)",
            borderRadius: "24px 24px 0 0",
            padding: "24px 20px 44px",
            zIndex: 101,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxHeight: "85svh",
            overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Add Items</h2>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
            </div>

            <div style={{ display: "flex", gap: 8, paddingRight: 36 }}>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>Item</span>
              <span style={{ width: 64, fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", textAlign: "center" }}>Qty</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {newItems.map((row, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="e.g. Milk"
                    value={row.item}
                    onChange={e => handleNewItemChange(i, "item", e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && row.item.trim()) handleAddRow();
                    }}
                    style={{ flex: 1, padding: "12px 14px", fontSize: 16 }}
                    autoFocus={i === newItems.length - 1}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="—"
                    value={row.qty}
                    onChange={e => handleNewItemChange(i, "qty", e.target.value)}
                    style={{ width: 64, padding: "12px 10px", fontSize: 16, textAlign: "center" }}
                  />
                  {newItems.length > 1 && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveRow(i)} style={{ padding: "8px" }}>✕</button>
                  )}
                </div>
              ))}
            </div>

            <button
              className="btn btn-ghost"
              onClick={handleAddRow}
              style={{ color: "var(--green-dark)", fontWeight: 600, width: "auto", alignSelf: "flex-start", padding: "4px 0" }}
            >
              + Add another
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSubmitItems}
              disabled={!newItems.some(r => r.item.trim())}
              style={{ opacity: newItems.some(r => r.item.trim()) ? 1 : 0.4 }}
            >
              Add to List
            </button>
          </div>
        </>
      )}
    </>
  );
}
