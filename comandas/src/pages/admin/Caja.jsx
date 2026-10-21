import { ArrowDownLeft, ArrowUpRight, Ban, Lock, Unlock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Aviso, Boton, Campo, Cargando, Hoja, Selector, Vacio } from "../../components/ui";
import { useAuth } from "../../context/sesion";
import { useWebSocket } from "../../hooks/useWebSocket";
import { ETIQUETA_PAGO, pesos } from "../../lib/formato";

const TOPICS = ["/topic/admin/caja"];
const METODOS = ["EFECTIVO", "TARJETA", "TRANSFERENCIA"];

const CONTEO_VACIO = { EFECTIVO: "", TARJETA: "", TRANSFERENCIA: "" };

export default function Caja() {
  const { pedir } = useAuth();
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);

  const [abriendo, setAbriendo] = useState(null);
  const [movimiento, setMovimiento] = useState(null);
  const [cerrando, setCerrando] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setEstado(await pedir("/api/admin/caja"));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [pedir]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // El servidor empuja el cuadre completo cada vez que se cobra una mesa o se
  // registra un movimiento: no hace falta volver a pedirlo.
  useWebSocket("/ws", TOPICS, (mensaje) => {
    if (mensaje?.abierta === false) setEstado({ abierta: false, arqueo: null, cuadre: null });
    else if (mensaje?.arqueo) setEstado(mensaje);
  });

  const enviar = async (url, cuerpo, metodo = "POST") => {
    setOcupado(true);
    setError("");
    try {
      setEstado(await pedir(url, { method: metodo, ...(cuerpo ? { body: JSON.stringify(cuerpo) } : {}) }));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setOcupado(false);
    }
  };

  if (cargando) return <Cargando />;

  const { abierta, arqueo, cuadre } = estado ?? {};

  return (
    <div className="p-4">
      <Aviso onReintentar={cargar}>{error}</Aviso>

      {!abierta ? (
        <SinCaja onAbrir={() => setAbriendo({ baseInicial: "", notas: "" })} />
      ) : (
        <>
          <Resumen cuadre={cuadre} arqueo={arqueo} />

          <div className="mt-4 flex gap-2">
            <Boton
              variante="secundario"
              className="flex flex-1 items-center justify-center gap-2"
              onClick={() => setMovimiento({ tipo: "INGRESO", concepto: "", monto: "" })}
            >
              <ArrowDownLeft size={18} /> Entrada
            </Boton>
            <Boton
              variante="secundario"
              className="flex flex-1 items-center justify-center gap-2"
              onClick={() => setMovimiento({ tipo: "EGRESO", concepto: "", monto: "" })}
            >
              <ArrowUpRight size={18} /> Salida
            </Boton>
            <Boton
              variante="dorado"
              className="flex flex-1 items-center justify-center gap-2"
              onClick={() => setCerrando({ conteo: { ...CONTEO_VACIO }, notas: "" })}
            >
              <Lock size={18} /> Cerrar caja
            </Boton>
          </div>

          <Movimientos
            movimientos={arqueo.movimientos}
            onAnular={(id) => enviar(`/api/admin/caja/movimientos/${id}`, null, "DELETE")}
            ocupado={ocupado}
          />
        </>
      )}

      {abriendo && (
        <Hoja titulo="Abrir caja" error={error} onCerrar={() => setAbriendo(null)}>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await enviar("/api/admin/caja/abrir", {
                baseInicial: Number(abriendo.baseInicial || 0),
                notas: abriendo.notas || null,
              });
              if (ok) setAbriendo(null);
            }}
          >
            <Campo
              etiqueta="Base inicial"
              type="number"
              required
              min="0"
              step="100"
              autoFocus
              value={abriendo.baseInicial}
              onChange={(e) => setAbriendo({ ...abriendo, baseInicial: e.target.value })}
              ayuda="El dinero con el que empieza el cajón, antes de vender nada."
            />
            <Campo
              etiqueta="Notas"
              value={abriendo.notas}
              onChange={(e) => setAbriendo({ ...abriendo, notas: e.target.value })}
            />
            <Boton type="submit" cargando={ocupado} className="w-full">
              Abrir caja
            </Boton>
          </form>
        </Hoja>
      )}

      {movimiento && (
        <Hoja
          titulo={movimiento.tipo === "INGRESO" ? "Entrada de dinero" : "Salida de dinero"}
          error={error}
          onCerrar={() => setMovimiento(null)}
        >
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await enviar("/api/admin/caja/movimientos", {
                tipo: movimiento.tipo,
                concepto: movimiento.concepto,
                monto: Number(movimiento.monto),
              });
              if (ok) setMovimiento(null);
            }}
          >
            <Selector
              etiqueta="Tipo"
              value={movimiento.tipo}
              onChange={(e) => setMovimiento({ ...movimiento, tipo: e.target.value })}
              opciones={[
                { valor: "INGRESO", texto: "Entrada — entra dinero al cajón" },
                { valor: "EGRESO", texto: "Salida — sale dinero del cajón" },
              ]}
            />
            <Campo
              etiqueta="Concepto"
              required
              maxLength={255}
              autoFocus
              value={movimiento.concepto}
              onChange={(e) => setMovimiento({ ...movimiento, concepto: e.target.value })}
              ayuda="Obligatorio: un movimiento sin explicar es el que después nadie justifica."
            />
            <Campo
              etiqueta="Monto"
              type="number"
              required
              min="1"
              step="100"
              value={movimiento.monto}
              onChange={(e) => setMovimiento({ ...movimiento, monto: e.target.value })}
            />
            <Boton type="submit" cargando={ocupado} className="w-full">
              Registrar
            </Boton>
          </form>
        </Hoja>
      )}

      {cerrando && (
        <Hoja titulo="Cerrar caja" error={error} onCerrar={() => setCerrando(null)}>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await enviar("/api/admin/caja/cerrar", {
                contadoEfectivo: Number(cerrando.conteo.EFECTIVO || 0),
                contadoTarjeta: Number(cerrando.conteo.TARJETA || 0),
                contadoTransferencia: Number(cerrando.conteo.TRANSFERENCIA || 0),
                notas: cerrando.notas || null,
              });
              if (ok) setCerrando(null);
            }}
          >
            <p className="text-sm text-neutral-500">
              Cuenta el dinero y escribe lo que hay <strong>de verdad</strong>. La diferencia se calcula sola.
            </p>

            {METODOS.map((metodo) => {
              const esperado = cuadre.esperado[metodo];
              const escrito = cerrando.conteo[metodo];
              const diferencia = escrito === "" ? null : Number(escrito) - esperado;

              return (
                <div key={metodo}>
                  <Campo
                    etiqueta={`${ETIQUETA_PAGO[metodo]} contado`}
                    type="number"
                    required
                    min="0"
                    step="100"
                    autoFocus={metodo === "EFECTIVO"}
                    value={escrito}
                    onChange={(e) =>
                      setCerrando({ ...cerrando, conteo: { ...cerrando.conteo, [metodo]: e.target.value } })
                    }
                    ayuda={`Esperado: ${pesos(esperado)}`}
                  />
                  {diferencia !== null && diferencia !== 0 && (
                    <p className={`mt-1 text-sm font-semibold ${diferencia < 0 ? "text-alerta" : "text-dorado"}`}>
                      {diferencia < 0 ? "Faltan " : "Sobran "}
                      {pesos(Math.abs(diferencia))}
                    </p>
                  )}
                </div>
              );
            })}

            <Campo
              etiqueta="Notas del cierre"
              value={cerrando.notas}
              onChange={(e) => setCerrando({ ...cerrando, notas: e.target.value })}
              ayuda="Si hay descuadre, explica aquí a qué se debió."
            />
            <Boton type="submit" variante="dorado" cargando={ocupado} className="w-full">
              Cerrar caja
            </Boton>
          </form>
        </Hoja>
      )}
    </div>
  );
}

