import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePantry } from "../context/PantryContext";

// ── OpenAI credentials ─────────────────────────────────────────────────────────
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// ── Resize + compress image before sending ─────────────────────────────────────
function compressImage(file, maxWidth = 1600) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale  = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, "image/jpeg", 0.85);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

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
// Returns { receiptCount: number, items: ParsedItem[] }
async function parseReceipt(imageFile) {
  const compressed = await compressImage(imageFile);
  const base64     = await fileToBase64(compressed);
  const mimeType   = "image/jpeg";

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
            text: `You are a Publix grocery receipt decoder. Your job is to read receipt line items and return clean food item names.

DEPARTMENT CODES — these appear after item names and are NOT part of the name. Strip them:
FE=front end, DEL=deli, PROD=produce, FRZ/FZN=frozen, BKRY/BAK=bakery, PREP=prepared foods, SEA=seafood, PHCY=pharmacy, HPC=household, HABA=health & beauty

FOOD ABBREVIATIONS (decode these):
BF/BEEF=beef, BRD=bread, BRST=breast, BTTR=butter, CHK/CHKN=chicken, CHDR=cheddar, CHOC=chocolate, CRM=cream, CUC=cucumber, FDG=fudge, GRN=green, HNY=honey, ITLN=Italian, JLPN=jalapeño, LET=lettuce, LG=large, LT=light, MED=medium, MSHRM=mushroom, ONN=onion, ORG=organic, ORNG=orange, POT=potato, PPR=pepper, RSTD=roasted, ROMA=Roma tomato, SALMN=salmon, SAUS=sausage, SHMP=shrimp, SPCY=spicy, STRW=strawberry, SWT=sweet, TOM=tomato, TUNA=tuna, TURKY=turkey, UNSWT=unsweetened, VEG=vegetable, VNLA=vanilla, WHL=whole, ZCHN=zucchini, ASSRTD=assorted, CRCH=crunch, TSTD=toasted, DELX=deluxe, PREM=premium, MINI=miniature, JMB=jumbo, BRKFST=breakfast, CHSCK=cheesecake, CPTCK=cupcake, M&C=mac and cheese, CHX NGT=chicken nuggets, TTR TTS=tater tots

BRAND ABBREVIATIONS:
BTY CRK=Betty Crocker, BRYRS=Breyers, CHBNI=Chobani, DNYMN=Dannon, GTRD=Gatorade, HNZ=Heinz, HLLMN=Hellmann's, HRML=Hormel, KLGG=Kellogg's, KRF=Kraft, LYS=Lay's, OREO=Oreo, PEPSI=Pepsi, PRGLS=Pringles, RITZ=Ritz, SMKRS=Smucker's, TOSTTS=Tostitos, TYSN=Tyson, VLVTA=Velveeta, WNDR=Wonder, YPLT=Yoplait, GRNWS/GNW=GreenWise, PFM=Publix Premium, PBLX/PBST=Publix

PRODUCE PLU CODES (4-digit numbers on receipt = produce item):
4011=bananas, 4046/4225=avocado, 4131=Gala apple, 4087=Granny Smith apple, 4065=green bell pepper, 4688=red bell pepper, 4067/4062=cucumber, 4593=yellow onion, 4663=red onion, 4166=sweet onion, 4072=russet potato, 4078=sweet potato, 4061=iceberg lettuce, 4640=romaine lettuce, 4060=broccoli, 4069=celery, 4082=tomatoes, 4545=Roma tomato, 3151=grape tomato, 4064=mushroom, 3121=garlic, 4235/4048=lime, 4053=lemon, 4319=navel orange, 4040=pineapple, 4049=mango, 4098=strawberries, 4240=blueberries, 4258=raspberries, 4250=blackberries, 4127=carrots, 4562=baby carrots, 4090=spinach, 4589=kale, 4066=corn, 4074=green onions

QUANTITY RULE — CRITICAL:
Publix receipts do NOT print "x2" or "qty: 2". Instead, the same item is printed as a separate line for each unit purchased. So if "MUSH PEANUT BUTTER" appears 3 times, that means qty: 3. Consolidate repeated lines into one item with the correct qty.

RULES:
- Strip department codes from item names (FE, DEL, PROD, etc.)
- Decode all abbreviations using the reference above
- Only include food items actually on this receipt — do NOT invent items
- Skip taxes, fees, discounts (YS=you saved, SAV, INST, COUP, BOGO savings lines), totals, and payment lines
- Consolidate duplicate lines into one item with qty = number of times that line appears
- needsDate rules: set needsDate: true for ALL items going in the fridge (dairy, fresh meat, fresh produce, deli, prepared foods, refrigerated items like yogurt/eggs/cheese/milk/oats/juice, etc.) — set needsDate: false for freezer and pantry items since they last much longer
- location rules: use "fridge" for perishables kept cold, "freezer" for frozen items, "pantry" for shelf-stable dry/canned goods — if you are genuinely unsure, use "unknown" so the user can decide
- If this is NOT a receipt, return { "receiptCount": 0, "items": [] }

Return ONLY a raw JSON object (no markdown, no code fences):
{
  "receiptCount": <total number of individual purchasable product lines on the receipt — count EACH repeated line separately, e.g. if "Mush" appears 3 times that contributes 3 to this count — exclude discounts/savings/taxes/totals/payment lines>,
  "items": [array of consolidated item objects]
}
Each item object: { "name": string (clean title case), "qty": integer, "location": "fridge"|"freezer"|"pantry"|"unknown", "needsDate": boolean }

Example: if the receipt lists "MUSH PB" three times and "PASTA" once, return:
{"receiptCount":4,"items":[{"name":"Mush Peanut Butter","qty":3,"location":"fridge","needsDate":false},{"name":"Pasta","qty":1,"location":"pantry","needsDate":false}]}`,
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
      max_tokens: 1200,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI responded with ${res.status}`);
  const data = await res.json();

  const raw = data.choices?.[0]?.message?.content?.trim() ?? "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const result  = JSON.parse(cleaned);

  // Handle both old array format and new object format gracefully
  if (Array.isArray(result)) {
    return { receiptCount: result.length, items: result };
  }
  return {
    receiptCount: result.receiptCount ?? result.items?.length ?? 0,
    items: result.items ?? [],
  };
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

const INPUT_STYLE = {
  fontWeight: 500,
  fontSize: 16,
  border: "1.5px solid var(--border)",
  borderRadius: 10,
  background: "var(--cream)",
  width: "100%",
  padding: "10px 12px",
  fontFamily: "inherit",
  color: "var(--text)",
  boxSizing: "border-box",
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

const FIELD_LABEL = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  display: "block",
  marginBottom: 4,
};

// ── Qty stepper ───────────────────────────────────────────────────────────────
function QtyStepper({ qty, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 13, color: "var(--text-muted)", marginRight: 4 }}>Qty</span>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onChange(-1)}
        style={{ padding: "4px 10px", fontSize: 18, lineHeight: 1 }}
      >−</button>
      <span style={{ fontWeight: 600, minWidth: 20, textAlign: "center" }}>{qty}</span>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onChange(1)}
        style={{ padding: "4px 10px", fontSize: 18, lineHeight: 1 }}
      >+</button>
    </div>
  );
}

// ── Default state for the manual-add form ─────────────────────────────────────
const EMPTY_MANUAL = {
  name: "", location: "fridge", qty: 1,
  needsDate: false, expiryMonth: "", expiryYear: "",
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Scan() {
  const navigate = useNavigate();
  const { addScannedItems } = usePantry();
  const fileInputRef   = useRef(null);
  const uploadInputRef = useRef(null);

  const [step, setStep]               = useState("idle");
  const [items, setItems]             = useState([]);
  const [receiptCount, setReceiptCount] = useState(0);
  const [errMsg, setErrMsg]           = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newManual, setNewManual]     = useState(EMPTY_MANUAL);

  function openCamera() { fileInputRef.current?.click(); }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setStep("processing");

    try {
      const { receiptCount: rc, items: lineItems } = await parseReceipt(file);

      if (!lineItems.length) { setStep("empty"); return; }

      const parsed = lineItems
        .filter(li => li.name?.trim())
        .map((li, i) => ({
          id: Date.now() + i,
          name: li.name.trim(),
          qty: Math.max(1, parseInt(li.qty) || 1),
          location: li.location ?? "pantry",
          needsDate: li.needsDate ?? false,
          expiryMonth: "",
          expiryYear: "",
        }));

      if (!parsed.length) { setStep("empty"); return; }

      setReceiptCount(rc);
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

  function changeQty(id, delta) {
    setItems(prev => prev.map(item =>
      item.id !== id ? item : { ...item, qty: Math.max(1, item.qty + delta) }
    ));
  }

  function renameName(id, name) {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, name } : item
    ));
  }

  function handleConfirm() {
    const expanded = items.flatMap(item =>
      Array.from({ length: item.qty }, () => ({
        name:     item.name,
        location: item.location,
        daysLeft: (item.expiryMonth && item.expiryYear)
          ? toDaysLeft(item.expiryMonth, item.expiryYear)
          : item.needsDate ? null : 365,
      }))
    );
    addScannedItems(expanded);
    navigate("/pantry");
  }

  // ── Manual add ──────────────────────────────────────────────────────────────
  function submitManual() {
    if (!newManual.name.trim()) return;
    setItems(prev => [...prev, {
      id: Date.now(),
      name: newManual.name.trim(),
      location: newManual.location,
      qty: newManual.qty,
      needsDate: newManual.needsDate,
      expiryMonth: newManual.expiryMonth,
      expiryYear:  newManual.expiryYear,
    }]);
    setShowAddModal(false);
    setNewManual(EMPTY_MANUAL);
  }

  function setLocation(id, location) {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, location, needsDate: location === "fridge" } : item
    ));
  }

  // ── Derived state ────────────────────────────────────────────────────────────
  const unknownLoc = items.filter(i => i.location === "unknown");
  const needsDate  = items.filter(i => i.location !== "unknown" && i.needsDate && !(i.expiryMonth && i.expiryYear));
  const ready      = items.filter(i => i.location !== "unknown" && (!i.needsDate || (i.expiryMonth && i.expiryYear)));
  const byLoc = {
    fridge:  ready.filter(i => i.location === "fridge"),
    freezer: ready.filter(i => i.location === "freezer"),
    pantry:  ready.filter(i => i.location === "pantry"),
  };
  const totalQty   = items.reduce((sum, i) => sum + i.qty, 0);
  const missed     = receiptCount - totalQty;
  const canConfirm = items.length > 0 && unknownLoc.length === 0;

  return (
    <>
      {/* Hidden file inputs */}
      <input ref={fileInputRef}   type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileSelected} />
      <input ref={uploadInputRef} type="file" accept="image/*"                       style={{ display: "none" }} onChange={handleFileSelected} />

      {/* ── Header ── */}
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/pantry")}
          style={{ width: "auto", paddingLeft: 0, color: "var(--green-dark)", fontWeight: 600 }}
        >
          ← Food
        </button>

        {/* + button only visible during review */}
        {step === "review" && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "var(--green)", color: "var(--white)",
              border: "none", fontSize: 24, lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            +
          </button>
        )}
      </div>

      {/* ── Idle ── */}
      {step === "idle" && (
        <div className="page center" style={{ gap: 24 }}>
          <div style={{ fontSize: 64 }}>🧾</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
            <h1 style={{ fontSize: 26 }}>Scan a Receipt</h1>
            <p>For best results:</p>
            <div style={{ textAlign: "left", background: "var(--white)", borderRadius: 14, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8, fontSize: 15 }}>
              <span>📄 Lay the receipt flat</span>
              <span>💡 Make sure it's well-lit</span>
              <span>🔍 Fill the frame with the receipt</span>
              <span>📷 Hold steady — no blur</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 300 }}>
            <button className="btn btn-primary" onClick={openCamera}>📷 Take Photo</button>
            <button className="btn btn-secondary" onClick={() => uploadInputRef.current?.click()} style={{ color: "var(--green-dark)" }}>
              🖼 Upload from Library
            </button>
          </div>
        </div>
      )}

      {/* ── Processing ── */}
      {step === "processing" && (
        <div className="page center" style={{ gap: 24 }}>
          <div className="scan-spinner" />
          <p style={{ fontSize: 17, color: "var(--text-muted)" }}>Reading your receipt…</p>
        </div>
      )}

      {/* ── Empty ── */}
      {step === "empty" && (
        <div className="page center" style={{ gap: 24 }}>
          <div style={{ fontSize: 56 }}>🤷</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
            <h2>No items found</h2>
            <p>Make sure you're scanning a grocery receipt and the photo is clear.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setStep("idle")} style={{ maxWidth: 300 }}>Try Again</button>
          <button className="btn btn-ghost" onClick={() => navigate("/pantry")} style={{ color: "var(--text-muted)" }}>Go Back</button>
        </div>
      )}

      {/* ── Error ── */}
      {step === "error" && (
        <div className="page center" style={{ gap: 24 }}>
          <div style={{ fontSize: 56 }}>⚠️</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
            <h2>Scan failed</h2>
            <p>{errMsg}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Screenshot this and send it to Jasmine.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setStep("idle")} style={{ maxWidth: 300 }}>Try Again</button>
        </div>
      )}

      {/* ── Review ── */}
      {step === "review" && (
        <>
          <div style={{ padding: "4px 20px 0" }}>
            <h1 style={{ fontSize: 24 }}>Review Items</h1>
            <p style={{ fontSize: 13, marginTop: 4, color: "var(--text-muted)" }}>
              {receiptCount > 0
                ? `Captured ${totalQty} of ${receiptCount} items from your receipt.`
                : "Set expiry dates for perishables, then confirm."}
            </p>
          </div>

          <div style={{ padding: "14px 20px 160px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>

            {/* ── Missed items warning ── */}
            {missed > 0 && (
              <div style={{
                background: "var(--peach-light)",
                border: "1.5px solid var(--peach)",
                borderRadius: 14,
                padding: "13px 16px",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                    {missed} item{missed !== 1 ? "s" : ""} may be missing
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4 }}>
                    The receipt had {receiptCount} items but we only captured {totalQty}. Tap <strong>+</strong> in the top-right to add anything that was missed.
                  </div>
                </div>
              </div>
            )}

            {/* ── Unknown location ── */}
            {unknownLoc.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="section-label" style={{ color: "var(--lavender)" }}>Where does it go?</span>
                  <span className="badge">{unknownLoc.length}</span>
                </div>
                <div className="card" style={{ borderLeft: "4px solid var(--lavender)", display: "flex", flexDirection: "column", gap: 0 }}>
                  {unknownLoc.map(item => (
                    <div key={item.id} className="card-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <label style={FIELD_LABEL}>✏ Item name</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={e => renameName(item.id, e.target.value)}
                            style={{ ...INPUT_STYLE, fontWeight: 600 }}
                          />
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.id)} style={{ flexShrink: 0, alignSelf: "flex-end", marginBottom: 2 }}>✕</button>
                      </div>
                      <div>
                        <label style={FIELD_LABEL}>Select a location</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          {["fridge", "freezer", "pantry"].map(loc => (
                            <button
                              key={loc}
                              onClick={() => setLocation(item.id, loc)}
                              style={{
                                flex: 1, padding: "10px 4px", borderRadius: 10, border: "1.5px solid",
                                borderColor: "var(--border)",
                                background: "var(--cream)",
                                color: "var(--text-muted)",
                                fontWeight: 600, fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                              }}
                            >
                              {LOC[loc].label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <QtyStepper qty={item.qty} onChange={d => changeQty(item.id, d)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Needs a Date ── */}
            {needsDate.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="section-label coral">Needs a Date</span>
                  <span className="badge">{needsDate.length}</span>
                </div>
                <div className="card card-accent-coral" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {needsDate.map(item => (
                    <div key={item.id} className="card-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <label style={FIELD_LABEL}>✏ Item name</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={e => renameName(item.id, e.target.value)}
                            style={{ ...INPUT_STYLE, fontWeight: 600 }}
                          />
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.id)} style={{ flexShrink: 0, alignSelf: "flex-end", marginBottom: 2 }}>✕</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: LOC[item.location].bg, color: LOC[item.location].color }}>
                          {LOC[item.location].label}
                        </span>
                        <QtyStepper qty={item.qty} onChange={d => changeQty(item.id, d)} />
                      </div>
                      <div>
                        <label style={FIELD_LABEL}>Best by date</label>
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Ready groups ── */}
            {["fridge", "freezer", "pantry"].map(loc => {
              if (!byLoc[loc].length) return null;
              return (
                <div key={loc} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span className="section-label" style={{ color: LOC[loc].color }}>{LOC[loc].label}</span>
                  <div className="card" style={{ borderLeft: `4px solid ${LOC[loc].color}`, display: "flex", flexDirection: "column", gap: 0 }}>
                    {byLoc[loc].map(item => (
                      <div key={item.id} className="card-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <label style={FIELD_LABEL}>✏ Item name</label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={e => renameName(item.id, e.target.value)}
                              style={INPUT_STYLE}
                            />
                          </div>
                          <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.id)} style={{ flexShrink: 0, alignSelf: "flex-end", marginBottom: 2 }}>✕</button>
                        </div>
                        {item.expiryMonth && item.expiryYear && (
                          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                            Best by {toDisplayDate(item.expiryMonth, item.expiryYear)}
                          </div>
                        )}
                        <QtyStepper qty={item.qty} onChange={d => changeQty(item.id, d)} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Confirm footer ── */}
          <div style={{
            position: "fixed",
            bottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
            left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 480,
            padding: "16px 20px 8px",
            background: "linear-gradient(transparent, var(--cream) 30%)",
            display: "flex", flexDirection: "column", gap: 6, alignItems: "center",
          }}>
            {!canConfirm && unknownLoc.length > 0 && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                Select a location for {unknownLoc.length} item{unknownLoc.length !== 1 ? "s" : ""} above first
              </p>
            )}
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={!canConfirm}
              style={{ opacity: canConfirm ? 1 : 0.4 }}
            >
              Add {items.length} Item{items.length !== 1 ? "s" : ""} to Food
            </button>
          </div>
        </>
      )}

      {/* ── Manual Add bottom sheet ── */}
      {showAddModal && (
        <>
          <div
            onClick={() => { setShowAddModal(false); setNewManual(EMPTY_MANUAL); }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }}
          />
          <div style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 480,
            background: "var(--white)",
            borderRadius: "24px 24px 0 0",
            padding: "24px 20px",
            paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
            zIndex: 201,
            display: "flex", flexDirection: "column", gap: 16,
            maxHeight: "85svh", overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 20 }}>Add Missing Item</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowAddModal(false); setNewManual(EMPTY_MANUAL); }}>✕</button>
            </div>

            {/* Name */}
            <div>
              <label style={FIELD_LABEL}>Item name</label>
              <input
                type="text"
                placeholder="e.g. Orange Juice"
                value={newManual.name}
                onChange={e => setNewManual(p => ({ ...p, name: e.target.value }))}
                autoFocus
                style={INPUT_STYLE}
              />
            </div>

            {/* Location */}
            <div>
              <label style={FIELD_LABEL}>Where does it go?</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["fridge", "freezer", "pantry"].map(loc => (
                  <button
                    key={loc}
                    onClick={() => setNewManual(p => ({ ...p, location: loc }))}
                    style={{
                      flex: 1, padding: "10px 4px", borderRadius: 10, border: "1.5px solid",
                      borderColor: newManual.location === loc ? LOC[loc].color : "var(--border)",
                      background: newManual.location === loc ? LOC[loc].bg : "var(--cream)",
                      color: newManual.location === loc ? LOC[loc].color : "var(--text-muted)",
                      fontWeight: 600, fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                    }}
                  >
                    {LOC[loc].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty */}
            <div>
              <label style={FIELD_LABEL}>Quantity</label>
              <QtyStepper qty={newManual.qty} onChange={d => setNewManual(p => ({ ...p, qty: Math.max(1, p.qty + d) }))} />
            </div>

            {/* Perishable toggle */}
            <div>
              <label style={FIELD_LABEL}>Best by date (optional)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={newManual.expiryMonth}
                  onChange={e => setNewManual(p => ({ ...p, expiryMonth: e.target.value, needsDate: !!(e.target.value || p.expiryYear) }))}
                  style={{ ...SELECT_STYLE, flex: 1 }}
                >
                  <option value="">Month</option>
                  {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                </select>
                <select
                  value={newManual.expiryYear}
                  onChange={e => setNewManual(p => ({ ...p, expiryYear: e.target.value, needsDate: !!(p.expiryMonth || e.target.value) }))}
                  style={{ ...SELECT_STYLE, width: 90, flex: "none" }}
                >
                  <option value="">Year</option>
                  {getYears().map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={submitManual}
              disabled={!newManual.name.trim()}
              style={{ opacity: newManual.name.trim() ? 1 : 0.4 }}
            >
              Add Item
            </button>
          </div>
        </>
      )}
    </>
  );
}
