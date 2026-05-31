import { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext(null);
const KEY = "brunch_favorites";

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggle = (item) =>
    setFavorites(prev =>
      prev.some(f => f.id === item.id)
        ? prev.filter(f => f.id !== item.id)
        : [...prev, item]
    );

  const isFav = (id) => favorites.some(f => f.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFav }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
