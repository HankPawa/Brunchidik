import { Router } from "express";
import { idParams } from "../../lib/schemas.js";
import { requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./controller.js";
import { estadoQuerySchema } from "./schemas.js";

export const adminPedidosRouter = Router();
adminPedidosRouter.use(requireAdmin);

adminPedidosRouter.get("/", c.listarTodos);
adminPedidosRouter.get("/audit", c.listarAuditoria);
adminPedidosRouter.patch(
  "/:id/estado",
  validate(idParams, "params"),
  validate(estadoQuerySchema, "query"),
  c.cambiarEstado,
);
