import { Router } from "express";
import { idParams } from "../../lib/schemas.js";
import { requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./controller.js";
import { estadoQuerySchema } from "./schemas.js";

export const adminReservasRouter = Router();
adminReservasRouter.use(requireAdmin);

adminReservasRouter.get("/", c.listarTodas);
adminReservasRouter.patch(
  "/:id/estado",
  validate(idParams, "params"),
  validate(estadoQuerySchema, "query"),
  c.cambiarEstado,
);
adminReservasRouter.delete("/:id", validate(idParams, "params"), c.eliminar);
