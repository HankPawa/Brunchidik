import { createContext, useContext, useState } from "react";

const FAKE_2FA_CODE = "123456";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return "invalid";
      const data = await res.json();
      if (data.dosFaActivo) { setPendingUser(data); return "2fa"; }
      setUser(data);
      return "success";
    } catch { return "error"; }
  };

  const loginWithGoogle = async (googleUser) => {
    try {
      const res = await fetch("/api/usuarios/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleUser.email,
          nombre: googleUser.name,
        }),
      });
      if (!res.ok) return "error";
      const data = await res.json();
      if (data.dosFaActivo) { setPendingUser(data); return "2fa"; }
      setUser(data);
      return "success";
    } catch { return "error"; }
  };

  const register = async (nombre, email, password) => {
    try {
      const res = await fetch("/api/usuarios/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });
      if (res.status === 400) return { ok: false, error: await res.text() };
      if (!res.ok) return { ok: false, error: "Error al registrar." };
      return { ok: true };
    } catch { return { ok: false, error: "No se pudo conectar al servidor." }; }
  };

  const changePassword = async (actual, nueva) => {
    try {
      const res = await fetch(`/api/usuarios/${user.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual, nueva }),
      });
      if (res.status === 401) return { ok: false, text: "Contraseña actual incorrecta." };
      if (!res.ok) return { ok: false, text: "Error al cambiar la contraseña." };
      return { ok: true, text: "Contraseña actualizada correctamente." };
    } catch { return { ok: false, text: "No se pudo conectar al servidor." }; }
  };

  const verifyCode = (code) => {
    if (code === FAKE_2FA_CODE && pendingUser) {
      setUser(pendingUser);
      setPendingUser(null);
      return true;
    }
    return false;
  };

  const toggle2fa = async (activo) => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/usuarios/${user.id}/2fa?activo=${activo}`, { method: "PATCH" });
      if (res.ok) setUser(await res.json());
    } catch {}
  };

  const logout = () => { setUser(null); setPendingUser(null); };

  return (
    <AuthContext.Provider value={{ user, pendingUser, login, loginWithGoogle, register, changePassword, verifyCode, toggle2fa, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
