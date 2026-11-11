import { env } from "./env.js";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Con Neon la conexión va por WebSocket en el puerto 443 en lugar del 5432 de
// PostgreSQL. Muchas redes (la de la universidad, la de algunos locales) cortan
// el 5432 aunque haya internet, y con el 443 la API funciona en cualquiera de
// ellas. Cualquier otro PostgreSQL (Docker, la integración continua, uno local)
// sigue por la conexión normal.
//
// Las migraciones (prisma migrate) no pasan por aquí: usan siempre el 5432.
function crearCliente() {
  const url = new URL(env.databaseUrl);
  if (!url.hostname.endsWith(".neon.tech")) return new PrismaClient();

  neonConfig.webSocketConstructor = ws;
  // "schema" es un parámetro de Prisma, no de PostgreSQL: el servidor lo
  // rechazaría como opción desconocida.
  const esquema = url.searchParams.get("schema") ?? "public";
  url.searchParams.delete("schema");
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString: url.toString() }, { schema: esquema }) });
}

export const prisma = crearCliente();
