import { Router } from "express";
import { idParams } from "../../lib/schemas.js";
import { ROL } from "../../lib/roles.js";
import { requireRol } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./controller.js";
import * as s from "./schemas.js";

const salon = requireRol(ROL.MESERO, ROL.ADMIN);
const cocina = requireRol(ROL.COCINA, ROL.ADMIN);

export const mesasRouter = Router();
mesasRouter.get("/", requireRol(ROL.MESERO, ROL.COCINA, ROL.ADMIN), c.listarMesas);

export const comandasRouter = Router();
comandasRouter.use(salon);

comandasRouter.get("/", c.listar);
comandasRouter.post("/", validate(s.abrirComandaSchema), c.abrir);
comandasRouter.get("/:id", validate(idParams, "params"), c.detalle);
comandasRouter.post("/:id/items", validate(idParams, "params"), validate(s.agregarItemSchema), c.agregarItem);
comandasRouter.patch("/:id/items/:itemId", validate(s.itemParams, "params"), validate(s.editarItemSchema), c.editarItem);
comandasRouter.delete("/:id/items/:itemId", validate(s.itemParams, "params"), c.quitarItem);
comandasRouter.post("/:id/items/:itemId/cancelar", validate(s.itemParams, "params"), c.cancelarItem);
comandasRouter.post("/:id/items/:itemId/entregar", validate(s.itemParams, "params"), c.entregarItem);
comandasRouter.post("/:id/enviar", validate(idParams, "params"), c.enviarACocina);
comandasRouter.post("/:id/cerrar", validate(idParams, "params"), validate(s.cerrarComandaSchema), c.cerrar);

export const cocinaRouter = Router();
cocinaRouter.use(cocina);

cocinaRouter.get("/pendientes", c.colaCocina);
cocinaRouter.patch("/items/:id", validate(idParams, "params"), validate(s.estadoCocinaSchema), c.cambiarEstadoCocina);
