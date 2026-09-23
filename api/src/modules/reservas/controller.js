import { prisma } from "../../config/prisma.js";
import { noEncontrado } from "../../lib/errors.js";
import { toReserva } from "../../lib/serialize.js";
import { enviarConfirmacionReserva } from "../../services/email.js";
import { publicar, TOPICS } from "../../ws/hub.js";

const porId = { orderBy: { id: "asc" } };

export async function crear(req, res) {
  const reserva = await prisma.reserva.create({
    data: { ...req.valid.body, estado: "PENDIENTE", usuarioId: req.user.id },
  });

  // La confirmación por correo es una cortesía: si falla, la reserva sigue en pie.
  enviarConfirmacionReserva(reserva).catch((err) => {
    console.error(`✖ Error enviando confirmación de reserva #${reserva.id}: ${err.message}`);
  });

  const json = toReserva(reserva);
  publicar(TOPICS.adminReservas, json);
  res.json(json);
}

export async function listarDelUsuario(req, res) {
  const reservas = await prisma.reserva.findMany({ ...porId, where: { usuarioId: req.user.id } });
  res.json(reservas.map(toReserva));
}

// Responde 404 tanto si no existe como si es de otro usuario, para no revelar
// qué ids existen.
export async function cancelarPropia(req, res) {
  const { count } = await prisma.reserva.deleteMany({
    where: { id: req.valid.params.id, usuarioId: req.user.id },
  });
  if (count === 0) throw noEncontrado("Reserva no encontrada");
  res.status(204).end();
}

// --- Admin ---

export async function listarTodas(req, res) {
  const reservas = await prisma.reserva.findMany(porId);
  res.json(reservas.map(toReserva));
}

export async function cambiarEstado(req, res) {
  const { id } = req.valid.params;
  const existe = await prisma.reserva.findUnique({ where: { id }, select: { id: true } });
  if (!existe) throw noEncontrado("Reserva no encontrada");

  const reserva = await prisma.reserva.update({ where: { id }, data: { estado: req.valid.query.estado } });
  res.json(toReserva(reserva));
}

export async function eliminar(req, res) {
  await prisma.reserva.deleteMany({ where: { id: req.valid.params.id } });
  res.status(204).end();
}
