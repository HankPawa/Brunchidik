import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/sesion";
import { useWebSocket } from "../hooks/useWebSocket";
import { Cabecera } from "../components/Layout";
import { Aviso, Cargando } from "../components/ui";
import { minutosDesde } from "../lib/formato";

const TOPICS = ["/topic/cocina"];

// Tablero de cocina: pantalla encendida todo el servicio, mirada de lejos y
// dedos ocupados. Por eso el contraste alto, las tarjetas grandes y el aviso
// sonoro cuando entra algo nuevo.
export default function Cocina() {
  const { pedir } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const conocidos = useRef(new Set());

  const cargar = useCallback(async () => {
    try {
      const pendientes = await pedir("/api/cocina/pendientes");
      const nuevos = pendientes.filter((i) => !conocidos.current.has(i.id));
      if (nuevos.length > 0 && conocidos.current.size > 0) sonar();
      conocidos.current = new Set(pendientes.map((i) => i.id));
      setItems(pendientes);
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

  useWebSocket("/ws", TOPICS, cargar);
  useMantenerPantallaEncendida();

  // Reloj propio: los minutos avanzan sin pedir nada al servidor.
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const marcar = async (item, estado) => {
    try {
      await pedir(`/api/cocina/items/${item.id}`, { method: "PATCH", body: JSON.stringify({ estado }) });
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const porEstado = (estado) => items.filter((i) => i.estado === estado);

  return (
    <div className="min-h-full bg-neutral-900 text-white">
      <div className="bg-neutral-950">
        <Cabecera titulo="Cocina" />
      </div>
      <Aviso onReintentar={cargar}>{error}</Aviso>

      {cargando ? (
        <Cargando />
      ) : items.length === 0 ? (
        <p className="p-16 text-center text-xl text-neutral-400">Sin pedidos pendientes</p>
      ) : (
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <Columna titulo="En cola" items={porEstado("PENDIENTE")} accion="Empezar" onAccion={(i) => marcar(i, "PREPARANDO")} />
          <Columna
            titulo="Preparando"
            items={porEstado("PREPARANDO")}
            accion="Listo"
            destacado
            onAccion={(i) => marcar(i, "LISTO")}
          />
        </div>
      )}
    </div>
  );
}

function Columna({ titulo, items, accion, onAccion, destacado }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold tracking-widest text-neutral-400 uppercase">
        {titulo} ({items.length})
      </h2>
      <ul className="space-y-3">
        {items.map((item) => {
          const minutos = minutosDesde(item.fechaEnvio);
          return (
            <li
              key={item.id}
              className={`rounded-2xl p-4 ${minutos >= 15 ? "bg-alerta/20 ring-2 ring-alerta" : "bg-neutral-800"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-neutral-400">Mesa {item.mesa}</p>
                  <p className="text-2xl leading-tight font-bold">
                    {item.cantidad}× {item.nombre}
                  </p>
                  {item.notas && <p className="mt-1 text-lg text-dorado">{item.notas}</p>}
                </div>
                <span className={`shrink-0 text-lg font-bold ${minutos >= 15 ? "text-alerta" : "text-neutral-400"}`}>
                  {minutos}′
                </span>
              </div>

              <button
                onClick={() => onAccion(item)}
                className={`mt-4 min-h-14 w-full rounded-xl text-lg font-bold active:scale-[0.99] ${
                  destacado ? "bg-emerald-500 text-neutral-900" : "bg-white text-neutral-900"
                }`}
              >
                {accion}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Evita que la tablet se apague sola durante el servicio.
function useMantenerPantallaEncendida() {
  useEffect(() => {
    if (!navigator.wakeLock) return;
    let bloqueo = null;

    const pedirBloqueo = async () => {
      try {
        bloqueo = await navigator.wakeLock.request("screen");
      } catch {
        // El navegador puede negarlo (batería baja): no es crítico.
      }
    };

    pedirBloqueo();
    // Al volver de segundo plano el bloqueo se pierde y hay que pedirlo otra vez.
    const alVolver = () => document.visibilityState === "visible" && pedirBloqueo();
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      document.removeEventListener("visibilitychange", alVolver);
      bloqueo?.release().catch(() => {});
    };
  }, []);
}

function sonar() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    setTimeout(() => ctx.close(), 600);
  } catch {
    // Sin audio disponible: el aviso visual basta.
  }
}
