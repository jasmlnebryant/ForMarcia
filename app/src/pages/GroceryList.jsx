import { useState, useEffect } from "react";
import DogGracie from "../components/dogs/DogGracie";
import { useGrocery } from "../context/GroceryContext";
import SwipeableRow from "../components/SwipeableRow";

export default function GroceryList() {
  const {
    pending,
    confirmed,
    dismissing,
    acceptRequest,
    dismissRequest,
    removeConfirmed,
    clearConfirmed,
    addItems,
  } = useGrocery();

  const [showAddModal,    setShowAddModal]    = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [newItems, setNewItems]               = useState([{ item: "", qty: "" }]);
  const [vvHeight, setVvHeight]               = useState(() => window.visualViewport?.height ?? window.innerHeight);

  // Lift sheet above keyboard when it opens
  useEffect(() => {
    if (!showAddModal) return;
    function onResize() {
      setVvHeight(window.visualViewport?.height ?? window.innerHeight);
    }
    window.visualViewport?.addEventListener("resize", onResize);
    onResize();
    return () => window.visualViewport?.removeEventListener("resize", onResize);
  }, [showAddModal]);

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
    <div style={{
      display: "flex", flexDirection: "column", width: "100%", height: "100svh", overflow: "hidden",
      background:
        "linear-gradient(rgba(253,248,242,0.92), rgba(253,248,242,0.92)), " +
        "url('/doodles-bg.jpg') center / 600px auto repeat, " +
        "var(--cream)",
    }}>
      <div className="page-header">
        <div>
          <p style={{ fontSize: 14, color: "var(--green)", marginBottom: 2 }}>Good morning!</p>
          <h1 style={{ color: "var(--green-dark)" }}>Grocery List</h1>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 16, flex: 1, overflowY: "auto", paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}>

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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="section-label green">Your List</span>
            {confirmed.length > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmingClear(true)}
                style={{ color: "var(--coral)", fontWeight: 600, padding: "4px 8px" }}
              >
                Clear All
              </button>
            )}
          </div>
            {confirmed.length > 0 && (
              <div className="card card-accent-green" style={{ display: "flex", flexDirection: "column", gap: 0, padding: 0, overflow: "hidden" }}>
                {confirmed.map((item) => (
                  <SwipeableRow key={item.id} onDelete={() => removeConfirmed(item.id)}>
                    <div className="card-row" style={{ padding: "14px 16px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{item.item}</div>
                        {(item.qty || item.from) && (
                          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                            {[item.qty ? `×${item.qty}` : null, item.from ? `from ${item.from}` : null].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </SwipeableRow>
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
            bottom: window.innerHeight - vvHeight,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 480,
            background: "var(--white)",
            borderRadius: "24px 24px 0 0",
            padding: "24px 20px 32px",
            zIndex: 101,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxHeight: vvHeight * 0.92,
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

      {confirmingClear && (
        <>
          <div onClick={() => setConfirmingClear(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", zIndex: 201,
            width: "calc(100% - 48px)", maxWidth: 320,
            background: "var(--white)", borderRadius: 24,
            padding: "24px 20px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
            display: "flex", flexDirection: "column", gap: 14, textAlign: "center",
          }}>
            <h2 style={{ fontFamily: '"Lora", Georgia, serif', fontSize: 22, fontWeight: 700 }}>Are you sure?</h2>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.5 }}>
              {`This will clear all ${confirmed.length} item${confirmed.length === 1 ? "" : "s"} from your list.`}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
              <button className="btn btn-coral" onClick={() => { clearConfirmed(); setConfirmingClear(false); }}>
                Yes, clear list
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirmingClear(false)}
                style={{ color: "var(--text-muted)", fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
