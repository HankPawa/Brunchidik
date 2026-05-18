import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "./Suscripcion.css";

const PLANES = [
  {
    id: "mensual",
    nombre: "Mensual",
    precio: "$29.900",
    ciclo: "/ mes",
    descripcion: "Ideal para probar la experiencia premium.",
    beneficios: [
      "Programa pedidos con anticipación",
      "Prioridad en reservas de mesa",
      "Acceso a ofertas exclusivas",
    ],
    destacado: false,
  },
  {
    id: "anual",
    nombre: "Anual",
    precio: "$249.900",
    ciclo: "/ año",
    descripcion: "El mejor valor. Ahorra más de $100.000.",
    beneficios: [
      "Todo lo del plan Mensual",
      "2 meses gratis incluidos",
      "Descuento del 15% en pedidos",
      "Acceso anticipado a nuevos platos",
    ],
    destacado: true,
  },
];

const PagoModal = ({ plan, onClose, onConfirm, loading }) => {
  const [card, setCard] = useState({ numero: "", vencimiento: "", cvv: "", nombre: "" });
  const [error, setError] = useState("");

  const validar = () => {
    if (card.numero.replace(/\s/g, "").length < 16) return "El número de tarjeta debe tener 16 dígitos.";
    if (!/^\d{2}\/\d{2}$/.test(card.vencimiento))   return "Fecha de vencimiento inválida (MM/AA).";
    if (card.cvv.length < 3)                          return "CVV debe tener mínimo 3 dígitos.";
    if (!card.nombre.trim())                          return "Ingresa el nombre tal como aparece en la tarjeta.";
    return "";
  };

  const handleConfirm = () => {
    const err = validar();
    if (err) { setError(err); return; }
    onConfirm();
  };

  return (
    <div className="sus-overlay" onClick={onClose}>
      <div className="sus-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="sus-modal-title">Plan {plan.nombre}</h3>
        <p className="sus-modal-precio">{plan.precio}<span>{plan.ciclo}</span></p>

        <div className="sus-pay-form">
          <div className="sus-pay-field">
            <label>Número de tarjeta</label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              value={card.numero}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                setCard({ ...card, numero: v });
                setError("");
              }}
            />
          </div>
          <div className="sus-pay-row">
            <div className="sus-pay-field">
              <label>Vencimiento</label>
              <input
                type="text"
                placeholder="MM/AA"
                maxLength={5}
                value={card.vencimiento}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, "");
                  if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
                  setCard({ ...card, vencimiento: v });
                  setError("");
                }}
              />
            </div>
            <div className="sus-pay-field">
              <label>CVV</label>
              <input
                type="password"
                placeholder="•••"
                maxLength={4}
                value={card.cvv}
                onChange={e => { setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") }); setError(""); }}
              />
            </div>
          </div>
          <div className="sus-pay-field">
            <label>Nombre en la tarjeta</label>
            <input
              type="text"
              placeholder="Como aparece en la tarjeta"
              value={card.nombre}
              onChange={e => { setCard({ ...card, nombre: e.target.value }); setError(""); }}
            />
          </div>
        </div>

        {error && <p className="sus-pay-error">{error}</p>}

        <div className="sus-modal-actions">
          <button className="sus-btn-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="sus-btn-confirm" onClick={handleConfirm} disabled={loading}>
            {loading ? "Procesando..." : "Confirmar pago"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Suscripcion = () => {
  const { user, actualizarUsuario } = useAuth();
  const navigate = useNavigate();
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  const handleSuscribir = async () => {
    if (!user) { navigate("/login"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/usuarios/${user.id}/suscripcion?activo=true`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      actualizarUsuario(updated);
      setExito(true);
      setPlanSeleccionado(null);
      setTimeout(() => navigate("/menu"), 2500);
    } catch {
      alert("Error al procesar el pago. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (user?.suscrito) {
    return (
      <>
        <Navbar />
        <main className="sus-main">
          <div className="sus-activa">
            <div className="sus-activa-icon">✦</div>
            <h1 className="sus-activa-title">Ya eres miembro Premium</h1>
            <p className="sus-activa-sub">Tienes acceso a programar pedidos y todos los beneficios exclusivos.</p>
            <button className="sus-btn-ir" onClick={() => navigate("/menu")}>Ir al menú</button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="sus-main">

        {exito && (
          <div className="sus-exito">
            <span>✦</span> ¡Suscripción activada! Redirigiendo al menú...
          </div>
        )}

        <div className="sus-hero">
          <span className="sus-eyebrow">Membresía Premium</span>
          <h1 className="sus-title">Eleva tu experiencia brunch</h1>
          <p className="sus-sub">Suscríbete y desbloquea el poder de programar tus pedidos cuando quieras.</p>
        </div>

        <div className="sus-planes">
          {PLANES.map((plan) => (
            <div key={plan.id} className={`sus-plan${plan.destacado ? " sus-plan--destacado" : ""}`}>
              {plan.destacado && <span className="sus-badge-popular">Más popular</span>}
              <h2 className="sus-plan-nombre">{plan.nombre}</h2>
              <div className="sus-plan-precio">
                {plan.precio}<span className="sus-plan-ciclo">{plan.ciclo}</span>
              </div>
              <p className="sus-plan-desc">{plan.descripcion}</p>
              <ul className="sus-plan-lista">
                {plan.beneficios.map((b) => (
                  <li key={b}><span className="sus-check">✓</span>{b}</li>
                ))}
              </ul>
              <button
                className={`sus-plan-btn${plan.destacado ? " sus-plan-btn--destacado" : ""}`}
                onClick={() => user ? setPlanSeleccionado(plan) : navigate("/login")}
              >
                {user ? "Suscribirse" : "Iniciar sesión para suscribirse"}
              </button>
            </div>
          ))}
        </div>

        <div className="sus-beneficios">
          <h2 className="sus-beneficios-title">¿Por qué ser miembro?</h2>
          <div className="sus-beneficios-grid">
            <div className="sus-beneficio">
              <span className="sus-beneficio-icon">🗓️</span>
              <h3>Programa tus pedidos</h3>
              <p>Elige exactamente cuándo quieres recibir tu brunch. Planea tu semana con anticipación.</p>
            </div>
            <div className="sus-beneficio">
              <span className="sus-beneficio-icon">⚡</span>
              <h3>Prioridad en reservas</h3>
              <p>Tus reservas de mesa tienen prioridad sobre los demás clientes en fechas especiales.</p>
            </div>
            <div className="sus-beneficio">
              <span className="sus-beneficio-icon">🎁</span>
              <h3>Ofertas exclusivas</h3>
              <p>Accede a descuentos y promociones disponibles solo para miembros premium.</p>
            </div>
          </div>
        </div>

      </main>

      {planSeleccionado && (
        <PagoModal
          plan={planSeleccionado}
          onClose={() => setPlanSeleccionado(null)}
          onConfirm={handleSuscribir}
          loading={loading}
        />
      )}

      <Footer />
    </>
  );
};

export default Suscripcion;
