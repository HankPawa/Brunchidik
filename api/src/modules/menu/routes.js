import { Router } from "express";
import { idParams } from "../../lib/schemas.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./controller.js";

export const categoriasRouter = Router();
categoriasRouter.get("/", c.listarCategorias);

export const menuRouter = Router();
menuRouter.get("/", c.listarDisponibles);
menuRouter.get("/categoria/:id", validate(idParams, "params"), c.listarPorCategoria);
menuRouter.get("/:id", validate(idParams, "params"), c.obtenerItem);
