import { useCallback, useEffect, useState } from "react";
import { Aviso, Boton, Campo, Cargando, Vacio } from "../../components/ui";
import { useAuth } from "../../context/sesion";
import { cantidad, ETIQUETA_PAGO, hoyISO, pesos } from "../../lib/formato";

const PESTANAS = [
  { clave: "ventas", texto: "Ventas" },
  { clave: "consumo", texto: "Consumo" },
];

// Atajos: son los rangos que de verdad se piden ("cómo fue hoy", "cómo fue la semana").
function rangoAtajo(dias) {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(desde.getDate() - (dias - 1));
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { desde: iso(desde), hasta: iso(hasta) };
}

export default function Reportes() {
  const { pedir } = useAuth();
  const [pestana, setPestana] = useState("ventas");
  const [rango, setRango] = useState({ desde: hoyISO(), hasta: hoyISO() });
  // El resultado guarda de qué informe es: los dos tienen forma distinta y
  // pintar uno con los datos del otro reventaba al cambiar de pestaña. También
  // descarta una respuesta que llegue tarde después de cambiar de pestaña.
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      // Un campo de fecha vacío no se envía: la API entiende "sin filtro" y
      // responde con el día de hoy, en vez de rechazar la cadena vacía.
      const query = new URLSearchParams(
        Object.entries(rango).filter(([, v]) => v),
      ).toString();
      const datos = await pedir(`/api/admin/reportes/${pestana}?${query}`);
      setResultado({ tipo: pestana, datos });
      setError("");
    } catch (err) {
      setError(err.message);
      setResultado(null);
    } finally {
      setCargando(false);
    }
  }, [pedir, pestana, rango]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const datos = resultado?.tipo === pestana ? resultado.datos : null;

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        {PESTANAS.map(({ clave, texto }) => (
          <Boton
            key={clave}
            variante={pestana === clave ? "primario" : "secundario"}
            className="flex-1"
            onClick={() => setPestana(clave)}
          >
            {texto}
          </Boton>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-crema-borde bg-white p-3">
        <div className="flex gap-2">
          <Campo
            etiqueta="Desde"
            type="date"
            className="flex-1"
            value={rango.desde}
            onChange={(e) => setRango({ ...rango, desde: e.target.value })}
          />
          <Campo
            etiqueta="Hasta"
            type="date"
            className="flex-1"
            value={rango.hasta}
            onChange={(e) => setRango({ ...rango, hasta: e.target.value })}
          />
        </div>
        <div className="mt-2 flex gap-2 text-sm">
          <button onClick={() => setRango({ desde: hoyISO(), hasta: hoyISO() })} className="underline text-neutral-500">
            Hoy
          </button>
          <button onClick={() => setRango(rangoAtajo(7))} className="underline text-neutral-500">
            7 días
          </button>
          <button onClick={() => setRango(rangoAtajo(30))} className="underline text-neutral-500">
            30 días
          </button>
        </div>
      </div>

      <Aviso onReintentar={cargar}>{error}</Aviso>

      {cargando && <Cargando />}
      {!cargando &&
        datos &&
        (pestana === "ventas" ? <Ventas datos={datos} /> : <Consumo datos={datos} />)}
    </div>
  );
}

function Tarjeta({ titulo, valor }) {
  return (
    <div className="rounded-xl border border-crema-borde bg-white p-3">
      <p className="text-xs text-neutral-500">{titulo}</p>
      <p className="text-xl font-bold text-tinta">{valor}</p>
    </div>
  );
}

function Bloque({ titulo, children }) {
  return (
    <section className="mt-4">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-500">{titulo}</h3>
      <div className="overflow-hidden rounded-xl border border-crema-borde bg-white">{children}</div>
    </section>
  );
}

function Fila({ izquierda, centro, derecha, resaltar }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-crema-borde px-3 py-2 last:border-0">
      <span className={`min-w-0 flex-1 truncate ${resaltar ? "font-semibold text-alerta" : "text-tinta"}`}>
        {izquierda}
      </span>
      {centro && <span className="shrink-0 text-sm text-neutral-500">{centro}</span>}
      <span className="shrink-0 font-semibold text-tinta">{derecha}</span>
    </div>
  );
}

function Ventas({ datos }) {
  const { resumen, porDia, porMetodoPago, porPlato } = datos;

  if (resumen.comandas === 0) return <Vacio>No hay cuentas cobradas en este rango.</Vacio>;

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Tarjeta titulo="Vendido" valor={pesos(resumen.total)} />
        <Tarjeta titulo="Cuentas" valor={resumen.comandas} />
        <Tarjeta titulo="Platos" valor={resumen.platos} />
        <Tarjeta titulo="Ticket promedio" valor={pesos(resumen.ticketPromedio)} />
      </div>

      <Bloque titulo="Por método de pago">
        {porMetodoPago.map((m) => (
          <Fila
            key={m.metodoPago}
            izquierda={ETIQUETA_PAGO[m.metodoPago] ?? m.metodoPago}
            centro={`${m.comandas} cuenta(s)`}
            derecha={pesos(m.total)}
          />
        ))}
      </Bloque>

      <Bloque titulo="Platos más vendidos">
        {porPlato.map((p) => (
          <Fila key={p.nombre} izquierda={p.nombre} centro={`×${p.cantidad}`} derecha={pesos(p.total)} />
        ))}
      </Bloque>

      {porDia.length > 1 && (
        <Bloque titulo="Por día">
          {porDia.map((d) => (
            <Fila key={d.fecha} izquierda={d.fecha} centro={`${d.comandas} cuenta(s)`} derecha={pesos(d.total)} />
          ))}
        </Bloque>
      )}
    </>
  );
}

function Consumo({ datos }) {
  if (datos.insumos.length === 0) return <Vacio>No hubo movimientos de inventario en este rango.</Vacio>;

  return (
    <Bloque titulo="Consumo por insumo">
      {datos.insumos.map((i) => (
        <div key={i.insumoId} className="border-b border-crema-borde px-3 py-2 last:border-0">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 flex-1 truncate font-medium text-tinta">{i.nombre}</span>
            <span className="shrink-0 font-semibold text-tinta">
              {cantidad(i.neto)} {i.unidad}
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            gastado {cantidad(i.consumido)}
            {i.devuelto > 0 && ` · devuelto ${cantidad(i.devuelto)}`}
            {i.comprado > 0 && ` · comprado ${cantidad(i.comprado)}`}
            {i.ajustado !== 0 && ` · ajustes ${cantidad(i.ajustado)}`}
            {" · "}
            <span className={i.stockActual < 0 ? "font-semibold text-alerta" : i.bajoMinimo ? "font-semibold text-dorado" : ""}>
              quedan {cantidad(i.stockActual)} {i.unidad}
            </span>
          </p>
        </div>
      ))}
    </Bloque>
  );
}
