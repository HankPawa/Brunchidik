#!/usr/bin/env node
// Diagnóstico previo: dice exactamente qué falta antes de arrancar el proyecto.
// Uso: npm run check

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const ok = (msg) => console.log(`  ✔ ${msg}`);
const fallo = (msg, ayuda) => {
  console.log(`  ✖ ${msg}`);
  if (ayuda) console.log(`      → ${ayuda}`);
  problemas += 1;
};
const aviso = (msg) => console.log(`  ⚠ ${msg}`);
let problemas = 0;

const puertoAbierto = (host, port, timeout = 1500) =>
  new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const cerrar = (resultado) => {
      socket.destroy();
      resolve(resultado);
    };
    socket.setTimeout(timeout);
    socket.on("connect", () => cerrar(true));
    socket.on("timeout", () => cerrar(false));
    socket.on("error", () => cerrar(false));
  });

console.log("\nRequisitos\n");

const mayor = Number(process.versions.node.split(".")[0]);
if (mayor >= 20) ok(`Node.js ${process.versions.node}`);
else fallo(`Node.js ${process.versions.node} es demasiado antiguo`, "Instala Node.js 20 o superior");

for (const [nombre, carpeta] of [
  ["api", "api"],
  ["frontend", "brunchie_design"],
]) {
  if (existsSync(path.join(raiz, carpeta, "node_modules"))) ok(`Dependencias de ${nombre} instaladas`);
  else fallo(`Faltan las dependencias de ${nombre}`, `npm --prefix ${carpeta} install`);
}

console.log("\nConfiguración\n");

const envPath = path.join(raiz, "api", ".env");
if (!existsSync(envPath)) {
  fallo("api/.env no existe", "Copia api/.env.example como api/.env y completa los valores");
} else {
  ok("api/.env encontrado");
  const { readEnv } = await import(new URL("../api/src/config/readEnv.js", import.meta.url));
  const { values, problems, warnings } = readEnv();
  for (const p of problems) fallo(p);
  for (const w of warnings) aviso(w);
  if (problems.length === 0) ok("Variables obligatorias presentes");

  console.log("\nServicios\n");

  const url = new URL(values.databaseUrl.replace(/^postgres(ql)?:/, "http:"));
  const puerto = Number(url.port || 5432);
  if (await puertoAbierto(url.hostname, puerto)) {
    ok(`PostgreSQL responde en ${url.hostname}:${puerto}`);
    try {
      execSync("npx prisma migrate status", { cwd: path.join(raiz, "api"), stdio: "pipe" });
      ok("Migraciones aplicadas");
    } catch {
      fallo("Faltan migraciones por aplicar", "npm run db:migrate");
    }
  } else {
    fallo(`No hay nada escuchando en ${url.hostname}:${puerto}`, "Arranca PostgreSQL o corrige DATABASE_URL");
  }

  if (!values.redisUrl) {
    aviso("REDIS_URL vacía: rate limiting y códigos 2FA en memoria (válido en desarrollo)");
  } else {
    const redis = new URL(values.redisUrl.replace(/^redis:/, "http:"));
    if (await puertoAbierto(redis.hostname, Number(redis.port || 6379))) ok("Redis responde");
    else aviso("REDIS_URL configurada pero Redis no responde: el 2FA fallará hasta que vuelva");
  }
}

console.log(
  problemas === 0
    ? "\nTodo listo. Arranca con: npm run dev\n"
    : `\n${problemas} problema(s) por resolver antes de arrancar.\n`,
);
process.exit(problemas === 0 ? 0 : 1);
