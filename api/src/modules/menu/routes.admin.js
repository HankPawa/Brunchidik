import { Router } from "express";
import { idParams } from "../../lib/schemas.js";
import { requireAdmin } from "../../middleware/auth.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./controller.js";
import { menuItemSchema } from "./schemas.js";

export const adminMenuRouter = Router();
adminMenuRouter.use(requireAdmin);

const escrituras = rateLimit(30, 60, "admin-menu-escritura");

adminMenuRouter.get("/", c.listarTodos);
adminMenuRouter.get("/audit", c.listarAuditoria);
adminMenuRouter.post("/", escrituras, validate(menuItemSchema), c.crear);
adminMenuRouter.put("/:id", escrituras, validate(idParams, "params"), validate(menuItemSchema), c.actualizar);
adminMenuRouter.delete("/:id", escrituras, validate(idParams, "params"), c.eliminar);
