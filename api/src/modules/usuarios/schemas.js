import { z } from "zod";
import { booleanoQuery, email, id, texto } from "../../lib/schemas.js";

// bcrypt solo usa los primeros 72 bytes: más allá, dos contraseñas distintas coincidirían.
const passwordNueva = z
  .string({ error: "La contraseña es obligatoria" })
  .min(1, "La contraseña es obligatoria")
  .max(72, "La contraseña es demasiado larga (máximo 72 caracteres)");

export const registroSchema = z.object({
  nombre: texto("El nombre"),
  email,
  password: passwordNueva,
});

export const enviarCodigoSchema = z.object({ usuarioId: id });

export const verificarCodigoSchema = z.object({
  usuarioId: id,
  codigo: z.coerce.string({ error: "El código es obligatorio" }).trim(),
});

export const cambiarPasswordSchema = z.object({
  actual: z.string({ error: "La contraseña actual es obligatoria" }),
  nueva: passwordNueva,
});

export const activoQuerySchema = z.object({ activo: booleanoQuery });
