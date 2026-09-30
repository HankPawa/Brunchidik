import { prisma } from "../../config/prisma.js";
import { ApiError, noEncontrado } from "../../lib/errors.js";
import { ROL } from "../../lib/roles.js";
import { toComanda, toComandaItem, toMesa, totalDeItems } from "../../lib/serialize.js";
import { nowNaive } from "../../lib/time.js";
import { publicar, TOPICS } from "../../ws/hub.js";
import { aplicarMovimiento } from "../inventario/service.js";
import * as audit from "../audit/service.js";

const conItems = { mesa: true, items: { orderBy: { id: "asc" } } };
const EN_COCINA = ["PENDIENTE", "PREPARANDO"];

// Las transacciones tocan varias filas de inventario; el margen por defecto de
// 5 s se queda corto con comandas grandes.
const TX = { timeout: 20_000, maxWait: 5_000 };

async function buscarComanda(id) {
  const comanda = await prisma.comanda.findUnique({ where: { id }, include: conItems });
  if (!comanda) throw noEncontrado("Comanda no encontrada");
  return comanda;
}

function exigirAbierta(comanda) {
  if (comanda.estado !== "ABIERTA") {
    throw new ApiError(409, `La comanda ya está ${comanda.estado.toLowerCase()}`);
  }
}

const responder = (res, comanda) => res.json(toComanda(comanda));

// --- Mesas ---

export async function listarMesas(req, res) {
  const mesas = await prisma.mesa.findMany({
    where: { activa: true },
    orderBy: { numero: "asc" },
    include: { comandas: { where: { estado: "ABIERTA" }, select: { id: true } } },
  });
  res.json(mesas.map(toMesa));
}

// --- Mesas (admin) ---

const conComandaAbierta = { comandas: { where: { estado: "ABIERTA" }, select: { id: true } } };

// El admin ve también las mesas fuera de servicio: son las que tiene que reactivar.
export async function listarMesasAdmin(req, res) {
  const mesas = await prisma.mesa.findMany({
    orderBy: { numero: "asc" },
    include: conComandaAbierta,
  });
  res.json(mesas.map(toMesa));
}

async function buscarMesa(id) {
  const mesa = await prisma.mesa.findUnique({ where: { id }, include: conComandaAbierta });
  if (!mesa) throw noEncontrado("Mesa no encontrada");
  return mesa;
}

// El número de mesa es único: es lo que el mesero canta a la cocina.
const mesaDuplicada = (err, numero) =>
  err.code === "P2002" ? new ApiError(409, `Ya existe la mesa ${numero}`) : err;

export async function crearMesa(req, res) {
  const datos = req.valid.body;
  try {
    const mesa = await prisma.mesa.create({ data: datos, include: conComandaAbierta });
    await audit.registrar("CREAR_MESA", `Creó la mesa ${mesa.numero}`, audit.SERVICIO_COMANDAS);
    res.json(toMesa(mesa));
  } catch (err) {
    throw mesaDuplicada(err, datos.numero);
  }
}

export async function editarMesa(req, res) {
  const { id } = req.valid.params;
  const datos = req.valid.body;
  const previa = await buscarMesa(id);

  // Sacar de servicio una mesa con gente sentada dejaría la cuenta huérfana.
  if (!datos.activa && previa.comandas.length > 0) {
    throw new ApiError(409, `La mesa ${previa.numero} tiene una cuenta abierta: ciérrala antes de desactivarla`);
  }

  try {
    const mesa = await prisma.mesa.update({ where: { id }, data: datos, include: conComandaAbierta });
    await audit.registrar("EDITAR_MESA", `Editó la mesa ${mesa.numero}`, audit.SERVICIO_COMANDAS);
    res.json(toMesa(mesa));
  } catch (err) {
    throw mesaDuplicada(err, datos.numero);
  }
}

// Igual que con los insumos: solo se borra lo que no tiene historia. Una mesa con
// ventas se desactiva, porque borrarla se llevaría las comandas por delante.
export async function eliminarMesa(req, res) {
  const { id } = req.valid.params;
  const mesa = await buscarMesa(id);

  const comandas = await prisma.comanda.count({ where: { mesaId: id } });
  if (comandas > 0) {
    throw new ApiError(409, `La mesa ${mesa.numero} ya tiene ${comandas} comanda(s) registradas. Desactívala en vez de borrarla.`);
  }

  await prisma.mesa.delete({ where: { id } });
  await audit.registrar("ELIMINAR_MESA", `Eliminó la mesa ${mesa.numero}`, audit.SERVICIO_COMANDAS);
  res.status(204).end();
}

