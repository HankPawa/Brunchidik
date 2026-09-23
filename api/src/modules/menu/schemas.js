import { z } from "zod";
import { id, texto, textoOpcional } from "../../lib/schemas.js";

export const menuItemSchema = z.object({
  nombre: texto("El nombre"),
  descripcion: textoOpcional("La descripción", 5000),
  precio: z.coerce
    .number({ error: "El precio es obligatorio" })
    .min(0, "El precio no puede ser negativo")
    .max(999_999_999, "El precio es demasiado alto"),
  disponible: z.boolean({ error: "'disponible' debe ser verdadero o falso" }).default(true),
  categoriaId: id,
  imagenUrl: textoOpcional("La URL de la imagen"),
});
