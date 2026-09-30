import { prisma } from "../config/prisma.js";
import { ApiError } from "../lib/errors.js";
import { verifyToken } from "../lib/jwt.js";
import { ROL } from "../lib/roles.js";

const SESION_INVALIDA = "Sesión inválida o expirada";

function bearerToken(req) {
  const header = req.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

function authenticate(req) {
  const token = bearerToken(req);
  const user = token && verifyToken(token);
  if (!user) throw new ApiError(401, SESION_INVALIDA);
  req.user = user;
}

export function requireAuth(req, res, next) {
  authenticate(req);
  next();
}

// Para rutas que admiten invitados (checkout): sin token sigue como anónimo,
// pero un token presente e inválido es un 401 para que el frontend cierre sesión.
export function optionalAuth(req, res, next) {
  if (bearerToken(req)) authenticate(req);
  next();
}

// El rol se vuelve a leer de la base en cada petición: a quien se le cambie el
// rol pierde el acceso al instante, sin esperar a que caduque su token.
export const requireRol =
  (...roles) =>
  async (req, res, next) => {
    authenticate(req);
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { rol: true },
    });
    if (!usuario || !roles.includes(usuario.rol)) {
      throw new ApiError(403, "No tienes permiso para esta acción");
    }
    // El rol de la base manda sobre el del token.
    req.user.rol = usuario.rol;
    next();
  };

export const requireAdmin = requireRol(ROL.ADMIN);

export const requireSelf =
  (param = "id") =>
  (req, res, next) => {
    authenticate(req);
    if (Number(req.params[param]) !== req.user.id) {
      throw new ApiError(403, "No puedes acceder a datos de otro usuario");
    }
    next();
  };