// --- Comandas ---

export async function abrir(req, res) {
  const { mesaId, comensales, notas } = req.valid.body;
  const mesa = await prisma.mesa.findUnique({ where: { id: mesaId } });
  if (!mesa) throw noEncontrado("Mesa no encontrada");
  if (!mesa.activa) throw new ApiError(409, `La mesa ${mesa.numero} está fuera de servicio`);

  try {
    const comanda = await prisma.comanda.create({
      data: {
        mesaId,
        meseroId: req.user.id,
        comensales: comensales ?? null,
        notas,
        estado: "ABIERTA",
        fechaApertura: nowNaive(),
      },
      include: conItems,
    });
    publicar(TOPICS.salon, toComanda(comanda));
    responder(res, comanda);
  } catch (err) {
    // Lo impide un índice único parcial: si dos meseros abren la misma mesa a la
    // vez, uno de los dos llega aquí.
    if (err.code === "P2002") throw new ApiError(409, `La mesa ${mesa.numero} ya tiene una cuenta abierta`);
    throw err;
  }
}

export async function listar(req, res) {
  const comandas = await prisma.comanda.findMany({
    where: { estado: "ABIERTA", ...(req.query.mias === "true" ? { meseroId: req.user.id } : {}) },
    include: conItems,
    orderBy: { fechaApertura: "asc" },
  });
  res.json(comandas.map(toComanda));
}

export async function detalle(req, res) {
  responder(res, await buscarComanda(req.valid.params.id));
}

export async function agregarItem(req, res) {
  const { id } = req.valid.params;
  const { menuItemId, cantidad, notas } = req.valid.body;
  exigirAbierta(await buscarComanda(id));

  const plato = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
  if (!plato) throw noEncontrado("Producto no encontrado");
  if (!plato.disponible || !plato.visibleSalon) {
    throw new ApiError(409, `"${plato.nombre}" no está disponible en el salón`);
  }

  const precio = plato.precio ?? 0;

  // El mesero toca el mismo plato varias veces seguidas: eso es "tres truchas",
  // no tres renglones de uno. Se agrupa solo si coinciden plato, notas y precio;
  // una nota distinta es un plato distinto para la cocina.
  const repetido = await prisma.comandaItem.findFirst({
    where: {
      comandaId: id,
      menuItemId: plato.id,
      estado: "BORRADOR",
      notas: notas ?? null,
      precioUnitario: precio,
    },
    orderBy: { id: "asc" },
  });

  if (repetido) {
    await prisma.comandaItem.update({
      where: { id: repetido.id },
      data: { cantidad: { increment: cantidad } },
    });
  } else {
    // Nombre y precio se congelan aquí: cambiar la carta mañana no reescribe esta venta.
    await prisma.comandaItem.create({
      data: {
        comandaId: id,
        menuItemId: plato.id,
        nombreItem: plato.nombre,
        precioUnitario: precio,
        cantidad,
        notas: notas ?? null,
        estado: "BORRADOR",
        fechaCreacion: nowNaive(),
      },
    });
  }

  responder(res, await buscarComanda(id));
}

async function itemEditable(comandaId, itemId) {
  const item = await prisma.comandaItem.findFirst({ where: { id: itemId, comandaId } });
  if (!item) throw noEncontrado("Plato no encontrado en esta comanda");
  if (item.estado !== "BORRADOR") {
    throw new ApiError(409, "El plato ya se envió a cocina: cancélalo en vez de modificarlo");
  }
  return item;
}

export async function editarItem(req, res) {
  const { id, itemId } = req.valid.params;
  exigirAbierta(await buscarComanda(id));
  await itemEditable(id, itemId);

  await prisma.comandaItem.update({ where: { id: itemId }, data: req.valid.body });
  responder(res, await buscarComanda(id));
}

export async function quitarItem(req, res) {
  const { id, itemId } = req.valid.params;
  exigirAbierta(await buscarComanda(id));
  await itemEditable(id, itemId);

  await prisma.comandaItem.delete({ where: { id: itemId } });
  responder(res, await buscarComanda(id));
}

