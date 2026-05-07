import { useEffect, useState } from "react";

const LOC = {
  fridge:  { bg: "var(--teal-light)",     color: "var(--teal)",     label: "Fridge"  },
  freezer: { bg: "var(--lavender-light)", color: "var(--lavender)", label: "Freezer" },
  pantry:  { bg: "var(--peach-light)",    color: "var(--peach)",    label: "Pantry"  },
};

const MONTHS = [
  { v: "1",  l: "January"   }, { v: "2",  l: "February" },
  { v: "3",  l: "March"     }, { v: "4",  l: "April"    },
  { v: "5",  l: "May"       }, { v: "6",  l: "June"     },
  { v: "7",  l: "July"      }, { v: "8",  l: "August"   },
  { v: "9",  l: "September" }, { v: "10", l: "October"  },
  { v: "11", l: "November"  }, { v: "12", l: "December" },
];

function getYears() {
  const y = new Date().getFullYear();
  return [y, y + 1, y + 2, y + 3].map(String);
}

function toDisplayDate(month, year) {
  const m = MONTHS.find(x => x.v === month);
  return m ? `${m.l.slice(0, 3)} ${year}` : "";
}

function toDaysLeft(month, year) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // last day of the given month (month is 1-indexed)
  const expiry = new Date(parseInt(year), parseInt(month), 0);
  return Math.max(0, Math.round((expiry - today) / (1000 * 60 * 60 * 24)));
}

const SELECT_STYLE = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1.5px solid var(--border)",
  background: "var(--cream)",
  fontSize: 15,
  fontFamily: "inherit",
  color: "var(--text)",
  WebkitAppearance: "none",
  appearance: "none",
};

const MOCK_POOL = [
  { name: "Milk",              location: "fridge",  needsDate: true  },
  { name: "Eggs",              location: "fridge",  needsDate: true  },
  { name: "Greek yogurt",      location: "fridge",  needsDate: true  },
  { name: "Orange juice",      location: "fridge",  needsDate: true  },
  { name: "Butter",            location: "fridge",  needsDate: true  },
  { name: "Deli turkey",       location: "fridge",  needsDate: true  },
  { name: "Cream cheese",      location: "fridge",  needsDate: true  },
  { name: "Chicken breasts",   location: "freezer", needsDate: true  },
  { name: "Ground beef",       location: "freezer", needsDate: true  },
  { name: "Frozen waffles",    location: "freezer", needsDate: true  },
  { name: "Frozen vegetables", location: "freezer", needsDate: false },
  { name: "Bread",             location: "pantry",  needsDate: true  },
  { name: "Pasta",             location: "pantry",  needsDate: false },
  { name: "Canned tomatoes",   location: "pantry",  needsDate: false },
  { name: "Rice",              location: "pantry",  needsDate: false },
  { name: "Cereal",            location: "pantry",  needsDate: false },
  { name: "Olive oil",         location: "pantry",  needsDate: false },
  { name: "Peanut butter",     location: "pantry",  needsDate: false },
  { name: "Crackers",          location: "pantry",  needsDate: false },
];

function mockParse() {
  const shuffled = [...MOCK_POOL].sort(() => Math.random() - 0.5);
  const count = 5 + Math.floor(Math.random() * 5);
  return shuffled.slice(0, count).map((item, i) => ({
    ...item,
    id: Date.now() + i,
    expiryMonth: "",
    expiryYear: "",
  }));
}

function LocationPill({ loc }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 600,
      padding: "2px 9px", borderRadius: 999,
      background: LOC[loc].bg, color: LOC[loc].color,
      marginLeft: 8, flexShrink: 0,
    }}>
      {LOC[loc].label}
    </span>
  );
}