function SinCaja({ onAbrir }) {
  return (
    <div className="rounded-2xl border border-crema-borde bg-white p-8 text-center">
      <Unlock className="mx-auto mb-3 text-neutral-300" size={40} />
      <p className="mb-1 text-lg font-bold text-tinta">La caja está cerrada</p>
      <p className="mb-5 text-sm text-neutral-500">
        Ábrela con el dinero que haya en el cajón para empezar a cuadrar el día.
      </p>
      <Boton onClick={onAbrir}>Abrir caja</Boton>
    </div>
  );
}

function Resumen({ cuadre, arqueo }) {
  const sinMetodo = cuadre.ventas.SIN_REGISTRAR;

  return (
    <>
      <div className="rounded-2xl border-2 border-dorado bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Debería haber en el cajón</p>
        <p className="text-4xl font-bold text-tinta">{pesos(cuadre.esperado.EFECTIVO)}</p>
        <p className="mt-1 text-sm text-neutral-500">
          Base {pesos(cuadre.baseInicial)} + ventas en efectivo {pesos(cuadre.ventas.EFECTIVO)}
          {cuadre.ingresos > 0 && ` + entradas ${pesos(cuadre.ingresos)}`}
          {cuadre.egresos > 0 && ` − salidas ${pesos(cuadre.egresos)}`}
        </p>
        <p className="mt-2 text-xs text-neutral-400">
          Abierta desde {arqueo.fechaApertura?.replace("T", " ").slice(0, 16)} · {cuadre.comandas} cuenta(s) cobradas
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Tarjeta titulo="Tarjeta" valor={cuadre.esperado.TARJETA} nota="Cuadra contra el datáfono" />
        <Tarjeta titulo="Transferencias" valor={cuadre.esperado.TRANSFERENCIA} nota="Cuadra contra el banco" />
      </div>

      {sinMetodo > 0 && (
        <div className="mt-3 rounded-xl border border-alerta/30 bg-alerta/10 p-3 text-sm text-alerta">
          <strong>{pesos(sinMetodo)}</strong> en cuentas cerradas sin método de pago. No entran en ningún esperado:
          revísalas antes de cerrar.
        </div>
      )}
    </>
  );
}

