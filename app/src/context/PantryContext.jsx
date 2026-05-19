import { createContext, useContext, useRef, useState } from "react";

const PantryContext = createContext(null);

export function PantryProvider({ children }) {
  const [items, setItems] = useState({
    fridge: [
      { id: 1, name: "Milk",           daysLeft: 2  },
      { id: 2, name: "Cheddar cheese", daysLeft: 7  },
      { id: 3, name: "Leftover soup",  daysLeft: 0  },
      { id: 4, name: "Yogurt",         daysLeft: 12 },
    ],
    freezer: [
      { id: 5, name: "Chicken breasts", daysLeft: 60  },
      { id: 6, name: "Frozen peas",     daysLeft: 180 },
    ],
    pantry: [
      { id: 7, name: "Canned tomatoes", daysLeft: 365 },
      { id: 8, name: "Pasta",           daysLeft: 5   },
      { id: 9, name: "Olive oil",       daysLeft: 30  },
    ],
  });

  const nextId = useRef(20);

  function removeItems(location, name) {
    setItems(prev => ({
      ...prev,
      [location]: prev[location].filter(item => item.name !== name),
    }));
  }

  function addScannedItems(newItems) {
    setItems(prev => {
      const updated = {
        fridge:  [...prev.fridge],
        freezer: [...prev.freezer],
        pantry:  [...prev.pantry],
      };
      newItems.forEach(item => {
        updated[item.location].unshift({
          id: nextId.current++,
          name: item.name,
          daysLeft: item.daysLeft,
        });
      });
      return updated;
    });
  }

  // Sort each section by soonest expiring first
  function sortByExpiry(a, b) {
    if (a.daysLeft === null && b.daysLeft === null) return 0;
    if (a.daysLeft === null) return 1;   // nulls sink to the bottom
    if (b.daysLeft === null) return -1;
    return a.daysLeft - b.daysLeft;
  }

  const sortedItems = {
    fridge:  [...items.fridge].sort(sortByExpiry),
    freezer: [...items.freezer].sort(sortByExpiry),
    pantry:  [...items.pantry].sort(sortByExpiry),
  };

  function updateItem(location, id, updates) {
    setItems(prev => ({
      ...prev,
      [location]: prev[location].map(item => item.id === id ? { ...item, ...updates } : item),
    }));
  }

  return (
    <PantryContext.Provider value={{ items: sortedItems, addScannedItems, removeItems, updateItem }}>
      {children}
    </PantryContext.Provider>
  );
}

export function usePantry() {
  return useContext(PantryContext);
}
