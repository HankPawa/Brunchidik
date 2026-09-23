import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const AuthContext = createContext(null);

const USER_KEY = "brunch_user";
const TOKEN_KEY = "brunch_token";

const tokenExpirado = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

// Las sesiones guardadas por el backend anterior no tienen token y ya no sirven.
const leerSesion = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    if (token && user && !tokenExpirado(token)) return { token, user };
  } catch {
    // sesión corrupta: se descarta
  }
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  return { token: null, user: null };
};

const jsonPost = (url, body) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const AuthProvider = ({ children }) => {
  const [sesion, setSesion] = useState(leerSesion);
  const [pendingUser, setPendingUser] = useState(null);
  const { user, token } = sesion;

  const tokenRef = useRef(token);
  tokenRef.current = token;

  useEffect(() => {
    if (user && token) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [user, token]);

  const logout = useCallback(() => {
    setSesion({ user: null, token: null });
    setPendingUser(null);
  }, []);

  const setUser = useCallback((updater) => {
    setSesion((prev) => ({
      ...prev,
      user: typeof updater === "function" ? updater(prev.user) : updater,
    }));
  }, []);

  const authFetch = useCallback(
    async (url, options = {}) => {
      const current = tokenRef.current;
      const headers = new Headers(options.headers);
      if (current) headers.set("Authorization", `Bearer ${current}`);
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401 && current) logout();
      return res;
    },
    [logout],
  );

  // El backend responde {...usuario, token} o {requiere2fa, usuarioId, email}.
  const procesarLogin = useCallback((data) => {
    if (data.requiere2fa) {
      setPendingUser({ id: data.usuarioId, email: data.email });
      return "2fa";
    }
    const { token: nuevoToken, ...usuario } = data;
    setSesion({ user: usuario, token: nuevoToken });
    return "success";
  }, []);

  const login = useCallback(
    async (email, password) => {
      try {
        const res = await jsonPost("/api/usuarios/login", { email, password });
        if (!res.ok) return "invalid";
        return procesarLogin(await res.json());
      } catch {
        return "error";
      }
    },
    [procesarLogin],
  );

  const loginWithGoogle = useCallback(
    async (accessToken) => {
      try {
        const res = await jsonPost("/api/usuarios/google-login", { accessToken });
        if (!res.ok) return "error";
        return procesarLogin(await res.json());
      } catch {
        return "error";
      }
    },
    [procesarLogin],
  );

  const register = useCallback(async (nombre, email, password) => {
    try {
      const res = await jsonPost("/api/usuarios/registro", { nombre, email, password });
      if (res.status === 400) return { ok: false, error: await res.text() };
      if (!res.ok) return { ok: false, error: "Error al registrar." };
      return { ok: true };
    } catch {
      return { ok: false, error: "No se pudo conectar al servidor." };
    }
  }, []);

  const changePassword = useCallback(
    async (actual, nueva) => {
      try {
        const res = await authFetch(`/api/usuarios/${user.id}/password`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actual, nueva }),
        });
        if (res.status === 401) return { ok: false, text: "Contraseña actual incorrecta." };
        if (res.status === 400) return { ok: false, text: await res.text() };
        if (!res.ok) return { ok: false, text: "Error al cambiar la contraseña." };
        return { ok: true, text: "Contraseña actualizada correctamente." };
      } catch {
        return { ok: false, text: "No se pudo conectar al servidor." };
      }
    },
    [authFetch, user?.id],
  );

  const verifyCode = useCallback(
    async (codigo) => {
      try {
        const res = await jsonPost("/api/usuarios/2fa/verificar", { usuarioId: pendingUser.id, codigo });
        if (!res.ok) return false;
        procesarLogin(await res.json());
        setPendingUser(null);
        return true;
      } catch {
        return false;
      }
    },
    [pendingUser, procesarLogin],
  );

  const reenviarCodigo = useCallback(async () => {
    try {
      const res = await jsonPost("/api/usuarios/2fa/enviar", { usuarioId: pendingUser.id });
      return res.ok;
    } catch {
      return false;
    }
  }, [pendingUser]);

  const toggle2fa = useCallback(
    async (activo) => {
      if (!user?.id) return { ok: false };
      try {
        const res = await authFetch(`/api/usuarios/${user.id}/2fa?activo=${activo}`, { method: "PATCH" });
        if (!res.ok) return { ok: false };
        setUser(await res.json());
        return { ok: true, activo };
      } catch {
        return { ok: false };
      }
    },
    [authFetch, setUser, user?.id],
  );

  const actualizarUsuario = useCallback((datos) => setUser((prev) => ({ ...prev, ...datos })), [setUser]);

  const value = useMemo(
    () => ({
      user,
      token,
      pendingUser,
      authFetch,
      login,
      loginWithGoogle,
      register,
      changePassword,
      verifyCode,
      reenviarCodigo,
      toggle2fa,
      actualizarUsuario,
      logout,
    }),
    [user, token, pendingUser, authFetch, login, loginWithGoogle, register, changePassword, verifyCode, reenviarCodigo, toggle2fa, actualizarUsuario, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
