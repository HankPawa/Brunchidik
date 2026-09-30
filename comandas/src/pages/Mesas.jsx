import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/sesion";
import { useWebSocket } from "../hooks/useWebSocket";
import { Cabecera, Pantalla } from "../components/Layout";
import { Aviso, Cargando } from "../components/ui";
import { minutosDesde, pesos } from "../lib/formato";

const TOPICS = ["/topic/salon"];

export default function Mesas() {
  const { pedir } = useAuth();
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]);
  const [comandas, setComandas] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [abriendo, setAbriendo] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const [mesas, comandas] = await Promise.all([pedir("/api/mesas"), pedir("/api/comandas")]);
      setMesas(mesas);
      setComandas(comandas);
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

  // Otro mesero puede abrir o cerrar una mesa desde su celular.
  useWebSocket("/ws", TOPICS, cargar);

  const abrir = async (mesa) => {
    setAbriendo(mesa.id);
    try {
      const comanda = await pedir("/api/comandas", { method: "POST", body: JSON.stringify({ mesaId: mesa.id }) });
      navigate(`/comanda/${comanda.id}`);
    } catch (err) {
      setError(err.message);
      cargar();
    } finally {
      setAbriendo(null);
    }
  };

  const porMesa = new Map(comandas.map((c) => [c.mesaId, c]));

  return (
    <Pantalla>
      <Cabecera titulo="Mesas" />
      <Aviso onReintentar={cargar}>{error}</Aviso>

      {cargando ? (
        <Cargando />
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
          {mesas.map((mesa) => {
            const comanda = porMesa.get(mesa.id);
            const listos = comanda?.items.filter((i) => i.estado === "LISTO").length ?? 0;

            return (
              <button
                key={mesa.id}
                disabled={abriendo === mesa.id}
                onClick={() => (comanda ? navigate(`/comanda/${comanda.id}`) : abrir(mesa))}
                className={`flex min-h-32 flex-col justify-between rounded-2xl border-2 p-4 text-left transition active:scale-[0.98] ${
                  listos > 0
                    ? "border-emerald-500 bg-emerald-50"
                    : comanda
                      ? "border-dorado bg-white"
                      : "border-crema-borde bg-white"
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-tinta">{mesa.numero}</span>
                  <span className="text-xs text-neutral-400">{mesa.capacidad} pers.</span>
                </div>

                {comanda ? (
                  <div className="text-sm">
                    <p className="font-semibold text-tinta">{pesos(comanda.total)}</p>
                    <p className="text-neutral-500">
                      {comanda.items.length} plato{comanda.items.length === 1 ? "" : "s"} ·{" "}
                      {minutosDesde(comanda.fechaApertura)} min
                    </p>
                    {listos > 0 && <p className="font-semibold text-emerald-700">{listos} listo(s) para llevar</p>}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400">Libre · toca para abrir</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </Pantalla>
  );
}
