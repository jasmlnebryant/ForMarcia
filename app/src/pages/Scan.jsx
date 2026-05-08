import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePantry } from "../context/PantryContext";

// ── OpenAI credentials ─────────────────────────────────────────────────────────
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// ── Convert image file to base64 ───────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── GPT-4o Vision receipt parser ──────────────────────────────────────────────
async function parseReceipt(imageFile) {
  const base64 = await fileToBase64(imageFile);
  const mimeType = imageFile.type || "image/jpeg";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a strict grocery receipt parser.

First, decide: is this image a printed grocery store receipt with visible line items and prices?
If it is NOT a receipt — if it is a photo of a room, ceiling, person, food, blank paper, or anything else — return exactly: []

Only if it IS a receipt: extract the food and household items from the printed text you can actually read.
Do not guess or infer items. Only include items with text clearly visible on the receipt.

Return ONLY a raw JSON array (no markdown, no code fences, no explanation).
Each object must have:
- "name": clean item name, title case, no prices or quantities
- "location": exactly one of "fridge", "freezer", or "pantry"
- "needsDate": true if perishable, false otherwise

If no items are clearly readable, return exactly: []`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
              detail: "high",
            },
          },
        ],
      }],
      max_tokens: 1000,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI responded with ${res.status}`);
  const data = await res.json();

  const raw = data.choices?.[0]?.message?.content?.trim() ?? "[]";
  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ── Month / Year helpers ───────────────────────────────────────────────────────
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
  const expiry = new Date(parseInt(year), parseInt(month), 0);
  return Math.max(0, Math.round((expiry - today) / (1000 * 60 * 60 * 24)));
}

// ── Location palette ───────────────────────────────────────────────────────────
const LOC = {
  fridge:  { color: "var(--teal)",     bg: "var(--teal-light)",     label: "Fridge"  },
  freezer: { color: "var(--lavender)", bg: "var(--lavender-light)", label: "Freezer" },
  pantry:  { color: "var(--peach)",    bg: "var(--peach-light)",    label: "Pantry"  },
};

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
  width: "100%",
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Scan() {
  const navigate = useNavigate();
  const { addScannedItems } = usePantry();
  const fileInputRef = useRef(null);

  const [step, setStep]       = useState("idle");   // idle | processing | review | empty | error
  const [items, setItems]     = useState([]);
  const [errMsg, setErrMsg]   = useState("");

  // Trigger camera on mount-ish — user taps "Take Photo"
  function openCamera() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setStep("processing");

    try {
      const lineItems = await parseReceipt(file);

      if (!lineItems.length) {
        setStep("empty");
        return;
      }

      const parsed = lineItems
        .filter(li => li.name?.trim())
        .map((li, i) => ({
          id: Date.now() + i,
          name: li.name.trim(),
          location: li.location ?? "pantry",
          needsDate: li.needsDate ?? false,
          expiryMonth: "",
          expiryYear: "",
        }));

      if (!parsed.length) {
        setStep("empty");
        return;
      }

      setItems(parsed);
      setStep("review");
    } catch (err) {
      console.error(err);
      setErrMsg(err.message || "Something went wrong.");
      setStep("error");
    }
  }

  function setExpiry(id, field, value) {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }

  function removeItem(id) {
    setItems(prev => prev.filter(item => item.id !== id));
  }

  function handleConfirm() {
    addScannedItems(items.map(item => ({
      name:     item.name,
      location: item.location,
      daysLeft: (item.expiryMonth && item.expiryYear)
        ? toDaysLeft(item.expiryMonth, item.expiryYear)
        : item.needsDate ? 7 : 365,
    })));
    navigate("/pantry");
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
      {/* Hidden camera input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      {/* ── Header ── */}
      <div className="page-header">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/pantry")}
          style={{ width: "auto", paddingLeft: 0, color: "var(--green-dark)", fontWeight: 600 }}
        >
          ← Food
        </button>
      </div>

      {/* ── Idle: prompt to scan ── */}
      {step === "idle" && (
        <div className="page center" style={{ gap: 24 }}>
          <div style={{ fontSize: 64 }}>🧾</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
            <h1 style={{ fontSize: 26 }}>Scan a Receipt</h1>
            <p>Point your camera at a grocery receipt.<br />Items will be sorted into Fridge, Freezer, or Pantry.</p>
          </div>
          <button className="btn btn-primary" onClick={openCamera} style={{ width: "100%", maxWidth: 300 }}>
            Take Photo
          </button>
        </div>
      )}

      {/* ── Processing ── */}
      {step === "processing" && (
        <div className="page center" style={{ gap: 24 }}>
          <div className="scan-spinner" />
          <p style={{ fontSize: 17, color: "var(--text-muted)" }}>Reading your receipt…</p>
        </div>
      )}

      {/* ── Empty: nothing found ── */}
      {step === "empty" && (
        <div className="page center" style={{ gap: 24 }}>
          <div style={{ fontSize: 56 }}>🤷</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
            <h2>No items found</h2>
            <p>Make sure you're scanning a grocery receipt and the photo is clear.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setStep("idle")} style={{ maxWidth: 300 }}>
            Try Again
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/pantry")} style={{ color: "var(--text-muted)" }}>
            Go Back
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {step === "error" && (
        <div className="page center" style={{ gap: 24 }}>
          <div style={{ fontSize: 56 }}>⚠️</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
            <h2>Scan failed</h2>
            <p>{errMsg}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setStep("idle")} style={{ maxWidth: 300 }}>
            Try Again
          </button>
        </div>
      )}

      {/* ── Review ── */}
      {step === "review" && (
        <>
          <div style={{ padding: "8px 20px 0" }}>
            <h1 style={{ fontSize: 24 }}>Review Items</h1>
            <p style={{ fontSize: 13, marginTop: 4 }}>Set expiry dates for perishables, then confirm.</p>
          </div>

          <div style={{ padding: "16px 20px 120px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>

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
                          <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 999, background: LOC[item.location].bg, color: LOC[item.location].color }}>
                            {LOC[item.location].label}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <select value={item.expiryMonth} onChange={e => setExpiry(item.id, "expiryMonth", e.target.value)} style={{ ...SELECT_STYLE, flex: 1 }}>
                            <option value="">Month</option>
                            {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                          </select>
                          <select value={item.expiryYear} onChange={e => setExpiry(item.id, "expiryYear", e.target.value)} style={{ ...SELECT_STYLE, width: 90, flex: "none" }}>
                            <option value="">Year</option>
                            {getYears().map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.id)} style={{ flexShrink: 0, alignSelf: "flex-start" }}>✕</button>
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
                  <span className="section-label" style={{ color: LOC[loc].color }}>{LOC[loc].label}</span>
                  <div className="card" style={{ borderLeft: `4px solid ${LOC[loc].color}`, display: "flex", flexDirection: "column", gap: 0 }}>
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
          </div>

          {/* Footer */}
          <div style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 480,
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
        </>
      )}
    </>
  );
}
