// Constantes y ayudas sin JSX: viven aparte de los componentes para que la
// recarga en caliente de React funcione bien.

// Cada rol entra directo a lo suyo. Toda ruta de aquí debe existir en App.jsx,
// o el comodín "*" devolvería al inicio y entraría en bucle.
export const INICIO_POR_ROL = {
  MESERO: "/mesas",
  COCINA: "/cocina",
  ADMIN: "/admin",
};

export const ETIQUETA_ESTADO = {
  BORRADOR: "Sin enviar",
  PENDIENTE: "En cola",
  PREPARANDO: "Preparando",
  LISTO: "Listo",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const COLOR_ESTADO = {
  BORRADOR: "bg-neutral-200 text-neutral-700",
  PENDIENTE: "bg-amber-100 text-amber-800",
  PREPARANDO: "bg-blue-100 text-blue-800",
  LISTO: "bg-emerald-100 text-emerald-800",
  ENTREGADO: "bg-neutral-100 text-neutral-500",
  CANCELADO: "bg-neutral-100 text-neutral-400 line-through",
};

export const pesos = (valor) => `$${Number(valor || 0).toLocaleString("es-CO")}`;

// Minutos transcurridos desde una marca de tiempo "naive" del servidor.
export const minutosDesde = (fecha) => {
  if (!fecha) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / 60000));
};

export const ETIQUETA_PAGO = {
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta",
  TRANSFERENCIA: "Transferencia",
  SIN_REGISTRAR: "Sin registrar",
};

export const UNIDADES = [
  { valor: "UND", texto: "Unidades" },
  { valor: "G", texto: "Gramos" },
  { valor: "ML", texto: "Mililitros" },
];

// Cantidades de inventario: hasta 3 decimales, pero sin ceros de adorno.
export const cantidad = (valor) => {
  const n = Number(valor || 0);
  return n.toLocaleString("es-CO", { maximumFractionDigits: 3 });
};

// Fecha de hoy en AAAA-MM-DD, hora local, para los campos de rango.
export const hoyISO = () => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${String(d.getDate()).padStart(2, "0")}`;
};
