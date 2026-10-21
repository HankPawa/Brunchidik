// Crea la base de datos si no existe, sin depender de `createdb` ni de `psql`.
//
// En Windows el instalador de PostgreSQL no añade su carpeta bin al PATH, así
// que `createdb` no existe en la terminal y el primer paso del manual falla
// antes de empezar. Esto hace lo mismo desde Node, con la conexión que ya está
// en api/.env: no hay que instalar nada ni recordar ninguna ruta.
import { PrismaClient } from "@prisma/client";
import { readEnv } from "../src/config/readEnv.js";

const { values, problems } = readEnv();

if (problems.length > 0) {
  console.error("\n✖ No se puede crear la base: falta configuración en api/.env\n");
  for (const p of problems) console.error(`  - ${p}`);
  console.error("\n  Copia api/.env.example como api/.env y complétalo.\n");
  process.exit(1);
}

let url;
try {
  url = new URL(values.databaseUrl);
} catch {
  console.error("\n✖ DATABASE_URL no es una dirección válida.\n");
  process.exit(1);
}

const nombre = decodeURIComponent(url.pathname.replace(/^\//, ""));
if (!nombre) {
  console.error("\n✖ DATABASE_URL no indica ninguna base de datos.\n");
  process.exit(1);
}

// Para crear una base hay que estar conectado a otra. `postgres` existe siempre.
const urlMantenimiento = new URL(url);
urlMantenimiento.pathname = "/postgres";
urlMantenimiento.search = "";

const prisma = new PrismaClient({ datasources: { db: { url: urlMantenimiento.toString() } } });

try {
  const existe = await prisma.$queryRaw`SELECT 1 FROM pg_database WHERE datname = ${nombre}`;
  if (existe.length > 0) {
    console.log(`✔ La base «${nombre}» ya existe`);
  } else {
    // El nombre viene de la configuración del propio usuario, pero se escapa
    // igual: no se interpola nada sin comillas en una sentencia DDL.
    await prisma.$executeRawUnsafe(`CREATE DATABASE "${nombre.replace(/"/g, '""')}"`);
    console.log(`✔ Base «${nombre}» creada`);
  }
} catch (err) {
  const detalle = err.message.split("\n").at(-1);
  console.error(`\n✖ No se pudo crear la base «${nombre}».\n  ${detalle}\n`);
  console.error("  Comprueba que PostgreSQL esté corriendo y que el usuario y la");
  console.error("  contraseña de DATABASE_URL sean correctos.\n");
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
