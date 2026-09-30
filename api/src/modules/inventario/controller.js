import { prisma } from "../../config/prisma.js";
import { ApiError, noEncontrado } from "../../lib/errors.js";
import { toInsumo, toMenuItem, toMovimiento, toRecetaItem } from "../../lib/serialize.js";
import * as audit from "../audit/service.js";
import { aplicarMovimiento } from "./service.js";

const porNombre = { orderBy: { nombre: "asc" } };

async function buscarInsumo(id) {
  const insumo = await prisma.insumo.findUnique({ where: { id } });
  if (!insumo) throw noEncontrado("Insumo no encontrado");
  return insumo;
}

// --- Insumos ---

export async function listarInsumos(req, res) {
  const insumos = await prisma.insumo.findMany(porNombre);
  res.json(insumos.map(toInsumo));
}

export async function crearInsumo(req, res) {
  const { stock, ...datos } = req.valid.body;

  // Se crea en cero y el stock inicial entra como movimiento: así el libro y la
  // columna cuadran desde el primer día, sin excepciones que auditar después.
  const insumo = await prisma.$transaction(async (tx) => {
    const creado = await tx.insumo.create({ data: { ...datos, stock: 0 } });
    if (stock === 0) return creado;
    return aplicarMovimiento(tx, {
      insumoId: creado.id,
      tipo: "COMPRA",
      cantidad: stock,
      motivo: "Stock inicial",
      usuarioId: req.user.id,
    });
  });

  await audit.registrar("CREAR_INSUMO", `Creó el insumo "${insumo.nombre}"`, audit.SERVICIO_INVENTARIO);
  res.json(toInsumo(insumo));
}

export async function editarInsumo(req, res) {
  const { id } = req.valid.params;
  await buscarInsumo(id);
  const insumo = await prisma.insumo.update({ where: { id }, data: req.valid.body });
  await audit.registrar("EDITAR_INSUMO", `Editó el insumo "${insumo.nombre}"`, audit.SERVICIO_INVENTARIO);
  res.json(toInsumo(insumo));
}

// Solo se borra lo que no tiene historia; el resto se desactiva para no romper
// las recetas ni los movimientos ya registrados.
export async function eliminarInsumo(req, res) {
  const { id } = req.valid.params;
  const insumo = await buscarInsumo(id);

  const [enRecetas, conMovimientos] = await Promise.all([
    prisma.recetaItem.count({ where: { insumoId: id } }),
    prisma.movimientoInventario.count({ where: { insumoId: id } }),
  ]);

  if (enRecetas > 0) {
    throw new ApiError(409, `"${insumo.nombre}" se usa en ${enRecetas} receta(s). Quítalo de ellas o desactívalo.`);
  }
  if (conMovimientos > 0) {
    throw new ApiError(409, `"${insumo.nombre}" ya tiene movimientos registrados. Desactívalo en vez de borrarlo.`);
  }

  await prisma.insumo.delete({ where: { id } });
  await audit.registrar("ELIMINAR_INSUMO", `Eliminó el insumo "${insumo.nombre}"`, audit.SERVICIO_INVENTARIO);
  res.status(204).end();
}

export async function ajustarStock(req, res) {
  const { id } = req.valid.params;
  const { cantidad, tipo, motivo } = req.valid.body;
  const previo = await buscarInsumo(id);

  const insumo = await prisma.$transaction((tx) =>
    aplicarMovimiento(tx, { insumoId: id, tipo, cantidad, motivo, usuarioId: req.user.id }),
  );

  const signo = cantidad > 0 ? "+" : "";
  await audit.registrar(
    "AJUSTAR_STOCK",
    `${tipo} de ${signo}${cantidad} ${previo.unidad} en "${previo.nombre}"${motivo ? `: ${motivo}` : ""}`,
    audit.SERVICIO_INVENTARIO,
  );
  res.json(toInsumo(insumo));
}

export async function listarMovimientos(req, res) {
  const { id } = req.valid.params;
  await buscarInsumo(id);
  const movimientos = await prisma.movimientoInventario.findMany({
    where: { insumoId: id },
    orderBy: { fecha: "desc" },
    take: 100,
  });
  res.json(movimientos.map(toMovimiento));
}

// --- Recetas ---

export async function obtenerReceta(req, res) {
  const { id } = req.valid.params;
  const plato = await prisma.menuItem.findUnique({
    where: { id },
    include: { receta: { include: { insumo: true }, orderBy: { id: "asc" } } },
  });
  if (!plato) throw noEncontrado("Producto no encontrado");

  res.json({ plato: toMenuItem(plato), receta: plato.receta.map(toRecetaItem) });
}

// Reemplaza la receta completa: es más simple de razonar que ir parcheando
// líneas sueltas, y la pantalla del admin envía siempre la receta entera.
export async function guardarReceta(req, res) {
  const { id } = req.valid.params;
  const { items } = req.valid.body;

  const plato = await prisma.menuItem.findUnique({ where: { id }, select: { nombre: true } });
  if (!plato) throw noEncontrado("Producto no encontrado");

  const insumoIds = items.map((i) => i.insumoId);
  if (new Set(insumoIds).size !== insumoIds.length) {
    throw new ApiError(400, "La receta tiene el mismo insumo repetido");
  }

  const existentes = await prisma.insumo.count({ where: { id: { in: insumoIds } } });
  if (existentes !== insumoIds.length) throw new ApiError(400, "Algún insumo de la receta no existe");

  const receta = await prisma.$transaction(async (tx) => {
    await tx.recetaItem.deleteMany({ where: { menuItemId: id } });
    if (items.length > 0) {
      await tx.recetaItem.createMany({
        data: items.map((i) => ({ menuItemId: id, insumoId: i.insumoId, cantidad: i.cantidad })),
      });
    }
    return tx.recetaItem.findMany({ where: { menuItemId: id }, include: { insumo: true }, orderBy: { id: "asc" } });
  });

  await audit.registrar(
    "GUARDAR_RECETA",
    `Definió la receta de "${plato.nombre}" con ${items.length} insumo(s)`,
    audit.SERVICIO_INVENTARIO,
  );
  res.json(receta.map(toRecetaItem));
}

// Qué platos siguen sin receta: sin ella se venden sin descontar nada.
export async function platosSinReceta(req, res) {
  const platos = await prisma.menuItem.findMany({
    where: { receta: { none: {} } },
    orderBy: { nombre: "asc" },
  });
  res.json(platos.map(toMenuItem));
}
