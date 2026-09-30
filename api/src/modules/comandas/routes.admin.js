import { Router } from "express";
import { idParams } from "../../lib/schemas.js";
import { requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./controller.js";
import { mesaSchema } from "./schemas.js";

// El salón lee las mesas con GET /api/mesas; aquí solo se administran.
export const adminMesasRouter = Router();
adminMesasRouter.use(requireAdmin);

adminMesasRouter.get("/", c.listarMesasAdmin);
adminMesasRouter.post("/", validate(mesaSchema), c.crearMesa);
adminMesasRouter.put("/:id", validate(idParams, "params"), validate(mesaSchema), c.editarMesa);
adminMesasRouter.delete("/:id", validate(idParams, "params"), c.eliminarMesa);
