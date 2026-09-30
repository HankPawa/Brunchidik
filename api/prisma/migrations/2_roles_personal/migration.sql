-- Roles del personal del salón: además de ADMIN (administración) y USUARIO
-- (cliente de la web), ahora existen MESERO (toma pedidos en mesa) y COCINA
-- (prepara los platos). Prisma no genera restricciones CHECK, así que la
-- recreamos a mano igual que en 0_init.

ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_rol_check";

ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_check"
    CHECK ("rol" IN ('ADMIN', 'USUARIO', 'MESERO', 'COCINA'));
