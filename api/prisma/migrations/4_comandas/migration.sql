-- Salón: mesas, comandas y sus platos.
--
-- OJO: al final hay restricciones CHECK, un índice único parcial y una clave
-- foránea escritos a mano; `prisma migrate diff` no los genera. Si regeneras
-- esta migración, vuelve a añadirlos.

-- CreateTable
CREATE TABLE "mesas" (
    "id" BIGSERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "nombre" VARCHAR(50),
    "capacidad" INTEGER NOT NULL DEFAULT 4,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comandas" (
    "id" BIGSERIAL NOT NULL,
    "mesa_id" BIGINT NOT NULL,
    "mesero_id" BIGINT NOT NULL,
    "estado" VARCHAR(10) NOT NULL DEFAULT 'ABIERTA',
    "comensales" INTEGER,
    "notas" VARCHAR(255),
    "total" DECIMAL(38,2),
    "metodo_pago" VARCHAR(14),
    "tiene_faltante" BOOLEAN NOT NULL DEFAULT false,
    "fecha_apertura" TIMESTAMP(6) NOT NULL,
    "fecha_cierre" TIMESTAMP(6),

    CONSTRAINT "comandas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comanda_items" (
    "id" BIGSERIAL NOT NULL,
    "comanda_id" BIGINT NOT NULL,
    "menu_item_id" BIGINT,
    "nombre_item" VARCHAR(255) NOT NULL,
    "precio_unitario" DECIMAL(38,2) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "notas" VARCHAR(255),
    "estado" VARCHAR(12) NOT NULL DEFAULT 'BORRADOR',
    "falto_stock" BOOLEAN NOT NULL DEFAULT false,
    "inventario_aplicado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(6) NOT NULL,
    "fecha_envio" TIMESTAMP(6),
    "fecha_listo" TIMESTAMP(6),

    CONSTRAINT "comanda_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mesas_numero_key" ON "mesas"("numero");

-- CreateIndex
CREATE INDEX "comandas_estado_idx" ON "comandas"("estado");

-- CreateIndex
CREATE INDEX "comandas_fecha_apertura_idx" ON "comandas"("fecha_apertura");

-- CreateIndex
CREATE INDEX "comanda_items_comanda_id_idx" ON "comanda_items"("comanda_id");

-- CreateIndex
CREATE INDEX "comanda_items_estado_fecha_envio_idx" ON "comanda_items"("estado", "fecha_envio");

-- AddForeignKey
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comanda_items" ADD CONSTRAINT "comanda_items_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comandas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comanda_items" ADD CONSTRAINT "comanda_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Escrito a mano ─────────────────────────────────────────────────────────────

ALTER TABLE "comandas" ADD CONSTRAINT "comandas_estado_check"
    CHECK ("estado" IN ('ABIERTA', 'CERRADA', 'ANULADA'));
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_metodo_pago_check"
    CHECK ("metodo_pago" IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA'));
ALTER TABLE "comandas" ADD CONSTRAINT "comandas_comensales_check"
    CHECK ("comensales" IS NULL OR "comensales" >= 1);

ALTER TABLE "comanda_items" ADD CONSTRAINT "comanda_items_estado_check"
    CHECK ("estado" IN ('BORRADOR', 'PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO'));
ALTER TABLE "comanda_items" ADD CONSTRAINT "comanda_items_cantidad_check"
    CHECK ("cantidad" >= 1);

ALTER TABLE "mesas" ADD CONSTRAINT "mesas_capacidad_check"
    CHECK ("capacidad" >= 1);

-- Una mesa no puede tener dos cuentas abiertas a la vez, ni aunque dos meseros
-- pulsen "abrir" en el mismo instante. La base lo impide, no la aplicación.
CREATE UNIQUE INDEX "comandas_mesa_abierta_uniq"
    ON "comandas" ("mesa_id") WHERE "estado" = 'ABIERTA';

-- Los movimientos de inventario quedan ligados al plato que los causó, para
-- poder devolver exactamente lo que se descontó.
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_comanda_item_id_fkey"
    FOREIGN KEY ("comanda_item_id") REFERENCES "comanda_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
