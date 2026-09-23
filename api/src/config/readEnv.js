import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

export const ENV_PATH = fileURLToPath(new URL("../../.env", import.meta.url));

// Lee y valida la configuración sin efectos secundarios, para que tanto el
// servidor como el script de diagnóstico puedan reportar los problemas.
export function readEnv() {
  dotenv.config({ path: ENV_PATH, quiet: true });

  const problems = [];
  const warnings = [];
  const read = (name) => process.env[name]?.trim() || undefined;
  const required = (name) => {
    const value = read(name);
    if (!value) problems.push(`${name} es obligatoria`);
    return value;
  };

  const databaseUrl = required("DATABASE_URL");
  if (databaseUrl && !/^postgres(ql)?:\/\//.test(databaseUrl)) {
    problems.push("DATABASE_URL debe empezar por postgresql:// (formato Prisma, no JDBC)");
  }

  const jwtSecret = required("JWT_SECRET");
  if (jwtSecret && jwtSecret.length < 32) {
    problems.push("JWT_SECRET debe tener al menos 32 caracteres");
  }

  const port = Number(read("PORT") ?? 8080);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    problems.push("PORT debe ser un número de puerto válido");
  }

  const mailUser = read("MAIL_USER");
  const mailPassword = read("MAIL_PASSWORD");
  const mailEnabled = Boolean(mailUser && mailPassword);
  if (!mailEnabled) {
    warnings.push("MAIL_USER/MAIL_PASSWORD vacías: no se envían correos (los códigos 2FA se imprimen en consola)");
  }

  const mailPort = Number(read("MAIL_PORT") ?? 465);

  const googleClientId = read("GOOGLE_CLIENT_ID");
  if (!googleClientId) {
    warnings.push("GOOGLE_CLIENT_ID vacía: no se verifica que el token de Google pertenezca a esta app");
  }

  const redisUrl = read("REDIS_URL");

  const values = {
    port,
    databaseUrl,
    jwtSecret,
    jwtExpiresIn: read("JWT_EXPIRES_IN") ?? "7d",
    redisUrl,
    corsOrigins: (read("CORS_ORIGINS") ?? "http://localhost:5173")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
    googleClientId,
    mail: {
      enabled: mailEnabled,
      host: read("MAIL_HOST") ?? "smtp.resend.com",
      port: mailPort,
      secure: mailPort === 465,
      user: mailUser,
      password: mailPassword,
      from: read("MAIL_FROM") ?? "onboarding@resend.dev",
    },
    admin: {
      email: read("ADMIN_EMAIL"),
      password: read("ADMIN_PASSWORD"),
    },
  };

  return { values, problems, warnings };
}
