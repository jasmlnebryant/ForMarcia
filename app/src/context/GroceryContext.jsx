import { createContext, useContext, useRef, useState } from "react";

const GroceryContext = createContext(null);

export function GroceryProvider({ children }) {
  const [pending, setPending] = useState([
    { id: 1, from: "Jasmine", item: "Orange juice" },
    { id: 2, from: "Dad",     item: "Paper towels" },
  ]);

  const [confirmed, setConfirmed] = useState([
    { id: 3, item: "Eggs",   addedAt: Date.now() - 3000 },
    { id: 4, item: "Butter", addedAt: Date.now() - 2000 },
    { id: 5, item: "Bread",  addedAt: Date.now() - 1000 },
  ]);

  const [dismissing, setDismissing] = useState(new Set());
  const nextId = useRef(10);

  function animateDismiss(id, setter) {
    setDismissing(prev => new Set([...prev, id]));
    setTimeout(() => {
      setter(prev => prev.filter(r => r.id !== id));
      setDismissing(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }

  function acceptRequest(req) {
    setConfirmed(prev => [
      { id: nextId.current++, item: req.item, from: req.from, addedAt: Date.now() },
      ...prev,
    ]);
    animateDismiss(req.id, setPending);
  }

  function dismissRequest(id) {
    animateDismiss(id, setPending);
  }

  function removeConfirmed(id) {
    setConfirmed(prev => prev.filter(item => item.id !== id));
  }

  function addItems(newItems) {
    const now = Date.now();
    const added = newItems
      .filter(r => r.item.trim())
      .map((row, i) => ({
        id: nextId.current++,
        item: row.item.trim(),
        qty:  row.qty.trim() || null,
        addedAt: now + i,
      }));
    setConfirmed(prev => [...added.reverse(), ...prev]);
  }

  const sortedConfirmed = [...confirmed].sort((a, b) => b.addedAt - a.addedAt);

  return (
    <GroceryContext.Provider value={{
      pending,
      confirmed: sortedConfirmed,
      dismissing,
      acceptRequest,
      dismissRequest,
      removeConfirmed,
      addItems,
    }}>
      {children}
    </GroceryContext.Provider>
  );
}

export function useGrocery() {
  return useContext(GroceryContext);
}
