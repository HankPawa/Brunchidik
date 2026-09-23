import { z } from "zod";
import { email, fecha, hora, texto, textoOpcional } from "../../lib/schemas.js";
import { todayNaive } from "../../lib/time.js";

export const ESTADOS_RESERVA = ["PENDIENTE", "CONFIRMADA", "CANCELADA"];

export const crearReservaSchema = z.object({
  nombre: texto("El nombre"),
  email,
  fecha: fecha.refine((f) => !f || f >= todayNaive(), "La fecha de reserva no puede ser en el pasado"),
  hora,
  personas: z.coerce
    .number({ error: "El número de personas es obligatorio" })
    .int("El número de personas debe ser entero")
    .min(1, "Debe haber al menos 1 persona")
    .max(100, "Para grupos de más de 100 personas contáctanos directamente"),
  ocasion: textoOpcional("La ocasión"),
  notas: textoOpcional("Las notas"),
});

export const estadoQuerySchema = z.object({
  estado: z.enum(ESTADOS_RESERVA, { error: "Estado de reserva inválido" }),
});
