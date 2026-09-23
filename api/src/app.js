import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { contactoRouter } from "./modules/contacto/routes.js";
import { adminMenuRouter } from "./modules/menu/routes.admin.js";
import { categoriasRouter, menuRouter } from "./modules/menu/routes.js";
import { adminPedidosRouter } from "./modules/pedidos/routes.admin.js";
import { pedidosRouter } from "./modules/pedidos/routes.js";
import { adminReservasRouter } from "./modules/reservas/routes.admin.js";
import { reservasRouter } from "./modules/reservas/routes.js";
import { usuariosRouter } from "./modules/usuarios/routes.js";

function cors(req, res, next) {
  const origin = req.get("origin");
  if (origin && env.corsOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
    res.set("Access-Control-Allow-Headers", "Authorization,Content-Type");
    res.set("Access-Control-Max-Age", "600");
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
}

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // Solo se confía en X-Forwarded-For de proxies locales (Vite, nginx, Docker),
  // así nadie puede falsear su IP para esquivar el rate limiting.
  app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

  app.use(cors);
  // Necesario para que el popup de Google pueda comunicarse con la ventana.
  app.use((req, res, next) => {
    res.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Límite general por IP. Es 5x el de cada servicio Java anterior porque ahora
  // una sola app atiende lo que antes repartían cinco.
  app.use("/api", rateLimit(300, 60, "global"));

  app.use("/api/usuarios", usuariosRouter);
  app.use("/api/categorias", categoriasRouter);
  app.use("/api/menu", menuRouter);
  app.use("/api/pedidos", pedidosRouter);
  app.use("/api/reservas", reservasRouter);
  app.use("/api/contacto", contactoRouter);
  app.use("/api/admin/menu", adminMenuRouter);
  app.use("/api/admin/pedidos", adminPedidosRouter);
  app.use("/api/admin/reservas", adminReservasRouter);

  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}