function Tarjeta({ titulo, valor, nota }) {
  return (
    <div className="rounded-xl border border-crema-borde bg-white p-3">
      <p className="text-xs text-neutral-500">{titulo}</p>
      <p className="text-xl font-bold text-tinta">{pesos(valor)}</p>
      <p className="text-xs text-neutral-400">{nota}</p>
    </div>
  );
}

function Movimientos({ movimientos, onAnular, ocupado }) {
  if (!movimientos || movimientos.length === 0) {
    return (
      <section className="mt-5">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-500">Movimientos</h3>
        <Vacio>Sin entradas ni salidas de dinero.</Vacio>
      </section>
    );
  }

  return (
    <section className="mt-5">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-500">Movimientos</h3>
      <ul className="overflow-hidden rounded-xl border border-crema-borde bg-white">
        {movimientos.map((m) => (
          <li
            key={m.id}
            className={`flex items-center gap-3 border-b border-crema-borde px-3 py-2 last:border-0 ${
              m.anulado ? "opacity-50" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className={`truncate font-medium text-tinta ${m.anulado ? "line-through" : ""}`}>{m.concepto}</p>
              <p className="text-xs text-neutral-500">
                {m.fecha?.replace("T", " ").slice(0, 16)}
                {m.anulado && " · anulado"}
              </p>
            </div>
            <span className={`shrink-0 font-semibold ${m.tipo === "EGRESO" ? "text-alerta" : "text-emerald-700"}`}>
              {m.tipo === "EGRESO" ? "−" : "+"}
              {pesos(m.monto)}
            </span>
            {!m.anulado && (
              <button
                onClick={() => onAnular(m.id)}
                disabled={ocupado}
                title="Anular"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg text-neutral-400 active:bg-crema disabled:opacity-40"
              >
                <Ban size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-neutral-400">
        Los movimientos no se borran: se anulan, para que el arqueo siempre pueda explicarse.
      </p>
    </section>
  );
}
