import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { COLOR_ESTADO, ETIQUETA_ESTADO } from "../lib/formato";

// Piezas compartidas. Todo lo pulsable mide al menos 48px: se usa con el dedo,
// muchas veces con prisa y con las manos ocupadas.

const VARIANTES = {
  primario: "bg-tinta text-white active:bg-tinta-suave disabled:bg-neutral-400",
  secundario: "bg-white text-tinta border border-crema-borde active:bg-crema disabled:text-neutral-400",
  peligro: "bg-alerta text-white active:brightness-90 disabled:bg-neutral-400",
  dorado: "bg-dorado text-tinta active:brightness-95 disabled:bg-neutral-400",
};

export function Boton({ variante = "primario", cargando = false, className = "", children, ...props }) {
  return (
    <button
      {...props}
      disabled={props.disabled || cargando}
      className={`min-h-12 rounded-xl px-5 font-semibold transition disabled:cursor-not-allowed ${VARIANTES[variante]} ${className}`}
    >
      {cargando ? <Loader2 className="mx-auto animate-spin" size={20} /> : children}
    </button>
  );
}

export function Cargando({ texto = "Cargando..." }) {
  return (
    <div className="flex items-center justify-center gap-3 p-10 text-neutral-500">
      <Loader2 className="animate-spin" size={20} />
      {texto}
    </div>
  );
}

export function Aviso({ children, onReintentar, className = "m-4" }) {
  if (!children) return null;
  return (
    <div className={`rounded-xl border border-alerta/30 bg-alerta/10 p-4 text-alerta ${className}`}>
      <p className="font-medium">{children}</p>
      {onReintentar && (
        <button onClick={onReintentar} className="mt-2 underline">
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Vacio({ children }) {
  return <p className="p-10 text-center text-neutral-400">{children}</p>;
}

export function Estado({ valor }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${COLOR_ESTADO[valor] ?? "bg-neutral-100"}`}>
      {ETIQUETA_ESTADO[valor] ?? valor}
    </span>
  );
}

// --- Formularios ---

const CONTROL =
  "min-h-12 w-full rounded-xl border border-crema-borde bg-white px-3 text-tinta outline-none focus:border-dorado";

export function Campo({ etiqueta, ayuda, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-neutral-600">{etiqueta}</span>
      <input {...props} className={CONTROL} />
      {ayuda && <span className="mt-1 block text-xs text-neutral-400">{ayuda}</span>}
    </label>
  );
}

export function AreaTexto({ etiqueta, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-neutral-600">{etiqueta}</span>
      <textarea {...props} className={`${CONTROL} min-h-24 py-2`} />
    </label>
  );
}

export function Selector({ etiqueta, opciones, ayuda, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-neutral-600">{etiqueta}</span>
      <select {...props} className={CONTROL}>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
      {ayuda && <span className="mt-1 block text-xs text-neutral-400">{ayuda}</span>}
    </label>
  );
}

export function Casilla({ etiqueta, ayuda, ...props }) {
  return (
    <label className="flex min-h-12 items-center gap-3">
      <input type="checkbox" {...props} className="size-5 accent-dorado" />
      <span>
        <span className="font-medium text-tinta">{etiqueta}</span>
        {ayuda && <span className="block text-xs text-neutral-400">{ayuda}</span>}
      </span>
    </label>
  );
}

// Formularios en panel deslizante: abajo en el celular, centrado en pantalla grande.
// El error se pinta aquí dentro: si se quedara en la página, el panel lo taparía y
// el usuario vería que su botón "no hace nada".
export function Hoja({ titulo, error, onCerrar, children }) {
  useEffect(() => {
    const alPulsar = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [onCerrar]);

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center sm:items-center">
      <button aria-label="Cerrar" onClick={onCerrar} className="absolute inset-0 bg-tinta/40" />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-tinta">{titulo}</h2>
          <button onClick={onCerrar} className="flex size-10 items-center justify-center rounded-lg text-neutral-400">
            <X size={20} />
          </button>
        </div>
        <Aviso className="mb-4">{error}</Aviso>
        {children}
      </div>
    </div>
  );
}
