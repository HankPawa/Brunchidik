import { formatDate, formatDateTime, formatTime } from "./time.js";

// Ningún controlador devuelve un objeto de Prisma directamente: estos mappers
// fijan la forma exacta del JSON que el frontend ya consume.

const num = (value) => (value === null || value === undefined ? null : Number(value));

export const toUsuario = (u) => ({
  id: num(u.id),
  nombre: u.nombre,
  email: u.email,
  dosFaActivo: u.dosFaActivo,
  cuentaGoogle: u.cuentaGoogle,
  rol: u.rol ?? "USUARIO",
});

export const toMenuItem = (m) => ({
  id: num(m.id),
  nombre: m.nombre,
  descripcion: m.descripcion,
  precio: num(m.precio),
  imagenUrl: m.imagenUrl,
  disponible: m.disponible,
  categoriaId: num(m.categoriaId),
});

export const toCategoria = (c) => ({
  id: num(c.id),
  nombre: c.nombre,
  items: (c.items ?? []).map(toMenuItem),
});

export const toDetalle = (d) => ({
  id: num(d.id),
  cantidad: d.cantidad,
  precioUnitario: num(d.precioUnitario),
  menuItemId: num(d.menuItemId),
});

export const toPedido = (p) => ({
  id: num(p.id),
  direccion: p.direccion,
  telefono: p.telefono,
  metodoPago: p.metodoPago,
  notas: p.notas,
  total: num(p.total),
  estado: p.estado,
  fechaCreacion: formatDateTime(p.fechaCreacion),
  fechaProgramada: formatDateTime(p.fechaProgramada),
  usuarioId: num(p.usuarioId),
  detalles: (p.detalles ?? []).map(toDetalle),
});

export const toReserva = (r) => ({
  id: num(r.id),
  nombre: r.nombre,
  email: r.email,
  fecha: formatDate(r.fecha),
  hora: formatTime(r.hora),
  personas: r.personas,
  ocasion: r.ocasion,
  notas: r.notas,
  estado: r.estado,
  usuarioId: num(r.usuarioId),
});

export const toMensajeContacto = (m) => ({
  id: num(m.id),
  nombre: m.nombre,
  email: m.email,
  telefono: m.telefono,
  mensaje: m.mensaje,
  fechaEnvio: formatDateTime(m.fechaEnvio),
});

export const toAuditLog = (a) => ({
  id: num(a.id),
  accion: a.accion,
  detalle: a.detalle,
  fecha: formatDateTime(a.fecha),
  servicio: a.servicio,
});
