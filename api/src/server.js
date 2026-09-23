import http from "node:http";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { store } from "./config/store.js";
import { createApp } from "./app.js";
import { seed } from "./seed/index.js";
import { attachWebSocket } from "./ws/index.js";

async function comprobarBaseDeDatos() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    console.error(
      "\n✖ No se pudo conectar a PostgreSQL.\n" +
        "  - ¿Está corriendo el servidor de Postgres?\n" +
        "  - ¿DATABASE_URL en api/.env apunta a la base correcta?\n" +
        `  Detalle: ${err.message.split("\n").at(-1)}\n`,
    );
    process.exit(1);
  }

  try {
    await seed();
  } catch (err) {
    if (err.code === "P2021") {
      console.error("\n✖ Faltan tablas en la base. Ejecuta: npm run db:setup (dentro de api/)\n");
      process.exit(1);
    }
    throw err;
  }
}

await comprobarBaseDeDatos();

const server = http.createServer(createApp());
const ws = attachWebSocket(server);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n✖ El puerto ${env.port} ya está en uso. Cambia PORT en api/.env o cierra el otro proceso.\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(env.port, () => {
  console.log(`✔ API escuchando en http://localhost:${env.port} (WebSocket en /ws)`);
});

let cerrando = false;
async function apagar(signal) {
  if (cerrando) return;
  cerrando = true;
  console.log(`\n${signal} recibido, cerrando...`);
  ws.close();
  server.close();
  await Promise.allSettled([prisma.$disconnect(), store.close()]);
  process.exit(0);
}

process.on("SIGINT", apagar);
process.on("SIGTERM", apagar);
