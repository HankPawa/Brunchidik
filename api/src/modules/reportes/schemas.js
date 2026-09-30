import { z } from "zod";
import { fecha } from "../../lib/schemas.js";

// Rango de fechas inclusivo en los dos extremos: "del 1 al 30" incluye el 30
// completo. El controlador traduce ese día a "< 1 de octubre" al consultar.
export const rangoSchema = z
  .object({
    desde: fecha.optional(),
    hasta: fecha.optional(),
  })
  .refine((v) => !v.desde || !v.hasta || v.desde <= v.hasta, {
    error: "La fecha inicial no puede ser posterior a la final",
    path: ["desde"],
  });
