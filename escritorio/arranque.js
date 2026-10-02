import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Error con lo que el usuario necesita leer para arreglarlo él mismo. En un
// ejecutable no hay consola donde mirar: si algo falla, esto es todo lo que hay.
export class FalloArranque extends Error {
  constructor(titulo, detalle, consejos = []) {
    super(titulo);
    this.titulo = titulo;
    this.detalle = detalle;
    this.consejos = consejos;
  }
}

const PUERTO_POR_DEFECTO = 8080;

// --- Configuración ---

const leerArchivoEnv = (ruta) => {
  if (!fs.existsSync(ruta)) return null;
  const valores = {};
  for (const linea of fs.readFileSync(ruta, "utf8").split(/\r?\n/)) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith("#")) continue;
    const corte = limpia.indexOf("=");
    if (corte === -1) continue;
    valores[limpia.slice(0, corte).trim()] = limpia.slice(corte + 1).trim();
  }
  return valores;
};

// La configuración vive en la carpeta de datos del usuario, no junto al programa:
// dentro de "Archivos de programa" no se puede escribir sin permisos de administrador.
function asegurarConfiguracion({ rutaConfig, envDesarrollo }) {
  const existente = leerArchivoEnv(rutaConfig);
  if (existente) return existente;

  // Primer arranque. En desarrollo se heredan los valores de api/.env para seguir
  // apuntando a la misma base y, sobre todo, conservar el JWT_SECRET: si cambiara,
  // todas las sesiones abiertas se caerían.
  const heredados = envDesarrollo ? (leerArchivoEnv(envDesarrollo) ?? {}) : {};

  const valores = {
    DATABASE_URL: heredados.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/brunch_db?schema=public",
    JWT_SECRET: heredados.JWT_SECRET ?? crypto.randomBytes(48).toString("hex"),
    PORT: heredados.PORT ?? String(PUERTO_POR_DEFECTO),
    MAIL_HOST: heredados.MAIL_HOST ?? "",
    MAIL_PORT: heredados.MAIL_PORT ?? "",
    MAIL_USER: heredados.MAIL_USER ?? "",
    MAIL_PASSWORD: heredados.MAIL_PASSWORD ?? "",
    REDIS_URL: heredados.REDIS_URL ?? "",
  };

  fs.mkdirSync(path.dirname(rutaConfig), { recursive: true });
  fs.writeFileSync(
    rutaConfig,
    [
      "# Configuración de Montis Plaza Comandas.",
      "# Se creó sola en el primer arranque. Puedes editarla y reiniciar el programa.",
      "",
      "# Conexión a PostgreSQL. Si cambiaste la contraseña de postgres, cámbiala aquí.",
      `DATABASE_URL=${valores.DATABASE_URL}`,
      "",
      "# Firma de las sesiones. NO la cambies: si lo haces, todos tendrán que volver a entrar.",
      `JWT_SECRET=${valores.JWT_SECRET}`,
      "",
      "# Puerto del servidor. Es el que teclean los meseros en el celular.",
      `PORT=${valores.PORT}`,
      "",
      "# Correo saliente (opcional). Sin esto los códigos de verificación no se envían.",
      `MAIL_HOST=${valores.MAIL_HOST}`,
      `MAIL_PORT=${valores.MAIL_PORT}`,
      `MAIL_USER=${valores.MAIL_USER}`,
      `MAIL_PASSWORD=${valores.MAIL_PASSWORD}`,
      "",
      "# Redis (opcional). Vacío = todo en memoria.",
      `REDIS_URL=${valores.REDIS_URL}`,
      "",
    ].join("\n"),
    "utf8",
  );

  return valores;
}

// --- Red local ---

// Las IPv4 reales de la máquina, sin loopback ni interfaces virtuales. Es la
// dirección que teclean los meseros y, además, el Origin que el WebSocket exige.
export function direccionesDeRed(puerto) {
  const encontradas = [];
  for (const [nombre, interfaces] of Object.entries(os.networkInterfaces())) {
    for (const red of interfaces ?? []) {
      if (red.family !== "IPv4" || red.internal) continue;
      if (/^169\.254\./.test(red.address)) continue; // sin DHCP: no sirve a nadie
      encontradas.push({ nombre, ip: red.address, url: `http://${red.address}:${puerto}` });
    }
  }
  return encontradas;
}

