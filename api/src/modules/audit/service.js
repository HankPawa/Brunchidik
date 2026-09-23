import { prisma } from "../../config/prisma.js";
import { toAuditLog } from "../../lib/serialize.js";
import { nowNaive } from "../../lib/time.js";

export const SERVICIO_MENU = "menu";
export const SERVICIO_PEDIDOS = "pedidos";

export function registrar(accion, detalle, servicio) {
  return prisma.auditLog.create({
    data: { accion, detalle: detalle.slice(0, 500), servicio, fecha: nowNaive() },
  });
}

export async function listar(servicio) {
  const logs = await prisma.auditLog.findMany({
    where: { servicio },
    orderBy: { fecha: "desc" },
    take: 100,
  });
  return logs.map(toAuditLog);
}
