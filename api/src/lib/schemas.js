import { z } from "zod";
import { parseDate, parseDateTime, parseTime } from "./time.js";

export const texto = (campo, max = 255) =>
  z
    .string({ error: `${campo} es obligatorio` })
    .trim()
    .min(1, `${campo} es obligatorio`)
    .max(max, `${campo} es demasiado largo (máximo ${max} caracteres)`);

export const textoOpcional = (campo, max = 255) =>
  z
    .string()
    .trim()
    .max(max, `${campo} es demasiado largo (máximo ${max} caracteres)`)
    .nullish()
    .transform((v) => v || null);

export const email = z
  .string({ error: "El correo es obligatorio" })
  .trim()
  .max(255, "El correo es demasiado largo")
  .pipe(z.email({ error: "El correo no es válido" }));

export const id = z.coerce
  .number({ error: "Identificador inválido" })
  .int("Identificador inválido")
  .positive("Identificador inválido")
  .max(Number.MAX_SAFE_INTEGER, "Identificador inválido");

export const idParams = z.object({ id });

export const fecha = z
  .string({ error: "La fecha es obligatoria" })
  .transform((v, ctx) => {
    const date = parseDate(v);
    if (!date) ctx.addIssue({ code: "custom", message: "La fecha no es válida (formato AAAA-MM-DD)" });
    return date;
  });

export const hora = z
  .string({ error: "La hora es obligatoria" })
  .transform((v, ctx) => {
    const date = parseTime(v);
    if (!date) ctx.addIssue({ code: "custom", message: "La hora no es válida (formato HH:mm)" });
    return date;
  });

export const fechaHora = z.string().transform((v, ctx) => {
  const date = parseDateTime(v);
  if (!date) ctx.addIssue({ code: "custom", message: "La fecha y hora no son válidas" });
  return date;
});

export const booleanoQuery = z
  .enum(["true", "false"], { error: "El parámetro 'activo' debe ser true o false" })
  .transform((v) => v === "true");
