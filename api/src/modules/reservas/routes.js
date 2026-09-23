import { Router } from "express";
import { idParams } from "../../lib/schemas.js";
import { requireAuth, requireSelf } from "../../middleware/auth.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./controller.js";
import { crearReservaSchema } from "./schemas.js";

export const reservasRouter = Router();

reservasRouter.post("/", rateLimit(5, 60), requireAuth, validate(crearReservaSchema), c.crear);
reservasRouter.get("/usuario/:id", requireSelf(), c.listarDelUsuario);
reservasRouter.delete("/:id", requireAuth, validate(idParams, "params"), c.cancelarPropia);
