import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import GroceryList from "./pages/GroceryList";
import Pantry from "./pages/Pantry";
import FamilyRequest from "./pages/FamilyRequest";
import Login from "./pages/Login";
import "./index.css";

// Routes Marcia sees when logged in
function MarciaApp() {
  return (
    <Routes>
      <Route path="/" element={<GroceryList />} />
      <Route path="/pantry" element={<Pantry />} />
      <Route path="/request" element={<FamilyRequest />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// Decides what to show based on auth state
function AppRouter() {
  const { user } = useAuth();

  // Still checking Firebase session — show nothing while loading
  if (user === undefined) return null;

  // Family request link — always accessible, no auth needed
  if (window.location.pathname === "/request") {
    return (
      <Routes>
        <Route path="/request" element={<FamilyRequest />} />
      </Routes>
    );
  }

  // Marcia: logged in → show app, not logged in → show login
  return user ? (
    <MarciaApp />
  ) : (
    <Routes>
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}