// --- Arranque ---

export async function arrancar({
  rutaConfig,
  raizApi,
  directorioEstatico,
  envDesarrollo,
  urlDesarrollo,
  origenesExtra = [],
}) {
  // Sin la interfaz compilada la ventana abriría en blanco y sin explicación.
  // Se comprueba antes que nada porque es lo primero que falla en un clon nuevo.
  if (directorioEstatico && !urlDesarrollo && !fs.existsSync(path.join(directorioEstatico, "index.html"))) {
    throw new FalloArranque(
      "Falta la interfaz compilada",
      `No se encontró index.html en: ${directorioEstatico}`,
      [
        "Compílala con: npm --prefix comandas run build",
        "O usa «npm run escritorio» desde la raíz, que la compila antes de abrir.",
      ],
    );
  }

  const config = asegurarConfiguracion({ rutaConfig, envDesarrollo });
  const puerto = Number(config.PORT) || PUERTO_POR_DEFECTO;
  const direcciones = direccionesDeRed(puerto);

  // El WebSocket rechaza el upgrade si el Origin no está en esta lista, así que
  // sin las IPs de la red los celulares cargarían la app pero no recibirían nada
  // en vivo. `origenesExtra` añade los servidores de Vite en desarrollo, porque
  // entonces este proceso es también la API de la web pública.
  const origenes = [
    ...new Set([
      `http://127.0.0.1:${puerto}`,
      `http://localhost:${puerto}`,
      ...direcciones.map((d) => d.url),
      ...(urlDesarrollo ? [urlDesarrollo] : []),
      ...origenesExtra,
    ]),
  ];

  for (const [clave, valor] of Object.entries(config)) {
    if (valor !== "" && process.env[clave] === undefined) process.env[clave] = valor;
  }
  process.env.CORS_ORIGINS = origenes.join(",");
  if (directorioEstatico) process.env.STATIC_DIR = directorioEstatico;

  // A partir de aquí ya se puede importar la API: sus módulos validan la
  // configuración al evaluarse, por eso las importaciones son dinámicas.
  const importarApi = (relativa) => import(pathToFileURL(path.join(raizApi, relativa)).href);

  const { readEnv } = await importarApi("src/config/readEnv.js");
  const { problems } = readEnv();
  if (problems.length > 0) {
    throw new FalloArranque(
      "La configuración está incompleta",
      problems.join("\n"),
      [`Revisa el archivo de configuración: ${rutaConfig}`, "Después vuelve a abrir el programa."],
    );
  }

  const { prisma } = await importarApi("src/config/prisma.js");

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    throw new FalloArranque(
      "No se pudo conectar con la base de datos",
      err.message.split("\n").at(-1),
      [
        "Comprueba que el servicio «postgresql-x64-17» esté iniciado en Windows.",
        `Si cambiaste la contraseña de PostgreSQL, actualízala en: ${rutaConfig}`,
      ],
    );
  }

  const { seed } = await importarApi("src/seed/index.js");
  try {
    await seed();
  } catch (err) {
    if (err.code === "P2021") {
      throw new FalloArranque(
        "Faltan tablas en la base de datos",
        "La base existe pero está vacía o incompleta.",
        ["Hay que aplicar las migraciones antes de usar el programa."],
      );
    }
    throw err;
  }

  const { createApp } = await importarApi("src/app.js");
  const { attachWebSocket } = await importarApi("src/ws/index.js");

  const servidor = http.createServer(createApp());
  const ws = attachWebSocket(servidor);

  await new Promise((resolver, rechazar) => {
    servidor.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        rechazar(
          new FalloArranque(
            `El puerto ${puerto} ya está ocupado`,
            "Otro programa está usando ese puerto.",
            [
              "¿Dejaste el servidor abierto en una terminal? Ciérrala.",
              `Si necesitas otro puerto, cámbialo en: ${rutaConfig}`,
            ],
          ),
        );
        return;
      }
      rechazar(err);
    });
    servidor.listen(puerto, resolver);
  });

  const cerrar = async () => {
    ws.close();
    servidor.close();
    await Promise.allSettled([prisma.$disconnect()]);
  };

  return { puerto, direcciones, url: `http://127.0.0.1:${puerto}`, cerrar, prisma };
}
