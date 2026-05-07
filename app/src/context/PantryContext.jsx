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

  return (
    <PantryContext.Provider value={{ items, addScannedItems }}>
      {children}
    </PantryContext.Provider>
  );
}

export function usePantry() {
  return useContext(PantryContext);
}
