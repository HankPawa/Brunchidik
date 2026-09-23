import { prisma } from "../config/prisma.js";
import { seed } from "./index.js";

try {
  await seed();
  console.log("✔ Semilla completada");
} catch (err) {
  console.error("✖ Error en la semilla:", err.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
