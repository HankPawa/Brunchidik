import { useCallback, useEffect, useMemo, useState } from "react";
import { Minus, Plus, Send, Trash2, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/sesion";
import { useWebSocket } from "../hooks/useWebSocket";
import { Cabecera, Pantalla } from "../components/Layout";
import { Aviso, Boton, Cargando, Estado } from "../components/ui";
import { pesos } from "../lib/formato";

const METODOS = [
  ["EFECTIVO", "Efectivo"],
  ["TARJETA", "Tarjeta"],
  ["TRANSFERENCIA", "Transferencia"],
];

export default function Comanda() {
  const { id } = useParams();
  const { pedir, user } = useAuth();
  const navigate = useNavigate();

  const [comanda, setComanda] = useState(null);
  const [carta, setCarta] = useState([]);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [vista, setVista] = useState("cuenta"); // cuenta | carta | cobro

  const cargar = useCallback(async () => {
    try {
      setComanda(await pedir(`/api/comandas/${id}`));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [pedir, id]);

  useEffect(() => {
    cargar();
    pedir("/api/salon/menu").then(setCarta).catch((err) => setError(err.message));
  }, [cargar, pedir]);

  // Cuando cocina marca un plato listo, la cuenta se actualiza sola.
  const topics = useMemo(() => (user ? [`/topic/mesero/${user.id}/comandas`, "/topic/salon"] : []), [user]);
  useWebSocket("/ws", topics, cargar);

  const accion = async (ejecutar) => {
    setOcupado(true);
    setError("");
    try {
      await ejecutar();
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(false);
    }
  };

  const agregar = (plato) =>
    accion(() =>
      pedir(`/api/comandas/${id}/items`, {
        method: "POST",
        body: JSON.stringify({ menuItemId: plato.id, cantidad: 1 }),
      }),
    );

  const cambiarCantidad = (item, delta) => {
    const cantidad = item.cantidad + delta;
    if (cantidad < 1) return accion(() => pedir(`/api/comandas/${id}/items/${item.id}`, { method: "DELETE" }));
    return accion(() =>
      pedir(`/api/comandas/${id}/items/${item.id}`, { method: "PATCH", body: JSON.stringify({ cantidad }) }),
    );
  };

  const enviar = () =>
    accion(async () => {
      const r = await pedir(`/api/comandas/${id}/enviar`, { method: "POST" });
      if (r.faltantes.length > 0) {
        setAviso({
          tipo: "faltante",
          texto: `Se envió, pero falta inventario: ${r.faltantes
            .map((f) => `${f.insumo} (${f.stock} ${f.unidad})`)
            .join(", ")}`,
        });
      } else {
        setAviso({ tipo: "ok", texto: "Enviado a cocina" });
      }
      setVista("cuenta");
    });

  const cobrar = (metodoPago) =>
    accion(async () => {
      await pedir(`/api/comandas/${id}/cerrar`, { method: "POST", body: JSON.stringify({ metodoPago }) });
      navigate("/mesas");
    });

  if (!comanda) return <Pantalla>{error ? <Aviso onReintentar={cargar}>{error}</Aviso> : <Cargando />}</Pantalla>;

  const borradores = comanda.items.filter((i) => i.estado === "BORRADOR");
  const activos = comanda.items.filter((i) => i.estado !== "CANCELADO");

  return (
    <Pantalla>
      <Cabecera titulo={`Mesa ${comanda.mesaNumero}`} atras="/mesas" />
      <Aviso onReintentar={cargar}>{error}</Aviso>

      {aviso && (
        <div
          className={`m-4 flex items-start gap-3 rounded-xl p-4 ${
            aviso.tipo === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
          }`}
        >
          <p className="flex-1 font-medium">{aviso.texto}</p>
          <button onClick={() => setAviso(null)}>
            <X size={18} />
          </button>
        </div>
      )}

      {vista === "carta" ? (
        <Carta carta={carta} onAgregar={agregar} onCerrar={() => setVista("cuenta")} ocupado={ocupado} />
      ) : (
        <div className="p-4">
          {activos.length === 0 ? (
            <p className="py-10 text-center text-neutral-500">Aún no has agregado platos.</p>
          ) : (
            <ul className="space-y-2">
              {activos.map((item) => (
                <li key={item.id} className="rounded-xl border border-crema-borde bg-white p-3">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-tinta">{item.nombre}</p>
                      {item.notas && <p className="text-sm text-neutral-500">{item.notas}</p>}
                      <div className="mt-1 flex items-center gap-2">
                        <Estado valor={item.estado} />
                        {item.faltoStock && <span className="text-xs text-alerta">sin inventario</span>}
                      </div>
                    </div>
                    <p className="font-semibold text-tinta">{pesos(item.subtotal)}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {item.estado === "BORRADOR" ? (
                      <>
                        <button
                          onClick={() => cambiarCantidad(item, -1)}
                          disabled={ocupado}
                          className="flex size-11 items-center justify-center rounded-lg border border-crema-borde active:bg-crema"
                        >
                          {item.cantidad === 1 ? <Trash2 size={18} /> : <Minus size={18} />}
                        </button>
                        <span className="w-8 text-center text-lg font-bold">{item.cantidad}</span>
                        <button
                          onClick={() => cambiarCantidad(item, 1)}
                          disabled={ocupado}
                          className="flex size-11 items-center justify-center rounded-lg border border-crema-borde active:bg-crema"
                        >
                          <Plus size={18} />
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-neutral-500">{item.cantidad} unidad(es)</span>
                    )}

                    <div className="flex-1" />

                    {item.estado === "LISTO" && (
                      <Boton
                        variante="dorado"
                        disabled={ocupado}
                        onClick={() => accion(() => pedir(`/api/comandas/${id}/items/${item.id}/entregar`, { method: "POST" }))}
                      >
                        Entregar
                      </Boton>
                    )}
                    {["PENDIENTE", "PREPARANDO"].includes(item.estado) && (
                      <Boton
                        variante="secundario"
                        disabled={ocupado}
                        onClick={() => accion(() => pedir(`/api/comandas/${id}/items/${item.id}/cancelar`, { method: "POST" }))}
                      >
                        Cancelar
                      </Boton>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {vista === "cobro" && (
            <div className="mt-6 rounded-xl border border-crema-borde bg-white p-4">
              <p className="mb-3 font-semibold text-tinta">¿Cómo pagan?</p>
              <div className="grid gap-2">
                {METODOS.map(([valor, etiqueta]) => (
                  <Boton key={valor} disabled={ocupado} onClick={() => cobrar(valor)}>
                    {etiqueta}
                  </Boton>
                ))}
                <Boton variante="secundario" onClick={() => setVista("cuenta")}>
                  Volver
                </Boton>
              </div>
            </div>
          )}
        </div>
      )}

      {vista !== "carta" && vista !== "cobro" && (
        <div className="fixed inset-x-0 bottom-0 border-t border-crema-borde bg-white p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-neutral-500">Total</span>
            <span className="text-2xl font-bold text-tinta">{pesos(comanda.total)}</span>
          </div>
          <div className="flex gap-2">
            <Boton variante="secundario" className="flex-1" onClick={() => setVista("carta")}>
              + Agregar
            </Boton>
            {borradores.length > 0 ? (
              <Boton className="flex-1" cargando={ocupado} onClick={enviar}>
                <span className="flex items-center justify-center gap-2">
                  <Send size={18} /> Enviar ({borradores.length})
                </span>
              </Boton>
            ) : (
              <Boton variante="dorado" className="flex-1" disabled={activos.length === 0} onClick={() => setVista("cobro")}>
                Cobrar
              </Boton>
            )}
          </div>
        </div>
      )}
    </Pantalla>
  );
}

function Carta({ carta, onAgregar, onCerrar, ocupado }) {
  const [categoria, setCategoria] = useState(null);
  const activa = carta.find((c) => c.id === categoria) ?? carta[0];

  return (
    <div className="p-4">
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {carta.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoria(c.id)}
            className={`min-h-11 shrink-0 rounded-full px-4 font-medium ${
              activa?.id === c.id ? "bg-tinta text-white" : "border border-crema-borde bg-white text-tinta"
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {(activa?.items ?? []).map((plato) => (
          <li key={plato.id}>
            <button
              disabled={ocupado}
              onClick={() => onAgregar(plato)}
              className="flex w-full items-center gap-3 rounded-xl border border-crema-borde bg-white p-4 text-left active:bg-crema"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-tinta">{plato.nombre}</p>
                <p className="text-sm text-neutral-500">{pesos(plato.precio)}</p>
              </div>
              <Plus size={22} className="text-dorado" />
            </button>
          </li>
        ))}
      </ul>

      <div className="fixed inset-x-0 bottom-0 border-t border-crema-borde bg-white p-4">
        <Boton className="w-full" onClick={onCerrar}>
          Listo
        </Boton>
      </div>
    </div>
  );
}
