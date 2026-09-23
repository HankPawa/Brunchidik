import { z } from "zod";
import { fechaHora, id, texto, textoOpcional } from "../../lib/schemas.js";
import { nowNaive } from "../../lib/time.js";

export const ESTADOS_PEDIDO = ["PENDIENTE", "EN_PREPARACION", "EN_CAMINO", "ENTREGADO", "CANCELADO"];

const monto = (campo) =>
  z.coerce
    .number({ error: `${campo} es obligatorio` })
    .min(0, `${campo} no puede ser negativo`)
    .max(999_999_999_999, `${campo} es demasiado alto`);

// Horario de entregas programadas: lunes a viernes 8:00-16:00,
// sábados 9:00-16:00, domingos sin servicio.
const HORARIO = { 1: [8, 16], 2: [8, 16], 3: [8, 16], 4: [8, 16], 5: [8, 16], 6: [9, 16] };

function validarHorario(fecha, ctx) {
  const rango = HORARIO[fecha.getUTCDay()];
  if (!rango) {
    ctx.addIssue({ code: "custom", message: "No realizamos entregas los domingos" });
    return;
  }
  const minutos = fecha.getUTCHours() * 60 + fecha.getUTCMinutes();
  const [desde, hasta] = rango;
  if (minutos < desde * 60 || minutos > hasta * 60) {
    ctx.addIssue({
      code: "custom",
      message: `La hora de entrega debe estar entre las ${desde}:00 y las ${hasta}:00`,
    });
  }
  if (fecha < nowNaive()) {
    ctx.addIssue({ code: "custom", message: "La fecha programada no puede ser en el pasado" });
  }
}

export const crearPedidoSchema = z.object({
  direccion: texto("La dirección"),
  telefono: texto("El teléfono"),
  metodoPago: textoOpcional("El método de pago"),
  notas: textoOpcional("Las notas"),
  total: monto("El total"),
  fechaProgramada: fechaHora.nullish().superRefine((fecha, ctx) => {
    if (fecha) validarHorario(fecha, ctx);
  }),
  detalles: z
    .array(
      z.object({
        cantidad: z.coerce
          .number({ error: "La cantidad es obligatoria" })
          .int("La cantidad debe ser un número entero")
          .min(1, "La cantidad mínima es 1"),
        precioUnitario: monto("El precio unitario"),
        menuItemId: id,
      }),
      { error: "El pedido debe incluir productos" },
    )
    .min(1, "El pedido debe incluir al menos un producto"),
});

export const estadoQuerySchema = z.object({
  estado: z.enum(ESTADOS_PEDIDO, { error: "Estado de pedido inválido" }),
});
