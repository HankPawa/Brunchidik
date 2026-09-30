// Registro en memoria de qué conexiones escuchan cada topic.
const suscriptores = new Map();

export const TOPICS = {
  adminPedidos: "/topic/admin/pedidos",
  adminPedidosEstado: "/topic/admin/pedidos/estado",
  adminReservas: "/topic/admin/reservas",
  adminInventario: "/topic/admin/inventario",
  pedidoUsuario: (usuarioId) => `/topic/usuario/${usuarioId}/pedido`,
  // Salón: la cocina ve los platos que entran; el salón, los que quedan listos.
  cocina: "/topic/cocina",
  salon: "/topic/salon",
  comandasMesero: (meseroId) => `/topic/mesero/${meseroId}/comandas`,
};

const PEDIDO_USUARIO_RE = /^\/topic\/usuario\/(\d+)\/pedido$/;
const COMANDAS_MESERO_RE = /^\/topic\/mesero\/(\d+)\/comandas$/;

export function puedeSuscribirse(user, topic) {
  const esAdmin = user.rol === "ADMIN";

  if (topic.startsWith("/topic/admin/")) return esAdmin;
  if (topic === TOPICS.cocina) return esAdmin || user.rol === "COCINA";
  if (topic === TOPICS.salon) return esAdmin || user.rol === "MESERO" || user.rol === "COCINA";

  const mesero = COMANDAS_MESERO_RE.exec(topic);
  if (mesero) return esAdmin || Number(mesero[1]) === user.id;

  const usuario = PEDIDO_USUARIO_RE.exec(topic);
  return Boolean(usuario) && Number(usuario[1]) === user.id;
}

export function suscribir(ws, topic) {
  if (!suscriptores.has(topic)) suscriptores.set(topic, new Set());
  suscriptores.get(topic).add(ws);
  ws.topics.add(topic);
}

export function desuscribir(ws, topic) {
  suscriptores.get(topic)?.delete(ws);
  if (suscriptores.get(topic)?.size === 0) suscriptores.delete(topic);
  ws.topics.delete(topic);
}

export function eliminarCliente(ws) {
  for (const topic of [...ws.topics]) desuscribir(ws, topic);
}

export function publicar(topic, data) {
  const clientes = suscriptores.get(topic);
  if (!clientes) return;
  const mensaje = JSON.stringify({ type: "message", topic, data });
  for (const ws of clientes) {
    if (ws.readyState === ws.OPEN) ws.send(mensaje);
  }
}
