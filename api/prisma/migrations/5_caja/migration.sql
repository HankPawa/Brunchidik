-- Arqueo de caja: una sesión de caja al día y sus movimientos de dinero.
--
-- OJO: al final hay restricciones CHECK y un índice único parcial escritos a
-- mano; `prisma migrate diff` no los genera. Si regeneras esta migración,
-- vuelve a añadirlos.
--
-- OJO 2: el diff generado proponía además un DROP de
-- "movimientos_inventario_comanda_item_id_fkey". Se ha quitado a propósito: esa
-- clave foránea se escribió a mano en la migración 4 y Prisma no la conoce, así
-- que en cada diff querrá borrarla. No la dejes pasar.

-- CreateTable
CREATE TABLE "arqueos" (
    "id" BIGSERIAL NOT NULL,
    "estado" VARCHAR(8) NOT NULL DEFAULT 'ABIERTO',
    "base_inicial" DECIMAL(38,2) NOT NULL,
    "abierto_por" BIGINT NOT NULL,
    "cerrado_por" BIGINT,
    "esperado_efectivo" DECIMAL(38,2),
    "esperado_tarjeta" DECIMAL(38,2),
    "esperado_transferencia" DECIMAL(38,2),
    "contado_efectivo" DECIMAL(38,2),
    "contado_tarjeta" DECIMAL(38,2),
    "contado_transferencia" DECIMAL(38,2),
    "notas_apertura" VARCHAR(255),
    "notas_cierre" VARCHAR(255),
    "fecha_apertura" TIMESTAMP(6) NOT NULL,
    "fecha_cierre" TIMESTAMP(6),

    CONSTRAINT "arqueos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_caja" (
    "id" BIGSERIAL NOT NULL,
    "arqueo_id" BIGINT NOT NULL,
    "tipo" VARCHAR(8) NOT NULL,
    "concepto" VARCHAR(255) NOT NULL,
    "monto" DECIMAL(38,2) NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "anulado" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "movimientos_caja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "arqueos_estado_idx" ON "arqueos"("estado");

-- CreateIndex
CREATE INDEX "arqueos_fecha_apertura_idx" ON "arqueos"("fecha_apertura");

-- CreateIndex
CREATE INDEX "movimientos_caja_arqueo_id_idx" ON "movimientos_caja"("arqueo_id");

-- AddForeignKey
ALTER TABLE "movimientos_caja" ADD CONSTRAINT "movimientos_caja_arqueo_id_fkey"
    FOREIGN KEY ("arqueo_id") REFERENCES "arqueos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Escrito a mano desde aquí ────────────────────────────────────────────────

-- Los estados son varchar con CHECK, como el resto del proyecto: no son enums
-- de Prisma a propósito.
ALTER TABLE "arqueos" ADD CONSTRAINT "arqueos_estado_check"
    CHECK ("estado" IN ('ABIERTO', 'CERRADO'));

ALTER TABLE "movimientos_caja" ADD CONSTRAINT "movimientos_caja_tipo_check"
    CHECK ("tipo" IN ('INGRESO', 'EGRESO'));

-- El signo lo lleva el tipo, no el número: un egreso de -5000 sería ambiguo y
-- acabaría sumando donde debía restar.
ALTER TABLE "movimientos_caja" ADD CONSTRAINT "movimientos_caja_monto_check"
    CHECK ("monto" > 0);

-- Una caja no puede abrirse con base negativa, ni contarse en negativo.
ALTER TABLE "arqueos" ADD CONSTRAINT "arqueos_base_inicial_check"
    CHECK ("base_inicial" >= 0);

ALTER TABLE "arqueos" ADD CONSTRAINT "arqueos_contado_check"
    CHECK (
        ("contado_efectivo" IS NULL OR "contado_efectivo" >= 0) AND
        ("contado_tarjeta" IS NULL OR "contado_tarjeta" >= 0) AND
        ("contado_transferencia" IS NULL OR "contado_transferencia" >= 0)
    );

-- Un arqueo cerrado tiene que tener fecha de cierre y lo contado; uno abierto,
-- ninguna de las dos cosas. Así no existen cierres a medias en la base.
ALTER TABLE "arqueos" ADD CONSTRAINT "arqueos_cierre_completo_check"
    CHECK (
        ("estado" = 'ABIERTO' AND "fecha_cierre" IS NULL AND "contado_efectivo" IS NULL)
        OR
        ("estado" = 'CERRADO' AND "fecha_cierre" IS NOT NULL AND "contado_efectivo" IS NOT NULL)
    );

-- No puede haber dos cajas abiertas a la vez, ni aunque dos personas pulsen
-- "abrir" en el mismo instante. Lo impide la base, no la aplicación.
CREATE UNIQUE INDEX "arqueos_uno_abierto_uniq"
    ON "arqueos" ((1)) WHERE "estado" = 'ABIERTO';

-- Quién abrió, quién cerró y quién registró cada movimiento: el arqueo es un
-- documento contable y tiene que poder responder por su autor.
ALTER TABLE "arqueos" ADD CONSTRAINT "arqueos_abierto_por_fkey"
    FOREIGN KEY ("abierto_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "arqueos" ADD CONSTRAINT "arqueos_cerrado_por_fkey"
    FOREIGN KEY ("cerrado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "movimientos_caja" ADD CONSTRAINT "movimientos_caja_usuario_id_fkey"
    FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
