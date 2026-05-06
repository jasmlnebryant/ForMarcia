// BottomNav.jsx — persistent bottom tab bar for Marcia's view

import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/",       icon: "🛒", label: "List"   },
  { path: "/pantry", icon: "🗄",  label: "Pantry" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          className={`nav-item ${location.pathname === tab.path ? "active" : ""}`}
          onClick={() => navigate(tab.path)}
        >
          <span className="nav-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
