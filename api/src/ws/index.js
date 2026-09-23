import { WebSocketServer } from "ws";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { verifyToken } from "../lib/jwt.js";
import { desuscribir, eliminarCliente, puedeSuscribirse, suscribir } from "./hub.js";

const RUTA = "/ws";
const HEARTBEAT_MS = 30_000;
const AUTH_TIMEOUT_MS = 5_000;

// Protocolo (JSON, un mensaje por frame):
//   cliente  -> {type:"auth", token} | {type:"subscribe"|"unsubscribe", topics:[...]} | {type:"ping"}
//   servidor -> {type:"ready"} | {type:"subscribed", topics} | {type:"message", topic, data}
//               {type:"pong"} | {type:"error", message, topic?}
// El token va en el primer mensaje, no en la URL, para que no quede en logs.

const enviar = (ws, payload) => {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
};

async function autenticar(ws, token) {
  const claims = typeof token === "string" ? verifyToken(token) : null;
  const usuario = claims
    ? await prisma.usuario.findUnique({ where: { id: claims.id }, select: { id: true, rol: true } })
    : null;
  if (!usuario) {
    enviar(ws, { type: "error", message: "Sesión inválida o expirada" });
    ws.close(4401, "unauthorized");
    return;
  }
  ws.user = { id: Number(usuario.id), rol: usuario.rol };
  clearTimeout(ws.authTimer);
  enviar(ws, { type: "ready" });
}

function cambiarSuscripciones(ws, tipo, topics) {
  if (!Array.isArray(topics)) {
    enviar(ws, { type: "error", message: "topics debe ser una lista" });
    return;
  }
  const aceptados = [];
  for (const topic of topics) {
    if (typeof topic !== "string") continue;
    if (tipo === "unsubscribe") {
      desuscribir(ws, topic);
    } else if (puedeSuscribirse(ws.user, topic)) {
      suscribir(ws, topic);
      aceptados.push(topic);
    } else {
      enviar(ws, { type: "error", topic, message: "No autorizado para este topic" });
    }
  }
  if (tipo === "subscribe") enviar(ws, { type: "subscribed", topics: aceptados });
}

async function alRecibir(ws, raw) {
  let mensaje;
  try {
    mensaje = JSON.parse(raw);
  } catch {
    enviar(ws, { type: "error", message: "Mensaje no es JSON válido" });
    return;
  }

  if (mensaje.type === "ping") return enviar(ws, { type: "pong" });
  if (mensaje.type === "auth") return autenticar(ws, mensaje.token);
  if (!ws.user) return enviar(ws, { type: "error", message: "Autentícate primero" });
  if (mensaje.type === "subscribe" || mensaje.type === "unsubscribe") {
    return cambiarSuscripciones(ws, mensaje.type, mensaje.topics);
  }
  enviar(ws, { type: "error", message: `Tipo de mensaje desconocido: ${mensaje.type}` });
}

export function attachWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 16 * 1024 });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = new URL(req.url, "http://localhost");
    const origin = req.headers.origin;
    if (pathname !== RUTA || (origin && !env.corsOrigins.includes(origin))) {
      socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
  });

  wss.on("connection", (ws) => {
    ws.user = null;
    ws.topics = new Set();
    ws.isAlive = true;
    ws.authTimer = setTimeout(() => {
      if (!ws.user) ws.close(4401, "auth timeout");
    }, AUTH_TIMEOUT_MS);

    ws.on("pong", () => {
      ws.isAlive = true;
    });
    ws.on("message", (raw) => {
      alRecibir(ws, raw.toString()).catch((err) => {
        console.error("✖ Error en WebSocket", err);
        enviar(ws, { type: "error", message: "Error interno" });
      });
    });
    ws.on("close", () => {
      clearTimeout(ws.authTimer);
      eliminarCliente(ws);
    });
  });

  // Los navegadores responden solos a los ping de protocolo.
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) {
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, HEARTBEAT_MS);
  heartbeat.unref();

  return {
    close() {
      clearInterval(heartbeat);
      for (const ws of wss.clients) ws.close(1001, "server shutdown");
      wss.close();
    },
  };
}
