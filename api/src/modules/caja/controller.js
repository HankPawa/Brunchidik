import { prisma } from "../../config/prisma.js";
import { ApiError, noEncontrado } from "../../lib/errors.js";
import { toArqueo } from "../../lib/serialize.js";
import { nowNaive } from "../../lib/time.js";
import * as audit from "../audit/service.js";
import { arqueoAbierto, calcularCuadre, publicarCaja } from "./service.js";

const pesos = (n) => `$${Number(n).toLocaleString("es-CO")}`;

async function exigirAbierta() {
  const arqueo = await arqueoAbierto();
  if (!arqueo) throw new ApiError(409, "No hay ninguna caja abierta. Ábrela antes de registrar movimientos.");
  return arqueo;
}

const responder = async (res, arqueo) =>
  res.json({ abierta: arqueo.estado === "ABIERTO", arqueo: toArqueo(arqueo), cuadre: await calcularCuadre(arqueo) });

// --- Estado actual ---

export async function actual(req, res) {
  const arqueo = await arqueoAbierto();
  if (!arqueo) {
    res.json({ abierta: false, arqueo: null, cuadre: null });
    return;
  }
  await responder(res, arqueo);
}

// --- Abrir y cerrar ---

export async function abrir(req, res) {
  const { baseInicial, notas } = req.valid.body;

  try {
    const arqueo = await prisma.arqueo.create({
      data: {
        estado: "ABIERTO",
        baseInicial,
        abiertoPor: req.user.id,
        notasApertura: notas,
        fechaApertura: nowNaive(),
      },
      include: { movimientos: true },
    });

    await audit.registrar("ABRIR_CAJA", `Abrió la caja con ${pesos(baseInicial)} de base`, audit.SERVICIO_CAJA);
    await responder(res, arqueo);
    publicarCaja();
  } catch (err) {
    // Lo impide un índice único parcial: si dos personas pulsan "abrir" a la
    // vez, una de las dos llega aquí.
    if (err.code === "P2002") throw new ApiError(409, "Ya hay una caja abierta");
    throw err;
  }
}

export async function cerrar(req, res) {
  const { contadoEfectivo, contadoTarjeta, contadoTransferencia, notas } = req.valid.body;
  const arqueo = await exigirAbierta();

  // El esperado se congela aquí: a partir de este momento el arqueo es un
  // documento contable y no puede moverse aunque después se edite una comanda.
  const cuadre = await calcularCuadre(arqueo);

  const cerrado = await prisma.arqueo.update({
    where: { id: arqueo.id },
    data: {
      estado: "CERRADO",
      cerradoPor: req.user.id,
      esperadoEfectivo: cuadre.esperado.EFECTIVO,
      esperadoTarjeta: cuadre.esperado.TARJETA,
      esperadoTransferencia: cuadre.esperado.TRANSFERENCIA,
      contadoEfectivo,
      contadoTarjeta,
      contadoTransferencia,
      notasCierre: notas,
      fechaCierre: nowNaive(),
    },
    include: { movimientos: { orderBy: { id: "desc" } } },
  });

  const diferencia = contadoEfectivo - cuadre.esperado.EFECTIVO;
  const resumen =
    diferencia === 0
      ? "cuadrada"
      : diferencia > 0
        ? `con ${pesos(diferencia)} de sobrante`
        : `con ${pesos(Math.abs(diferencia))} de faltante`;

  await audit.registrar(
    "CERRAR_CAJA",
    `Cerró la caja #${arqueo.id} ${resumen} (contado ${pesos(contadoEfectivo)}, esperado ${pesos(cuadre.esperado.EFECTIVO)})`,
    audit.SERVICIO_CAJA,
  );

  await responder(res, cerrado);
  publicarCaja();
}

// --- Movimientos ---

export async function registrarMovimiento(req, res) {
  const { tipo, concepto, monto } = req.valid.body;
  const arqueo = await exigirAbierta();

  await prisma.movimientoCaja.create({
    data: { arqueoId: arqueo.id, tipo, concepto, monto, usuarioId: req.user.id, fecha: nowNaive() },
  });

  await audit.registrar(
    tipo === "INGRESO" ? "INGRESO_CAJA" : "EGRESO_CAJA",
    `${tipo === "INGRESO" ? "Entrada" : "Salida"} de ${pesos(monto)} en caja: ${concepto}`,
    audit.SERVICIO_CAJA,
  );

  await responder(res, await exigirAbierta());
  publicarCaja();
}

// Los movimientos no se borran: se anulan. Un apunte que desaparece sin rastro
// es justo lo que un arqueo no puede permitirse.
export async function anularMovimiento(req, res) {
  const { id } = req.valid.params;
  const arqueo = await exigirAbierta();

  const movimiento = await prisma.movimientoCaja.findFirst({ where: { id, arqueoId: arqueo.id } });
  if (!movimiento) throw noEncontrado("Movimiento no encontrado en la caja abierta");
  if (movimiento.anulado) throw new ApiError(409, "Ese movimiento ya estaba anulado");

  await prisma.movimientoCaja.update({ where: { id }, data: { anulado: true } });
  await audit.registrar(
    "ANULAR_MOVIMIENTO_CAJA",
    `Anuló ${movimiento.tipo === "INGRESO" ? "la entrada" : "la salida"} de ${pesos(movimiento.monto)}: ${movimiento.concepto}`,
    audit.SERVICIO_CAJA,
  );

  await responder(res, await exigirAbierta());
  publicarCaja();
}

// --- Historial ---

export async function historial(req, res) {
  const arqueos = await prisma.arqueo.findMany({
    where: { estado: "CERRADO" },
    include: { movimientos: { orderBy: { id: "desc" } } },
    orderBy: { fechaApertura: "desc" },
    take: 60,
  });

  res.json(
    await Promise.all(
      arqueos.map(async (a) => ({ arqueo: toArqueo(a), cuadre: await calcularCuadre(a) })),
    ),
  );
}

export async function detalle(req, res) {
  const arqueo = await prisma.arqueo.findUnique({
    where: { id: req.valid.params.id },
    include: { movimientos: { orderBy: { id: "desc" } } },
  });
  if (!arqueo) throw noEncontrado("Arqueo no encontrado");
  await responder(res, arqueo);
}

