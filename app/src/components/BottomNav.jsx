import { useLocation, useNavigate } from "react-router-dom";
import { FileText, Apple, Settings } from "lucide-react";

const tabs = [
  { path: "/",        icon: FileText, label: "List"     },
  { path: "/pantry",  icon: Apple,    label: "Food"     },
  { path: "/settings",icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {tabs.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            className={`nav-item ${active ? "active" : ""}`}
            onClick={() => navigate(path)}
          >
            <Icon size={24} strokeWidth={active ? 2.5 : 1.8} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
