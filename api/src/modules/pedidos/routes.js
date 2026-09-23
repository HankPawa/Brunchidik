import { Router } from "express";
import { optionalAuth, requireSelf } from "../../middleware/auth.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./controller.js";
import { crearPedidoSchema } from "./schemas.js";

export const pedidosRouter = Router();

pedidosRouter.post("/", rateLimit(10, 60), optionalAuth, validate(crearPedidoSchema), c.crear);
pedidosRouter.get("/usuario/:id", requireSelf(), c.listarDelUsuario);
