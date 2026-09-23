import { prisma } from "../../config/prisma.js";
import { noEncontrado } from "../../lib/errors.js";
import { toPedido } from "../../lib/serialize.js";
import { nowNaive } from "../../lib/time.js";
import { publicar, TOPICS } from "../../ws/hub.js";
import * as audit from "../audit/service.js";

const conDetalles = { include: { detalles: { orderBy: { id: "asc" } } } };

export async function crear(req, res) {
  const { detalles, ...datos } = req.valid.body;
  const pedido = await prisma.pedido.create({
    ...conDetalles,
    data: {
      ...datos,
      estado: "PENDIENTE",
      fechaCreacion: nowNaive(),
      // El dueño sale del token, nunca del cuerpo: los invitados quedan sin usuario.
      usuarioId: req.user?.id ?? null,
      detalles: { create: detalles },
    },
  });

  const json = toPedido(pedido);
  publicar(TOPICS.adminPedidos, json);
  res.json(json);
}

export async function listarDelUsuario(req, res) {
  const pedidos = await prisma.pedido.findMany({
    ...conDetalles,
    where: { usuarioId: req.user.id },
    orderBy: { fechaCreacion: "desc" },
  });
  res.json(pedidos.map(toPedido));
}

// --- Admin ---

export async function listarTodos(req, res) {
  const pedidos = await prisma.pedido.findMany({ ...conDetalles, orderBy: { id: "asc" } });
  res.json(pedidos.map(toPedido));
}

export async function listarAuditoria(req, res) {
  res.json(await audit.listar(audit.SERVICIO_PEDIDOS));
}

export async function cambiarEstado(req, res) {
  const { id } = req.valid.params;
  const { estado } = req.valid.query;
  const existe = await prisma.pedido.findUnique({ where: { id }, select: { id: true } });
  if (!existe) throw noEncontrado("Pedido no encontrado");

  const pedido = await prisma.pedido.update({ ...conDetalles, where: { id }, data: { estado } });
  await audit.registrar("CAMBIAR_ESTADO_PEDIDO", `Cambió el pedido #${id} a ${estado}`, audit.SERVICIO_PEDIDOS);

  const json = toPedido(pedido);
  if (json.usuarioId) publicar(TOPICS.pedidoUsuario(json.usuarioId), json);
  publicar(TOPICS.adminPedidosEstado, json);
  res.json(json);
}
