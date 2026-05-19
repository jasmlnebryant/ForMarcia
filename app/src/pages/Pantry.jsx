import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DogDash from "../components/dogs/DogDash";
import { usePantry } from "../context/PantryContext";
import SwipeableRow from "../components/SwipeableRow";

const TABS = ["fridge", "freezer", "pantry"];
const TAB_LABELS = { fridge: "Fridge", freezer: "Freezer", pantry: "Pantry" };
const TAB_ACCENT = { fridge: "teal", freezer: "lavender", pantry: "peach" };

const MONTHS = [
  ["1","Jan"],["2","Feb"],["3","Mar"],["4","Apr"],["5","May"],["6","Jun"],
  ["7","Jul"],["8","Aug"],["9","Sep"],["10","Oct"],["11","Nov"],["12","Dec"],
];

function getYears() {
  const y = new Date().getFullYear();
  return [y, y + 1, y + 2, y + 3].map(String);
}

function daysLeftToDate(daysLeft) {
  if (daysLeft == null) return { month: "", year: "" };
  const d = new Date();
  d.setDate(d.getDate() + daysLeft);
  return { month: String(d.getMonth() + 1), year: String(d.getFullYear()) };
}

function dateToDaysLeft(month, year) {
  if (!month || !year) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expiry = new Date(parseInt(year), parseInt(month), 0);
  return Math.max(0, Math.round((expiry - today) / (1000 * 60 * 60 * 24)));
}

function expirationClass(daysLeft) {
  if (daysLeft === null || daysLeft === undefined) return "exp-unknown";
  if (daysLeft <= 3) return "exp-urgent";
  if (daysLeft <= 7) return "exp-soon";
  return "exp-ok";
}

function expirationLabel(daysLeft) {
  if (daysLeft === null || daysLeft === undefined) return "? days left";
  if (daysLeft <= 0) return "Expired";
  if (daysLeft === 1) return "1 day left";
  if (daysLeft <= 7) return `${daysLeft} days left`;
  return `${daysLeft} days`;
}

function groupByName(items) {
  const map = new Map();
  items.forEach(item => {
    if (map.has(item.name)) {
      const g = map.get(item.name);
      g.qty += 1;
      if (g.daysLeft === null && item.daysLeft !== null) g.daysLeft = item.daysLeft;
      else if (item.daysLeft !== null && item.daysLeft < g.daysLeft) g.daysLeft = item.daysLeft;
    } else {
      map.set(item.name, { ...item, qty: 1 });
    }
  });
  return Array.from(map.values());
}

