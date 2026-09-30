import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SesionContext } from "./sesion";

// Claves propias: esta app y la web del restaurante son orígenes distintos y
// cada quien inicia sesión en su dispositivo.
const USER_KEY = "brunch_staff_user";
const TOKEN_KEY = "brunch_staff_token";

const tokenExpirado = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

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

export const AuthProvider = ({ children }) => {
  const [sesion, setSesion] = useState(leerSesion);
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

  const logout = useCallback(() => setSesion({ user: null, token: null }), []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return { ok: false, error: "Correo o contraseña incorrectos." };

      const data = await res.json();
      // El 2FA es para los clientes de la web; el personal no lo usa.
      if (data.requiere2fa) {
        return { ok: false, error: "Esta cuenta tiene verificación en dos pasos. Desactívala para usar comandas." };
      }
      if (data.rol === "USUARIO") {
        return { ok: false, error: "Esta cuenta es de cliente, no del personal del restaurante." };
      }

      const { token: nuevoToken, ...usuario } = data;
      setSesion({ user: usuario, token: nuevoToken });
      return { ok: true, rol: usuario.rol };
    } catch {
      return { ok: false, error: "No se pudo conectar con el servidor." };
    }
  }, []);

  // Inyecta el token y cierra sesión si el servidor dice que ya no vale.
  const authFetch = useCallback(
    async (url, options = {}) => {
      const actual = tokenRef.current;
      const headers = new Headers(options.headers);
      if (actual) headers.set("Authorization", `Bearer ${actual}`);
      if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

      const res = await fetch(url, { ...options, headers });
      if (res.status === 401 && actual) logout();
      return res;
    },
    [logout],
  );

  // Los errores de la API llegan como texto plano, listos para mostrar.
  const pedir = useCallback(
    async (url, options) => {
      const res = await authFetch(url, options);
      if (!res.ok) throw new Error((await res.text()) || "Algo salió mal");
      return res.status === 204 ? null : res.json();
    },
    [authFetch],
  );

  const value = useMemo(() => ({ user, token, login, logout, authFetch, pedir }), [user, token, login, logout, authFetch, pedir]);

  return <SesionContext.Provider value={value}>{children}</SesionContext.Provider>;
};
