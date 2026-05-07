import { createContext, useContext, useState } from "react";

const FAKE_USERS = [
  { email: "admin@brunch.com", password: "brunch123", nombre: "Admin Brunch" },
  { email: "demo@brunch.com",  password: "demo123",   nombre: "Usuario Demo" },
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    const found = FAKE_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      setUser({ email: found.email, nombre: found.nombre });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
