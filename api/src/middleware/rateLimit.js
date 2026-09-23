import { store } from "../config/store.js";

// Ventana fija por IP. La clave usa el patrón de la ruta (/api/pedidos/:id), no
// la URL concreta, para que /api/pedidos/7 y /api/pedidos/8 compartan el límite.
export function rateLimit(limit, windowSec, scope) {
  return async (req, res, next) => {
    const name = scope ?? `${req.method}:${req.baseUrl}${req.route?.path ?? ""}`;
    const count = await store.hit(`rl:${name}:${req.ip}`, windowSec);
    if (count > limit) {
      res.set("Retry-After", String(windowSec));
      return res.status(429).json({ error: "Too many requests", retryAfter: windowSec });
    }
    next();
  };
}
