import { Router } from "express";
import { requireSelf } from "../../middleware/auth.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./controller.js";
import * as s from "./schemas.js";

export const usuariosRouter = Router();

usuariosRouter.post("/registro", rateLimit(5, 60), validate(s.registroSchema), c.registrar);
usuariosRouter.post("/login", rateLimit(10, 60), c.login);
usuariosRouter.post("/google-login", rateLimit(10, 60), c.loginConGoogle);
usuariosRouter.post("/2fa/enviar", rateLimit(5, 60), validate(s.enviarCodigoSchema), c.reenviarCodigo);
usuariosRouter.post("/2fa/verificar", rateLimit(10, 60), validate(s.verificarCodigoSchema), c.verificar);

usuariosRouter.patch("/:id/password", requireSelf(), validate(s.cambiarPasswordSchema), c.cambiarPassword);
usuariosRouter.patch("/:id/2fa", requireSelf(), validate(s.activoQuerySchema, "query"), c.cambiar2fa);
