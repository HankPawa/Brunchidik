import { z } from "zod";
import { id, texto, textoOpcional } from "../../lib/schemas.js";

export const UNIDADES = ["G", "ML", "UND"];

// Las cantidades del inventario se guardan con 3 decimales: más precisión
// sería falsa (nadie pesa medio miligramo) y menos no alcanza para mililitros.
const cantidad = (campo, { minimo = 0 } = {}) =>
  z.coerce
    .number({ error: `${campo} es obligatorio` })
    .min(minimo, `${campo} no puede ser menor que ${minimo}`)
    .max(9_999_999, `${campo} es demasiado alto`);

export const crearInsumoSchema = z.object({
  nombre: texto("El nombre"),
  unidad: z.enum(UNIDADES, { error: "La unidad debe ser G, ML o UND" }),
  stock: cantidad("El stock").default(0),
  stockMinimo: cantidad("El stock mínimo").default(0),
  activo: z.boolean().default(true),
});

// Al editar no se toca el stock: para eso están los ajustes, que dejan rastro.
export const editarInsumoSchema = crearInsumoSchema.omit({ stock: true });

export const ajusteSchema = z
  .object({
    cantidad: z.coerce
      .number({ error: "La cantidad es obligatoria" })
      .refine((v) => v !== 0, "La cantidad no puede ser cero")
      .refine((v) => Math.abs(v) <= 9_999_999, "La cantidad es demasiado alta"),
    tipo: z.enum(["COMPRA", "AJUSTE"], { error: "El tipo debe ser COMPRA o AJUSTE" }).default("AJUSTE"),
    motivo: textoOpcional("El motivo"),
  })
  .refine((v) => v.tipo !== "AJUSTE" || v.motivo, {
    error: "Un ajuste manual necesita un motivo",
    path: ["motivo"],
  });

export const recetaSchema = z.object({
  items: z
    .array(
      z.object({
        insumoId: id,
        cantidad: cantidad("La cantidad", { minimo: 0.001 }),
      }),
    )
    .max(50, "Demasiados insumos en una sola receta"),
});
