import { ApiError } from "../lib/errors.js";

// Los errores salen como texto plano: el frontend los muestra tal cual
// (p. ej. el registro hace res.text()), igual que con el backend anterior.
const send = (res, status, message) => res.status(status).type("text/plain").send(message);

export function notFoundHandler(req, res) {
  send(res, 404, "Ruta no encontrada");
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof ApiError) return send(res, err.status, err.message);
  if (err.type === "entity.parse.failed") return send(res, 400, "El cuerpo de la petición no es JSON válido");
  if (err.type === "entity.too.large") return send(res, 413, "La petición es demasiado grande");
  if (err.code === "P2002") return send(res, 409, "Ya existe un registro con esos datos");
  if (err.code === "P2025") return send(res, 404, "No encontrado");

  console.error(`✖ ${req.method} ${req.originalUrl}`, err);
  send(res, 500, "Error interno del servidor");
}
