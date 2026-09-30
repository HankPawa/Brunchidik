import { z } from "zod";
import { id, textoOpcional } from "../../lib/schemas.js";

export const ESTADOS_COMANDA = ["ABIERTA", "CERRADA", "ANULADA"];
export const ESTADOS_ITEM = ["BORRADOR", "PENDIENTE", "PREPARANDO", "LISTO", "ENTREGADO", "CANCELADO"];
export const METODOS_PAGO = ["EFECTIVO", "TARJETA", "TRANSFERENCIA"];

// Lo que la cocina puede marcar: no puede entregar (eso lo hace el mesero) ni
// devolver un plato a pendiente.
export const ESTADOS_COCINA = ["PREPARANDO", "LISTO"];

export const abrirComandaSchema = z.object({
  mesaId: id,
  comensales: z.coerce
    .number({ error: "El número de comensales debe ser un número" })
    .int("El número de comensales debe ser entero")
    .min(1, "Debe haber al menos 1 comensal")
    .max(100, "Demasiados comensales para una sola mesa")
    .nullish(),
  notas: textoOpcional("Las notas"),
});

export const agregarItemSchema = z.object({
  menuItemId: id,
  cantidad: z.coerce
    .number({ error: "La cantidad es obligatoria" })
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad mínima es 1")
    .max(99, "Cantidad demasiado alta para un solo plato")
    .default(1),
  notas: textoOpcional("Las notas"),
});

export const editarItemSchema = z.object({
  cantidad: z.coerce
    .number({ error: "La cantidad es obligatoria" })
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad mínima es 1")
    .max(99, "Cantidad demasiado alta para un solo plato"),
  notas: textoOpcional("Las notas"),
});

export const cerrarComandaSchema = z.object({
  metodoPago: z.enum(METODOS_PAGO, { error: "El método de pago debe ser EFECTIVO, TARJETA o TRANSFERENCIA" }),
  // Salida de emergencia para el admin: cerrar aunque queden platos en cocina.
  forzar: z.boolean().default(false),
});

export const estadoCocinaSchema = z.object({
  estado: z.enum(ESTADOS_COCINA, { error: "La cocina solo puede marcar PREPARANDO o LISTO" }),
});

export const mesaSchema = z.object({
  numero: z.coerce
    .number({ error: "El número de mesa es obligatorio" })
    .int("El número de mesa debe ser entero")
    .min(1, "El número de mesa empieza en 1")
    .max(999, "Número de mesa demasiado alto"),
  nombre: textoOpcional("El nombre", 60),
  capacidad: z.coerce
    .number({ error: "La capacidad debe ser un número" })
    .int("La capacidad debe ser entera")
    .min(1, "La capacidad mínima es 1")
    .max(100, "Capacidad demasiado alta para una sola mesa")
    .nullish(),
  activa: z.boolean({ error: "'activa' debe ser verdadero o falso" }).default(true),
});

export const itemParams = z.object({ id, itemId: id });
