import { nowNaive } from "../../lib/time.js";

/**
 * Aplica un movimiento de inventario dentro de una transacción.
 *
 * El descuento se hace con un `increment` de Prisma, que genera
 * `SET stock = stock + $1`: la propia sentencia toma el bloqueo de la fila y lee
 * el valor ya comprometido, así que dos meseros enviando a la vez se serializan
 * y ningún descuento se pierde. Nunca leer el stock y escribirlo después.
 *
 * @param {number} cantidad Con signo: negativa al consumir, positiva al reponer.
 */
export async function aplicarMovimiento(tx, { insumoId, tipo, cantidad, motivo, comandaItemId, usuarioId }) {
  const insumo = await tx.insumo.update({
    where: { id: insumoId },
    data: { stock: { increment: cantidad } },
  });

  await tx.movimientoInventario.create({
    data: {
      insumoId,
      tipo,
      cantidad,
      stockResultante: insumo.stock,
      motivo: motivo ?? null,
      comandaItemId: comandaItemId ?? null,
      usuarioId: usuarioId ?? null,
      fecha: nowNaive(),
    },
  });

  return insumo;
}

// Para evitar interbloqueos cuando dos transacciones tocan los mismos insumos,
// siempre se aplican en el mismo orden.
export const ordenarPorInsumo = (consumos) => [...consumos].sort((a, b) => a.insumoId - b.insumoId);
