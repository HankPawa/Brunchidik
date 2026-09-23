// Registro en memoria de qué conexiones escuchan cada topic.
const suscriptores = new Map();

export const TOPICS = {
  adminPedidos: "/topic/admin/pedidos",
  adminPedidosEstado: "/topic/admin/pedidos/estado",
  adminReservas: "/topic/admin/reservas",
  pedidoUsuario: (usuarioId) => `/topic/usuario/${usuarioId}/pedido`,
};

const PEDIDO_USUARIO_RE = /^\/topic\/usuario\/(\d+)\/pedido$/;

export function puedeSuscribirse(user, topic) {
  if (topic.startsWith("/topic/admin/")) return user.rol === "ADMIN";
  const match = PEDIDO_USUARIO_RE.exec(topic);
  return Boolean(match) && Number(match[1]) === user.id;
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
