import { prisma } from "../../config/prisma.js";
import { toArqueo } from "../../lib/serialize.js";
import { nowNaive } from "../../lib/time.js";
import { publicar, TOPICS } from "../../ws/hub.js";

const METODOS = ["EFECTIVO", "TARJETA", "TRANSFERENCIA"];
const SIN_METODO = "SIN_REGISTRAR";

const redondear = (n) => Math.round(n * 100) / 100;

export const arqueoAbierto = () =>
  prisma.arqueo.findFirst({
    where: { estado: "ABIERTO" },
    include: { movimientos: { orderBy: { id: "desc" } } },
  });

/**
 * Lo que la caja dice que debería haber, a partir de las comandas cobradas
 * dentro del intervalo del arqueo y de los movimientos registrados.
 *
 * Mientras la caja está abierta se calcula al vuelo: guardar el esperado sería
 * arrastrar una copia que se desactualiza con cada cobro. Una vez cerrada manda
 * lo congelado en la fila, porque a partir de ahí el arqueo es un documento
 * contable y no puede cambiar aunque alguien edite una comanda después.
 */
export async function calcularCuadre(arqueo) {
  const hasta = arqueo.fechaCierre ?? nowNaive();

  const ventas = await prisma.comanda.findMany({
    where: { estado: "CERRADA", fechaCierre: { gte: arqueo.fechaApertura, lte: hasta } },
    select: { total: true, metodoPago: true },
  });

  const porMetodo = { EFECTIVO: 0, TARJETA: 0, TRANSFERENCIA: 0, [SIN_METODO]: 0 };
  for (const venta of ventas) {
    // Una comanda sin método de pago no se descarta: se agrupa aparte para que
    // salte a la vista en vez de desaparecer del cuadre.
    const clave = METODOS.includes(venta.metodoPago) ? venta.metodoPago : SIN_METODO;
    porMetodo[clave] += Number(venta.total ?? 0);
  }

  const movimientos = (arqueo.movimientos ?? []).filter((m) => !m.anulado);
  const ingresos = movimientos.filter((m) => m.tipo === "INGRESO").reduce((s, m) => s + Number(m.monto), 0);
  const egresos = movimientos.filter((m) => m.tipo === "EGRESO").reduce((s, m) => s + Number(m.monto), 0);

  const base = Number(arqueo.baseInicial);

  // Solo el efectivo arrastra la base y los movimientos: tarjeta y transferencia
  // no pasan por el cajón, se cuadran contra el datáfono y el banco.
  const calculado = {
    EFECTIVO: redondear(base + porMetodo.EFECTIVO + ingresos - egresos),
    TARJETA: redondear(porMetodo.TARJETA),
    TRANSFERENCIA: redondear(porMetodo.TRANSFERENCIA),
  };

  const congelado = arqueo.estado === "CERRADO" && arqueo.esperadoEfectivo !== null;
  const esperado = congelado
    ? {
        EFECTIVO: Number(arqueo.esperadoEfectivo),
        TARJETA: Number(arqueo.esperadoTarjeta ?? 0),
        TRANSFERENCIA: Number(arqueo.esperadoTransferencia ?? 0),
      }
    : calculado;

  const contado = congelado
    ? {
        EFECTIVO: Number(arqueo.contadoEfectivo ?? 0),
        TARJETA: Number(arqueo.contadoTarjeta ?? 0),
        TRANSFERENCIA: Number(arqueo.contadoTransferencia ?? 0),
      }
    : null;

  return {
    baseInicial: redondear(base),
    ventas: {
      EFECTIVO: redondear(porMetodo.EFECTIVO),
      TARJETA: redondear(porMetodo.TARJETA),
      TRANSFERENCIA: redondear(porMetodo.TRANSFERENCIA),
      SIN_REGISTRAR: redondear(porMetodo[SIN_METODO]),
    },
    comandas: ventas.length,
    ingresos: redondear(ingresos),
    egresos: redondear(egresos),
    esperado,
    contado,
    // Positiva = sobra dinero; negativa = falta.
    diferencia: contado
      ? {
          EFECTIVO: redondear(contado.EFECTIVO - esperado.EFECTIVO),
          TARJETA: redondear(contado.TARJETA - esperado.TARJETA),
          TRANSFERENCIA: redondear(contado.TRANSFERENCIA - esperado.TRANSFERENCIA),
        }
      : null,
    // El esperado congelado puede separarse de lo que hoy dicen las comandas si
    // alguien las tocó después de cerrar. Se avisa en vez de taparlo.
    recalculado: congelado ? calculado : null,
  };
}

/**
 * Avisa a las pantallas de caja abiertas. Se llama también al cerrar una
 * comanda: es lo que hace que el cuadre se mueva solo mientras se cobra.
 * Nunca rompe la petición que la provocó.
 */
export async function publicarCaja() {
  try {
    const arqueo = await arqueoAbierto();
    if (!arqueo) {
      publicar(TOPICS.caja, { abierta: false });
      return;
    }
    publicar(TOPICS.caja, { abierta: true, arqueo: toArqueo(arqueo), cuadre: await calcularCuadre(arqueo) });
  } catch (err) {
    console.error("No se pudo publicar el estado de caja:", err.message);
  }
}
