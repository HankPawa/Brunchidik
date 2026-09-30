-- Inventario por insumos: existencias, recetas por plato y libro de movimientos.
-- Añade además la visibilidad del plato (carta de la web / carta del salón).
--
-- OJO: las restricciones CHECK del final están escritas a mano; Prisma no las
-- genera ni las ve. Si en el futuro regeneras esta migración con
-- `prisma migrate diff`, vuelve a añadirlas.

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "visible_salon" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "visible_web" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "insumos" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "unidad" VARCHAR(4) NOT NULL,
    "stock" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receta_items" (
    "id" BIGSERIAL NOT NULL,
    "menu_item_id" BIGINT NOT NULL,
    "insumo_id" BIGINT NOT NULL,
    "cantidad" DECIMAL(14,3) NOT NULL,

    CONSTRAINT "receta_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" BIGSERIAL NOT NULL,
    "insumo_id" BIGINT NOT NULL,
    "tipo" VARCHAR(12) NOT NULL,
    "cantidad" DECIMAL(14,3) NOT NULL,
    "stock_resultante" DECIMAL(14,3) NOT NULL,
    "motivo" VARCHAR(255),
    "comanda_item_id" BIGINT,
    "usuario_id" BIGINT,
    "fecha" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "insumos_nombre_key" ON "insumos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "receta_items_menu_item_id_insumo_id_key" ON "receta_items"("menu_item_id", "insumo_id");

-- CreateIndex
CREATE INDEX "movimientos_inventario_insumo_id_fecha_idx" ON "movimientos_inventario"("insumo_id", "fecha");

-- CreateIndex
CREATE INDEX "movimientos_inventario_comanda_item_id_idx" ON "movimientos_inventario"("comanda_item_id");

-- AddForeignKey
ALTER TABLE "receta_items" ADD CONSTRAINT "receta_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_items" ADD CONSTRAINT "receta_items_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Restricciones escritas a mano (Prisma no genera CHECK)
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_unidad_check"
    CHECK ("unidad" IN ('G', 'ML', 'UND'));
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_stock_minimo_check"
    CHECK ("stock_minimo" >= 0);
ALTER TABLE "receta_items" ADD CONSTRAINT "receta_items_cantidad_check"
    CHECK ("cantidad" > 0);
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_tipo_check"
    CHECK ("tipo" IN ('CONSUMO', 'DEVOLUCION', 'AJUSTE', 'COMPRA'));
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_cantidad_check"
    CHECK ("cantidad" <> 0);
