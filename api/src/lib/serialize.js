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
  visibleWeb: m.visibleWeb,
  visibleSalon: m.visibleSalon,
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

export const toMesa = (m) => ({
  id: num(m.id),
  numero: m.numero,
  nombre: m.nombre,
  capacidad: m.capacidad,
  activa: m.activa,
  // La mesa está ocupada si tiene una comanda abierta; no se guarda como estado.
  comandaAbiertaId: m.comandas?.length ? num(m.comandas[0].id) : null,
});

export const toComandaItem = (i) => ({
  id: num(i.id),
  menuItemId: num(i.menuItemId),
  nombre: i.nombreItem,
  precioUnitario: num(i.precioUnitario),
  cantidad: i.cantidad,
  subtotal: Number(i.precioUnitario) * i.cantidad,
  notas: i.notas,
  estado: i.estado,
  faltoStock: i.faltoStock,
  fechaCreacion: formatDateTime(i.fechaCreacion),
  fechaEnvio: formatDateTime(i.fechaEnvio),
  fechaListo: formatDateTime(i.fechaListo),
});

export const toComanda = (c) => {
  const items = (c.items ?? []).map(toComandaItem);
  return {
    id: num(c.id),
    mesaId: num(c.mesaId),
    mesaNumero: c.mesa?.numero ?? null,
    meseroId: num(c.meseroId),
    estado: c.estado,
    comensales: c.comensales,
    notas: c.notas,
    // Mientras está abierta el total se calcula al vuelo; al cerrar se congela.
    total: c.total !== null && c.total !== undefined ? num(c.total) : totalDeItems(items),
    metodoPago: c.metodoPago,
    tieneFaltante: c.tieneFaltante,
    fechaApertura: formatDateTime(c.fechaApertura),
    fechaCierre: formatDateTime(c.fechaCierre),
    items,
  };
};

export const totalDeItems = (items) =>
  items.filter((i) => i.estado !== "CANCELADO").reduce((suma, i) => suma + i.subtotal, 0);

export const toInsumo = (i) => ({
  id: num(i.id),
  nombre: i.nombre,
  unidad: i.unidad,
  stock: num(i.stock),
  stockMinimo: num(i.stockMinimo),
  activo: i.activo,
  // Se calcula aquí para que todas las pantallas coincidan en qué es "bajo".
  bajoMinimo: Number(i.stock) <= Number(i.stockMinimo),
});

export const toRecetaItem = (r) => ({
  insumoId: num(r.insumoId),
  nombre: r.insumo?.nombre ?? null,
  unidad: r.insumo?.unidad ?? null,
  cantidad: num(r.cantidad),
});

export const toMovimiento = (m) => ({
  id: num(m.id),
  insumoId: num(m.insumoId),
  insumo: m.insumo?.nombre ?? null,
  tipo: m.tipo,
  cantidad: num(m.cantidad),
  stockResultante: num(m.stockResultante),
  motivo: m.motivo,
  comandaItemId: num(m.comandaItemId),
  usuarioId: num(m.usuarioId),
  fecha: formatDateTime(m.fecha),
});

export const toAuditLog = (a) => ({
  id: num(a.id),
  accion: a.accion,
  detalle: a.detalle,
  fecha: formatDateTime(a.fecha),
  servicio: a.servicio,
});
