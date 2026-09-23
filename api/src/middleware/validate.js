import { ApiError } from "../lib/errors.js";

// Valida req.body / req.query / req.params con un schema de zod y deja el
// resultado ya transformado en req.valid[source].
export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const input = source === "body" ? (req.body ?? {}) : req[source];
    const result = schema.safeParse(input);
    if (!result.success) {
      throw new ApiError(400, result.error.issues[0]?.message ?? "Datos inválidos");
    }
    req.valid ??= {};
    req.valid[source] = result.data;
    next();
  };
