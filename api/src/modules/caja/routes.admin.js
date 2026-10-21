import { Router } from "express";
import { idParams } from "../../lib/schemas.js";
import { requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./controller.js";
import { abrirCajaSchema, cerrarCajaSchema, movimientoSchema } from "./schemas.js";

export const adminCajaRouter = Router();
adminCajaRouter.use(requireAdmin);

adminCajaRouter.get("/", c.actual);
adminCajaRouter.post("/abrir", validate(abrirCajaSchema), c.abrir);
adminCajaRouter.post("/cerrar", validate(cerrarCajaSchema), c.cerrar);
adminCajaRouter.post("/movimientos", validate(movimientoSchema), c.registrarMovimiento);
adminCajaRouter.delete("/movimientos/:id", validate(idParams, "params"), c.anularMovimiento);

// El historial va después de /abrir y /cerrar para que esas rutas no caigan en
// el comodín de :id.
adminCajaRouter.get("/historial", c.historial);
adminCajaRouter.get("/:id", validate(idParams, "params"), c.detalle);
