import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DogDash from "../components/dogs/DogDash";
import { usePantry } from "../context/PantryContext";

const TABS = ["fridge", "freezer", "pantry"];
const TAB_LABELS = { fridge: "Fridge", freezer: "Freezer", pantry: "Pantry" };

function expirationClass(daysLeft) {
  if (daysLeft <= 0) return "exp-urgent";
  if (daysLeft <= 3) return "exp-urgent";
  if (daysLeft <= 7) return "exp-soon";
  return "exp-ok";
}

function expirationLabel(daysLeft) {
  if (daysLeft <= 0) return "Expired";
  if (daysLeft === 1) return "1 day left";
  if (daysLeft <= 7) return `${daysLeft} days left`;
  return `${daysLeft} days`;
}

export default function Pantry() {
  const { items } = usePantry();
  const navigate = useNavigate();

  const [activeTab,  setActiveTab]  = useState("fridge");
  const [slideClass, setSlideClass] = useState("");
  const [animKey,    setAnimKey]    = useState(0);

  const touchStartX = useRef(null);

  /* ── Tab switching ── */
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

  const currentItems = items[activeTab];

  return (
    <>
      <div className="page-header">
        <h1>Food</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/scan")}>
          + Scan
        </button>
      </div>

      {/* Tab bar */}
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

      {/* Swipeable content */}
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ touchAction: "pan-y" }}>
        <div
          key={animKey}
          className={slideClass}
          style={{ padding: "16px 20px 100px", display: "flex", flexDirection: "column", gap: 20 }}
        >
          {currentItems.length > 0 ? (
            <div className="card card-accent-teal" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {currentItems.map(item => (
                <div key={item.id} className="card-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                    <span className={expirationClass(item.daysLeft)}>
                      {expirationLabel(item.daysLeft)}
                    </span>
                  </div>
                </div>
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

    </>
  );
}
