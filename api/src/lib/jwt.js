import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(usuario) {
  return jwt.sign({ rol: usuario.rol ?? "USUARIO", email: usuario.email }, env.jwtSecret, {
    subject: String(usuario.id),
    expiresIn: env.jwtExpiresIn,
    algorithm: "HS256",
  });
}

export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    if (!Number.isSafeInteger(id) || id <= 0) return null;
    return { id, rol: payload.rol, email: payload.email };
  } catch {
    return null;
  }
}