/**
 * Envía a cocina los platos en borrador y descuenta el inventario.
 *
 * Todo ocurre en una transacción: marcar los platos es la puerta de entrada
 * (si otra petición los marcó primero, esta no encuentra nada que enviar y no
 * descuenta dos veces), y los insumos se aplican siempre en orden ascendente
 * de id para que dos envíos simultáneos no se bloqueen mutuamente.
 *
 * Si el stock no alcanza NO se bloquea el envío: queda negativo, el plato y la
 * comanda se marcan con faltante y se avisa a administración.
 */
export async function enviarACocina(req, res) {
  const { id } = req.valid.params;
  exigirAbierta(await buscarComanda(id));
  const enviadoEn = nowNaive();

  const { faltantes, sinReceta } = await prisma.$transaction(async (tx) => {
    const marcados = await tx.comandaItem.updateMany({
      where: { comandaId: id, estado: "BORRADOR" },
      data: { estado: "PENDIENTE", fechaEnvio: enviadoEn, inventarioAplicado: true },
    });
    if (marcados.count === 0) throw new ApiError(409, "No hay platos nuevos que enviar");

    const items = await tx.comandaItem.findMany({
      where: { comandaId: id, fechaEnvio: enviadoEn, estado: "PENDIENTE" },
    });

    const menuItemIds = [...new Set(items.map((i) => i.menuItemId).filter(Boolean))];
    const recetas = await tx.recetaItem.findMany({ where: { menuItemId: { in: menuItemIds } } });

    const consumos = [];
    for (const item of items) {
      for (const linea of recetas.filter((r) => r.menuItemId === item.menuItemId)) {
        consumos.push({
          insumoId: linea.insumoId,
          comandaItemId: item.id,
          cantidad: Number(linea.cantidad) * item.cantidad,
        });
      }
    }
    consumos.sort((a, b) => Number(a.insumoId - b.insumoId));

    const faltantes = new Map();
    const itemsConFaltante = new Set();

    for (const consumo of consumos) {
      const insumo = await aplicarMovimiento(tx, {
        insumoId: consumo.insumoId,
        tipo: "CONSUMO",
        cantidad: -consumo.cantidad,
        motivo: `Comanda #${id}`,
        comandaItemId: consumo.comandaItemId,
        usuarioId: req.user.id,
      });

      if (Number(insumo.stock) < 0) {
        faltantes.set(insumo.nombre, { insumo: insumo.nombre, unidad: insumo.unidad, stock: Number(insumo.stock) });
        itemsConFaltante.add(consumo.comandaItemId);
      }
    }

    if (itemsConFaltante.size > 0) {
      await tx.comandaItem.updateMany({ where: { id: { in: [...itemsConFaltante] } }, data: { faltoStock: true } });
      await tx.comanda.update({ where: { id }, data: { tieneFaltante: true } });
    }

    const conReceta = new Set(recetas.map((r) => Number(r.menuItemId)));
    const sinReceta = [...new Set(items.filter((i) => !conReceta.has(Number(i.menuItemId))).map((i) => i.nombreItem))];

    return { faltantes: [...faltantes.values()], sinReceta };
  }, TX);

  const comanda = await buscarComanda(id);
  const json = toComanda(comanda);

  // Fuera de la transacción: si algo falla y revierte, nadie debe haber sido avisado.
  publicar(TOPICS.cocina, json);
  if (faltantes.length > 0) publicar(TOPICS.adminInventario, { comandaId: json.id, faltantes });
  await audit.registrar(
    "ENVIAR_COCINA",
    `Envió a cocina la comanda #${id} (mesa ${comanda.mesa.numero})${faltantes.length ? " con faltantes" : ""}`,
    audit.SERVICIO_COMANDAS,
  );

  res.json({ comanda: json, faltantes, sinReceta });
}

/**
 * Cancela un plato ya enviado y devuelve lo que consumió.
 *
 * La devolución se calcula leyendo los movimientos que realmente se registraron,
 * no la receta: si la receta cambió después del envío, devolver por receta
 * dejaría el inventario torcido.
 */
