import { createContext, useContext, useState, useEffect, useMemo } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("brunch_user")); } catch { return null; }
  });
  const [pendingUser, setPendingUser] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem("brunch_user", JSON.stringify(user));
    else localStorage.removeItem("brunch_user");
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return "invalid";
      const data = await res.json();
      if (data.requiere2fa) {
        setPendingUser({ id: data.usuarioId, email: data.email });
        return "2fa";
      }
      setUser(data);
      return "success";
    } catch { return "error"; }
  };

  const loginWithGoogle = async (googleUser) => {
    try {
      const res = await fetch("/api/usuarios/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: googleUser.email, nombre: googleUser.name }),
      });
      if (!res.ok) return "error";
      const data = await res.json();
      if (data.requiere2fa) {
        setPendingUser({ id: data.usuarioId, email: data.email });
        return "2fa";
      }
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

  const verifyCode = async (codigo) => {
    try {
      const res = await fetch("/api/usuarios/2fa/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: pendingUser.id, codigo }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setUser(data);
      setPendingUser(null);
      return true;
    } catch { return false; }
  };

  const reenviarCodigo = async () => {
    try {
      await fetch("/api/usuarios/2fa/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: pendingUser.id }),
      });
    } catch {}
  };

  const toggle2fa = async (activo) => {
    if (!user?.id) return { ok: false };
    try {
      const res = await fetch(`/api/usuarios/${user.id}/2fa?activo=${activo}`, { method: "PATCH" });
      if (res.ok) { setUser(await res.json()); return { ok: true, activo }; }
      return { ok: false };
    } catch { return { ok: false }; }
  };

  const actualizarUsuario = (datos) => {
    setUser((prev) => ({ ...prev, ...datos }));
  };

  const logout = () => { setUser(null); setPendingUser(null); };

  const value = useMemo(() => ({
    user, pendingUser, login, loginWithGoogle, register,
    changePassword, verifyCode, reenviarCodigo, toggle2fa, actualizarUsuario, logout,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user, pendingUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
