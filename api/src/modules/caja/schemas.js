import { z } from "zod";
import { texto, textoOpcional } from "../../lib/schemas.js";

export const TIPOS_MOVIMIENTO = ["INGRESO", "EGRESO"];

// El dinero se guarda con 2 decimales. Se acepta un tope alto pero finito: un
// cero de más al teclear no debe poder descuadrar el arqueo de forma silenciosa.
const dinero = (campo, { minimo = 0 } = {}) =>
  z.coerce
    .number({ error: `${campo} es obligatorio` })
    .min(minimo, minimo === 0 ? `${campo} no puede ser negativo` : `${campo} debe ser mayor que ${minimo}`)
    .max(999_999_999, `${campo} es demasiado alto`);

export const abrirCajaSchema = z.object({
  baseInicial: dinero("La base inicial"),
  notas: textoOpcional("Las notas"),
});

export const movimientoSchema = z.object({
  tipo: z.enum(TIPOS_MOVIMIENTO, { error: "El tipo debe ser INGRESO o EGRESO" }),
  // El concepto es obligatorio a propósito: un movimiento de caja sin explicar
  // es exactamente lo que después nadie sabe justificar.
  concepto: texto("El concepto"),
  monto: dinero("El monto", { minimo: 0.01 }),
});

export const cerrarCajaSchema = z.object({
  contadoEfectivo: dinero("El efectivo contado"),
  contadoTarjeta: dinero("El total de tarjeta"),
  contadoTransferencia: dinero("El total de transferencias"),
  notas: textoOpcional("Las notas"),
});
