import { createContext, useContext, useState, useEffect } from "react";

const DarkModeContext = createContext(null);
const KEY = "brunch_dark";

export const DarkModeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem(KEY) === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(KEY, String(dark));
  }, [dark]);

  return (
    <DarkModeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);
