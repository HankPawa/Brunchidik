// Roles del sistema. Deben coincidir con la restricción usuarios_rol_check
// de la base (ver prisma/migrations/2_roles_personal).
export const ROL = Object.freeze({
  ADMIN: "ADMIN",
  USUARIO: "USUARIO",
  MESERO: "MESERO",
  COCINA: "COCINA",
});

export const ROLES = Object.values(ROL);

// Roles que pertenecen al personal del restaurante (usan la app de comandas).
export const ROLES_PERSONAL = [ROL.ADMIN, ROL.MESERO, ROL.COCINA];
