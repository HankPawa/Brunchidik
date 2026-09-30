import { Router } from "express";
import { idParams } from "../../lib/schemas.js";
import { requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./controller.js";
import { ajusteSchema, crearInsumoSchema, editarInsumoSchema, recetaSchema } from "./schemas.js";

export const adminInsumosRouter = Router();
adminInsumosRouter.use(requireAdmin);

adminInsumosRouter.get("/", c.listarInsumos);
adminInsumosRouter.post("/", validate(crearInsumoSchema), c.crearInsumo);
adminInsumosRouter.put("/:id", validate(idParams, "params"), validate(editarInsumoSchema), c.editarInsumo);
adminInsumosRouter.delete("/:id", validate(idParams, "params"), c.eliminarInsumo);
adminInsumosRouter.post("/:id/ajuste", validate(idParams, "params"), validate(ajusteSchema), c.ajustarStock);
adminInsumosRouter.get("/:id/movimientos", validate(idParams, "params"), c.listarMovimientos);

export const adminRecetasRouter = Router();
adminRecetasRouter.use(requireAdmin);

// Antes de "/:id" para que "faltantes" no se interprete como un identificador.
adminRecetasRouter.get("/faltantes", c.platosSinReceta);
adminRecetasRouter.get("/:id", validate(idParams, "params"), c.obtenerReceta);
adminRecetasRouter.put("/:id", validate(idParams, "params"), validate(recetaSchema), c.guardarReceta);