export default function Pantry() {
  const { items, removeItems, updateItem } = usePantry();
  const navigate = useNavigate();

  const [activeTab,  setActiveTab]  = useState("fridge");
  const [slideClass, setSlideClass] = useState("");
  const [animKey,    setAnimKey]    = useState(0);
  const [editing,    setEditing]    = useState(null);

  const touchStartX = useRef(null);

  function goToTab(tab, direction) {
    if (tab === activeTab) return;
    setSlideClass(direction === "next" ? "slide-from-right" : "slide-from-left");
    setAnimKey(k => k + 1);
    setActiveTab(tab);
  }

  function handleTabClick(tab) {
    const curr = TABS.indexOf(activeTab);
    const next = TABS.indexOf(tab);
    goToTab(tab, next > curr ? "next" : "prev");
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    const curr = TABS.indexOf(activeTab);
    if (delta < 0 && curr < TABS.length - 1) goToTab(TABS[curr + 1], "next");
    else if (delta > 0 && curr > 0)          goToTab(TABS[curr - 1], "prev");
  }

  const currentItems = groupByName(items[activeTab]);
  const accent = TAB_ACCENT[activeTab];

  return (
    <div style={{
      display: "flex", flexDirection: "column", width: "100%", height: "100svh", overflow: "hidden",
      background:
        "linear-gradient(rgba(253,248,242,0.92), rgba(253,248,242,0.92)), " +
        "url('/doodles-bg.jpg') center / 600px auto repeat, " +
        "var(--cream)",
    }}>
      <div className="page-header">
        <h1>Food</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/scan")}>
          + Scan
        </button>
      </div>

      <div className="tab-group" style={{ margin: "8px 20px 0" }}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => handleTabClick(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ touchAction: "pan-y", flex: 1, overflowY: "auto" }}>
        <div
          key={animKey}
          className={slideClass}
          style={{ padding: "16px 20px 100px", display: "flex", flexDirection: "column", gap: 20 }}
        >
          {currentItems.length > 0 ? (
            <div className={`card card-accent-${accent}`} style={{ display: "flex", flexDirection: "column", gap: 0, padding: 0, overflow: "hidden" }}>
              {currentItems.map(item => (
                <SwipeableRow key={item.id} onDelete={() => removeItems(activeTab, item.name)}>
                  <div
                    className="card-row"
                    style={{ padding: "14px 16px", cursor: "pointer" }}
                    onClick={() => setEditing({ ...item, location: activeTab })}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>
                        {item.name}
                        {item.qty > 1 && (
                          <span style={{ color: "var(--text-muted)", fontWeight: 500 }}> ×{item.qty}</span>
                        )}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <span className={expirationClass(item.daysLeft)}>
                          {expirationLabel(item.daysLeft)}
                        </span>
                      </div>
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: 20, lineHeight: 1 }}>›</span>
                  </div>
                </SwipeableRow>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <DogDash size={100} />
              <h3>Nothing here yet</h3>
              <p>Dash checked — this section is empty. Scan something to get started.</p>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <EditItemSheet
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(id, updates) => { updateItem(editing.location, id, updates); setEditing(null); }}
          onDelete={(name) => { removeItems(editing.location, name); setEditing(null); }}
        />
      )}
    </div>
  );
}

function EditItemSheet({ item, onClose, onSave, onDelete }) {
  const init = daysLeftToDate(item.daysLeft);
  const [name,       setName]       = useState(item.name);
  const [month,      setMonth]      = useState(init.month);
  const [year,       setYear]       = useState(init.year);
  const [confirming, setConfirming] = useState(false);

  const selStyle = {
    padding: "12px 14px", borderRadius: 10,
    border: "1.5px solid var(--border)", background: "var(--cream)",
    fontSize: 15, fontFamily: "inherit", color: "var(--text)",
    width: "100%", boxSizing: "border-box",
  };

  function commit() {
    onSave(item.id, {
      name: name.trim() || item.name,
      daysLeft: month && year ? dateToDaysLeft(month, year) : item.daysLeft,
    });
  }

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100 }} />
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "var(--white)", borderRadius: "24px 24px 0 0",
        padding: "24px 20px 36px", zIndex: 101,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Edit Item</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
            Item name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Milk"
            autoFocus
            style={{ width: "100%", padding: "12px 14px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 15, fontFamily: "inherit", color: "var(--text)", background: "var(--cream)", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
            Best by date
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={month} onChange={e => setMonth(e.target.value)} style={{ ...selStyle, flex: 1 }}>
              <option value="">Month</option>
              {MONTHS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={year} onChange={e => setYear(e.target.value)} style={{ ...selStyle, width: 100, flex: "none" }}>
              <option value="">Year</option>
              {getYears().map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={commit}>Save</button>
        <button
          className="btn btn-ghost"
          onClick={() => setConfirming(true)}
          style={{ color: "var(--coral)", fontWeight: 600 }}
        >
          Delete
        </button>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Are you sure?"
          message={`This will remove ${item.name} from your list.`}
          confirmLabel="Yes, delete"
          onConfirm={() => onDelete(item.name)}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}

function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel}
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
        <h2 style={{ fontFamily: '"Lora", Georgia, serif', fontSize: 22, fontWeight: 700 }}>{title}</h2>
        {message && (
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.5 }}>{message}</p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
          <button className="btn btn-coral" onClick={onConfirm}>{confirmLabel}</button>
          <button className="btn btn-ghost" onClick={onCancel} style={{ color: "var(--text-muted)", fontWeight: 600 }}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
