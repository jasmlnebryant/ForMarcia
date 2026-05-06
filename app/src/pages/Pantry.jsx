// Pantry.jsx — Inventory screen with Fridge / Freezer / Pantry tabs

import { useState } from "react";

const mockItems = {
  fridge: [
    { id: 1, name: "Milk", daysLeft: 2, location: "Fridge" },
    { id: 2, name: "Cheddar cheese", daysLeft: 7, location: "Fridge" },
    { id: 3, name: "Leftover soup", daysLeft: 0, location: "Fridge" },
    { id: 4, name: "Yogurt", daysLeft: 12, location: "Fridge" },
  ],
  freezer: [
    { id: 5, name: "Chicken breasts", daysLeft: 60, location: "Freezer" },
    { id: 6, name: "Frozen peas", daysLeft: 180, location: "Freezer" },
  ],
  pantry: [
    { id: 7, name: "Canned tomatoes", daysLeft: 365, location: "Pantry" },
    { id: 8, name: "Pasta", daysLeft: 5, location: "Pantry" },
    { id: 9, name: "Olive oil", daysLeft: 30, location: "Pantry" },
  ],
};

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
  const [activeTab, setActiveTab] = useState("fridge");
  const items = mockItems[activeTab];

  return (
    <>
      <div className="page-header">
        <h1>Pantry</h1>
        <button className="btn btn-primary btn-sm">+ Scan</button>
      </div>

      {/* Category tabs */}
      <div className="tab-group" style={{ margin: "8px 20px 0" }}>
        {["fridge", "freezer", "pantry"].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "fridge" ? "🧊 Fridge" : tab === "freezer" ? "❄️ Freezer" : "🗄 Pantry"}
          </button>
        ))}
      </div>

      <div className="page" style={{ paddingTop: 16 }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {items.map((item) => (
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
      </div>
    </>
  );
}
