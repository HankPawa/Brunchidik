import { prisma } from "../../config/prisma.js";
import { formatDate, todayNaive } from "../../lib/time.js";

const UN_DIA_MS = 24 * 60 * 60 * 1000;

// Las fechas son "naive" (reloj de pared en los campos UTC), así que sumar 24 h en
// milisegundos es seguro: no hay cambios de horario que corrijan.
const diaSiguiente = (fecha) => new Date(fecha.getTime() + UN_DIA_MS);

// Rango pedido o, por defecto, hoy: el informe se mira casi siempre al cerrar el día.
function resolverRango(query) {
  const desde = query.desde ?? todayNaive();
  const hasta = query.hasta ?? desde;
  return { desde, hasta, fin: diaSiguiente(hasta) };
}

const redondear = (n) => Math.round(n * 1000) / 1000;

// Acumula en un Map y devuelve la lista ordenada por lo que más pesa.
function acumular(mapa, clave, inicial) {
  let fila = mapa.get(clave);
  if (!fila) {
    fila = inicial();
    mapa.set(clave, fila);
  }
  return fila;
}

// --- Ventas ---

// Solo cuentan las comandas CERRADAS: una cuenta abierta no es una venta todavía,
// y una anulada no lo fue nunca. El total es el congelado al cobrar, no el
// recalculado, para que el informe no cambie si mañana suben los precios.
export async function ventas(req, res) {
  const { desde, hasta, fin } = resolverRango(req.valid.query);

  const comandas = await prisma.comanda.findMany({
    where: { estado: "CERRADA", fechaCierre: { gte: desde, lt: fin } },
    include: { items: true, mesa: { select: { numero: true } } },
    orderBy: { fechaCierre: "asc" },
  });

  const porDia = new Map();
  const porMetodo = new Map();
  const porPlato = new Map();
  let total = 0;
  let platosVendidos = 0;

  for (const comanda of comandas) {
    const importe = Number(comanda.total ?? 0);
    total += importe;

    const dia = acumular(porDia, formatDate(comanda.fechaCierre), () => ({ comandas: 0, total: 0 }));
    dia.comandas += 1;
    dia.total += importe;

    const metodo = acumular(porMetodo, comanda.metodoPago ?? "SIN_REGISTRAR", () => ({ comandas: 0, total: 0 }));
    metodo.comandas += 1;
    metodo.total += importe;

    for (const item of comanda.items) {
      // Un plato cancelado no se cobró ni se vendió; queda en el histórico pero
      // no en el informe.
      if (item.estado === "CANCELADO") continue;
      platosVendidos += item.cantidad;

      const plato = acumular(porPlato, item.nombreItem, () => ({ cantidad: 0, total: 0 }));
      plato.cantidad += item.cantidad;
      plato.total += Number(item.precioUnitario) * item.cantidad;
    }
  }

  res.json({
    desde: formatDate(desde),
    hasta: formatDate(hasta),
    resumen: {
      comandas: comandas.length,
      platos: platosVendidos,
      total,
      // Sin ventas el promedio es 0, no una división por cero.
      ticketPromedio: comandas.length ? Math.round(total / comandas.length) : 0,
    },
    porDia: [...porDia.entries()]
      .map(([fecha, v]) => ({ fecha, ...v }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha)),
    porMetodoPago: [...porMetodo.entries()]
      .map(([metodoPago, v]) => ({ metodoPago, ...v }))
      .sort((a, b) => b.total - a.total),
    porPlato: [...porPlato.entries()]
      .map(([nombre, v]) => ({ nombre, ...v }))
      .sort((a, b) => b.cantidad - a.cantidad),
  });
}

// --- Consumo de inventario ---

// Qué se gastó de verdad en el rango, leído del libro de movimientos y no de las
// recetas: si una receta cambió a mitad de semana, el libro sigue diciendo la verdad.
export async function consumo(req, res) {
  const { desde, hasta, fin } = resolverRango(req.valid.query);

  const movimientos = await prisma.movimientoInventario.findMany({
    where: { fecha: { gte: desde, lt: fin } },
    include: { insumo: { select: { nombre: true, unidad: true, stock: true, stockMinimo: true } } },
    orderBy: { id: "asc" },
  });

  const porInsumo = new Map();

  for (const mv of movimientos) {
    const fila = acumular(porInsumo, String(mv.insumoId), () => ({
      insumoId: Number(mv.insumoId),
      nombre: mv.insumo?.nombre ?? null,
      unidad: mv.insumo?.unidad ?? null,
      stockActual: Number(mv.insumo?.stock ?? 0),
      bajoMinimo: Number(mv.insumo?.stock ?? 0) <= Number(mv.insumo?.stockMinimo ?? 0),
      consumido: 0,
      devuelto: 0,
      comprado: 0,
      ajustado: 0,
      movimientos: 0,
    }));

    // Los consumos se guardan en negativo; el informe los muestra en positivo,
    // que es como se leen ("se gastaron 12 truchas").
    const cantidad = Number(mv.cantidad);
    if (mv.tipo === "CONSUMO") fila.consumido += -cantidad;
    else if (mv.tipo === "DEVOLUCION") fila.devuelto += cantidad;
    else if (mv.tipo === "COMPRA") fila.comprado += cantidad;
    else fila.ajustado += cantidad;
    fila.movimientos += 1;
  }

  const insumos = [...porInsumo.values()]
    .map((f) => ({
      ...f,
      consumido: redondear(f.consumido),
      devuelto: redondear(f.devuelto),
      comprado: redondear(f.comprado),
      ajustado: redondear(f.ajustado),
      // Lo que salió de verdad: consumido menos lo devuelto por cancelaciones.
      neto: redondear(f.consumido - f.devuelto),
    }))
    .sort((a, b) => b.neto - a.neto || (a.nombre ?? "").localeCompare(b.nombre ?? ""));

  res.json({ desde: formatDate(desde), hasta: formatDate(hasta), insumos });
}