export default function ScanModal({ onClose, onConfirm }) {
  const [step, setStep]   = useState("processing");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setItems(mockParse());
      setStep("review");
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  function setExpiry(id, field, value) {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }

  function removeItem(id) {
    setItems(prev => prev.filter(item => item.id !== id));
  }

  function handleConfirm() {
    const toAdd = items.map(item => ({
      name:     item.name,
      location: item.location,
      daysLeft: (item.expiryMonth && item.expiryYear)
        ? toDaysLeft(item.expiryMonth, item.expiryYear)
        : item.needsDate ? 7 : 365,
    }));
    onConfirm(toAdd);
    onClose();
  }

  const needsDate = items.filter(i => i.needsDate && !(i.expiryMonth && i.expiryYear));
  const ready     = items.filter(i => !i.needsDate || (i.expiryMonth && i.expiryYear));
  const byLoc = {
    fridge:  ready.filter(i => i.location === "fridge"),
    freezer: ready.filter(i => i.location === "freezer"),
    pantry:  ready.filter(i => i.location === "pantry"),
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={step === "review" ? onClose : undefined}
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.45)", zIndex: 200 }}
      />

      {/* Full-screen panel — simple inset, no transform tricks */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 201,
        background: "var(--cream)",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
      }}>

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "20px 20px 14px",
          borderBottom: step === "review" ? "1px solid var(--border)" : "none",
          gap: 12,
        }}>
          <div>
            <h2 style={{ fontSize: 22 }}>
              {step === "processing" ? "Scanning receipt…" : "Review Items"}
            </h2>
            {step === "review" && (
              <p style={{ fontSize: 13, marginTop: 3 }}>
                Set expiry dates for perishables, then confirm.
              </p>
            )}
          </div>
          {step === "review" && (
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ flexShrink: 0, marginTop: 2 }}>✕</button>
          )}
        </div>

        {/* ── Processing ── */}
        {step === "processing" && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 24, padding: 40,
          }}>
            <div className="scan-spinner" />
            <p style={{ fontSize: 17, textAlign: "center", color: "var(--text-muted)" }}>
              Reading your receipt…
            </p>
          </div>
        )}

        {/* ── Review ── */}
        {step === "review" && (
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "16px 20px 120px",
            display: "flex", flexDirection: "column", gap: 20,
          }}>

            {/* Needs a Date */}
            {needsDate.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="section-label coral">Needs a Date</span>
                  <span className="badge">{needsDate.length}</span>
                </div>
                <div className="card card-accent-coral" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {needsDate.map(item => (
                    <div key={item.id} className="card-row" style={{ gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                          {item.name}
                          <LocationPill loc={item.location} />
                        </div>
                        {/* Month + Year selects — native iOS spinners, fully styleable */}
                        <div style={{ display: "flex", gap: 8 }}>
                          <div style={{ position: "relative", flex: 1 }}>
                            <select
                              value={item.expiryMonth}
                              onChange={e => setExpiry(item.id, "expiryMonth", e.target.value)}
                              style={{ ...SELECT_STYLE, width: "100%" }}
                            >
                              <option value="">Month</option>
                              {MONTHS.map(m => (
                                <option key={m.v} value={m.v}>{m.l}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ position: "relative", width: 88 }}>
                            <select
                              value={item.expiryYear}
                              onChange={e => setExpiry(item.id, "expiryYear", e.target.value)}
                              style={{ ...SELECT_STYLE, width: "100%" }}
                            >
                              <option value="">Year</option>
                              {getYears().map(y => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeItem(item.id)}
                        style={{ flexShrink: 0, alignSelf: "flex-start" }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ready groups */}
            {["fridge", "freezer", "pantry"].map(loc => {
              if (!byLoc[loc].length) return null;
              return (
                <div key={loc} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span className="section-label" style={{ color: LOC[loc].color }}>
                    {LOC[loc].label}
                  </span>
                  <div
                    className="card"
                    style={{ borderLeft: `4px solid ${LOC[loc].color}`, display: "flex", flexDirection: "column", gap: 0 }}
                  >
                    {byLoc[loc].map(item => (
                      <div key={item.id} className="card-row">
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 500 }}>{item.name}</span>
                          {item.expiryMonth && item.expiryYear && (
                            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                              Best by {toDisplayDate(item.expiryMonth, item.expiryYear)}
                            </div>
                          )}
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "48px 0" }}>
                No items to add.
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        {step === "review" && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "12px 20px 44px",
            background: "linear-gradient(transparent, var(--cream) 28%)",
          }}>
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={items.length === 0}
              style={{ opacity: items.length ? 1 : 0.4 }}
            >
              Add {items.length} Item{items.length !== 1 ? "s" : ""} to Food
            </button>
          </div>
        )}
      </div>
    </>
  );
}
