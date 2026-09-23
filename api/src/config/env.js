import { readEnv } from "./readEnv.js";

const { values, problems, warnings } = readEnv();

if (problems.length > 0) {
  console.error(
    "\n✖ Configuración incompleta en api/.env:\n" +
      problems.map((p) => `  - ${p}`).join("\n") +
      "\n\n  Copia api/.env.example como api/.env y completa los valores.\n",
  );
  process.exit(1);
}

for (const warning of warnings) console.warn(`⚠ ${warning}`);

export const env = Object.freeze(values);
