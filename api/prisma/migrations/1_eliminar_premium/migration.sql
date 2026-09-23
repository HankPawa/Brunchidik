-- Se elimina la funcionalidad Premium: la suscripcion ya no existe.
-- Los pedidos programados siguen disponibles, ahora para todos los usuarios.
-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "suscrito";

