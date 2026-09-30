import { Router } from "express";
import { requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as c from "./controller.js";
import { rangoSchema } from "./schemas.js";

export const adminReportesRouter = Router();
adminReportesRouter.use(requireAdmin);

adminReportesRouter.get("/ventas", validate(rangoSchema, "query"), c.ventas);
adminReportesRouter.get("/consumo", validate(rangoSchema, "query"), c.consumo);