export async function cancelarItem(req, res) {
  const { id, itemId } = req.valid.params;
  exigirAbierta(await buscarComanda(id));

  await prisma.$transaction(async (tx) => {
    const item = await tx.comandaItem.findFirst({ where: { id: itemId, comandaId: id } });
    if (!item) throw noEncontrado("Plato no encontrado en esta comanda");

    const cancelado = await tx.comandaItem.updateMany({
      where: { id: itemId, estado: { in: EN_COCINA } },
      data: { estado: "CANCELADO", inventarioAplicado: false },
    });
    if (cancelado.count === 0) {
      throw new ApiError(409, `No se puede cancelar un plato que ya está ${item.estado.toLowerCase()}`);
    }

    if (!item.inventarioAplicado) return;

    const movimientos = await tx.movimientoInventario.findMany({
      where: { comandaItemId: itemId, tipo: "CONSUMO" },
      orderBy: { insumoId: "asc" },
    });
    for (const movimiento of movimientos) {
      await aplicarMovimiento(tx, {
        insumoId: movimiento.insumoId,
        tipo: "DEVOLUCION",
        cantidad: -Number(movimiento.cantidad),
        motivo: `Cancelación en comanda #${id}`,
        comandaItemId: itemId,
        usuarioId: req.user.id,
      });
    }
  }, TX);

  const comanda = await buscarComanda(id);
  const json = toComanda(comanda);
  publicar(TOPICS.cocina, json);
  await audit.registrar("CANCELAR_PLATO", `Canceló un plato de la comanda #${id}`, audit.SERVICIO_COMANDAS);
  responder(res, comanda);
}

export async function cerrar(req, res) {
  const { id } = req.valid.params;
  const { metodoPago, forzar } = req.valid.body;
  const comanda = await buscarComanda(id);
  exigirAbierta(comanda);

  const enBorrador = comanda.items.filter((i) => i.estado === "BORRADOR");
  if (enBorrador.length > 0) {
    throw new ApiError(409, `Hay ${enBorrador.length} plato(s) sin enviar a cocina`);
  }

  const enCocina = comanda.items.filter((i) => EN_COCINA.includes(i.estado));
  if (enCocina.length > 0 && !(forzar && req.user.rol === ROL.ADMIN)) {
    throw new ApiError(409, `Todavía hay ${enCocina.length} plato(s) en cocina`);
  }

  const total = totalDeItems(comanda.items.map(toComandaItem));
  const cerrada = await prisma.comanda.update({
    where: { id },
    data: { estado: "CERRADA", metodoPago, total, fechaCierre: nowNaive() },
    include: conItems,
  });

  const json = toComanda(cerrada);
  publicar(TOPICS.salon, json);
  await audit.registrar(
    "CERRAR_COMANDA",
    `Cerró la comanda #${id} (mesa ${comanda.mesa.numero}) por ${total} en ${metodoPago}`,
    audit.SERVICIO_COMANDAS,
  );
  responder(res, cerrada);
}

// --- Cocina ---

export async function colaCocina(req, res) {
  const items = await prisma.comandaItem.findMany({
    where: { estado: { in: EN_COCINA } },
    orderBy: { fechaEnvio: "asc" },
    include: { comanda: { include: { mesa: true } } },
  });

  res.json(
    items.map((item) => ({
      ...toComandaItem(item),
      comandaId: Number(item.comandaId),
      mesa: item.comanda.mesa.numero,
    })),
  );
}

export async function cambiarEstadoCocina(req, res) {
  const { id } = req.valid.params;
  const { estado } = req.valid.body;

  const item = await prisma.comandaItem.findUnique({ where: { id }, include: { comanda: true } });
  if (!item) throw noEncontrado("Plato no encontrado");
  if (!EN_COCINA.includes(item.estado)) {
    throw new ApiError(409, `Ese plato ya está ${item.estado.toLowerCase()}`);
  }

  const actualizado = await prisma.comandaItem.update({
    where: { id },
    data: { estado, fechaListo: estado === "LISTO" ? nowNaive() : null },
    include: { comanda: { include: { mesa: true } } },
  });

  const json = {
    ...toComandaItem(actualizado),
    comandaId: Number(actualizado.comandaId),
    mesa: actualizado.comanda.mesa.numero,
  };
  publicar(TOPICS.cocina, json);
  if (estado === "LISTO") {
    publicar(TOPICS.salon, json);
    publicar(TOPICS.comandasMesero(Number(item.comanda.meseroId)), json);
  }
  res.json(json);
}

export async function entregarItem(req, res) {
  const { id, itemId } = req.valid.params;
  const item = await prisma.comandaItem.findFirst({ where: { id: itemId, comandaId: id } });
  if (!item) throw noEncontrado("Plato no encontrado en esta comanda");
  if (item.estado !== "LISTO") {
    throw new ApiError(409, "Solo se puede entregar un plato que la cocina ya marcó como listo");
  }

  await prisma.comandaItem.update({ where: { id: itemId }, data: { estado: "ENTREGADO" } });
  responder(res, await buscarComanda(id));
}
