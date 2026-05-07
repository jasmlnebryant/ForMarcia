import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GroceryProvider } from "./context/GroceryContext";
import { PantryProvider }  from "./context/PantryContext";
import BottomNav from "./components/BottomNav";
import GroceryList from "./pages/GroceryList";
import Pantry from "./pages/Pantry";
import FamilyRequest from "./pages/FamilyRequest";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import "./index.css";

// Marcia's full app with bottom nav
function MarciaApp() {
  return (
    <>
      <Routes>
        <Route path="/"       element={<GroceryList />} />
        <Route path="/pantry" element={<Pantry />} />
        <Route path="/request"  element={<FamilyRequest />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login"    element={<Login />} />
        <Route path="*"         element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </>
  );
}

function AppRouter() {
  const { user } = useAuth();

  if (user === undefined) return null;

  // Family request route — no auth needed, no nav
  if (window.location.pathname === "/request") {
    return (
      <Routes>
        <Route path="/request" element={<FamilyRequest />} />
      </Routes>
    );
  }

  // For now, skip login and show Marcia's app directly
  // TODO: wire up real auth once Firebase Auth is configured
  return <MarciaApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <GroceryProvider>
        <PantryProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </PantryProvider>
      </GroceryProvider>
    </AuthProvider>
  );
}
