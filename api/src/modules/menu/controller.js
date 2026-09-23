import { prisma } from "../../config/prisma.js";
import { ApiError, noEncontrado } from "../../lib/errors.js";
import { toCategoria, toMenuItem } from "../../lib/serialize.js";
import * as audit from "../audit/service.js";

const porId = { orderBy: { id: "asc" } };

// --- Público ---

export async function listarCategorias(req, res) {
  const categorias = await prisma.categoria.findMany({ ...porId, include: { items: porId } });
  res.json(categorias.map(toCategoria));
}

export async function listarDisponibles(req, res) {
  const items = await prisma.menuItem.findMany({ ...porId, where: { disponible: true } });
  res.json(items.map(toMenuItem));
}

export async function listarPorCategoria(req, res) {
  const items = await prisma.menuItem.findMany({ ...porId, where: { categoriaId: req.valid.params.id } });
  res.json(items.map(toMenuItem));
}

export async function obtenerItem(req, res) {
  const item = await prisma.menuItem.findUnique({ where: { id: req.valid.params.id } });
  if (!item) throw noEncontrado("Producto no encontrado");
  res.json(toMenuItem(item));
}

// --- Admin ---

async function asegurarCategoria(categoriaId) {
  const existe = await prisma.categoria.findUnique({ where: { id: categoriaId }, select: { id: true } });
  if (!existe) throw new ApiError(400, "Categoría no encontrada");
}

export async function listarTodos(req, res) {
  const items = await prisma.menuItem.findMany(porId);
  res.json(items.map(toMenuItem));
}

export async function listarAuditoria(req, res) {
  res.json(await audit.listar(audit.SERVICIO_MENU));
}

export async function crear(req, res) {
  const data = req.valid.body;
  await asegurarCategoria(data.categoriaId);
  const item = await prisma.menuItem.create({ data });
  await audit.registrar("CREAR_PRODUCTO", `Creó el producto "${item.nombre}"`, audit.SERVICIO_MENU);
  res.json(toMenuItem(item));
}

export async function actualizar(req, res) {
  const { id } = req.valid.params;
  const data = req.valid.body;
  const existe = await prisma.menuItem.findUnique({ where: { id }, select: { id: true } });
  if (!existe) throw noEncontrado("Producto no encontrado");

  await asegurarCategoria(data.categoriaId);
  const item = await prisma.menuItem.update({ where: { id }, data });
  await audit.registrar("EDITAR_PRODUCTO", `Editó el producto "${item.nombre}"`, audit.SERVICIO_MENU);
  res.json(toMenuItem(item));
}

export async function eliminar(req, res) {
  const { id } = req.valid.params;
  const item = await prisma.menuItem.findUnique({ where: { id }, select: { nombre: true } });
  if (!item) throw noEncontrado("Producto no encontrado");

  await prisma.menuItem.delete({ where: { id } });
  await audit.registrar("ELIMINAR_PRODUCTO", `Eliminó el producto "${item.nombre}"`, audit.SERVICIO_MENU);
  res.status(204).end();
}
