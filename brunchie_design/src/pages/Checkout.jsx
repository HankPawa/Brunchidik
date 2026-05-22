import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Checkout.css";

const fmt = (n) => `$${n.toLocaleString("es-CO")}`;

const PAYMENT_METHODS = [
  { id: "efectivo", label: "Efectivo contra entrega" },
  { id: "debito",   label: "Tarjeta débito" },
  { id: "credito",  label: "Tarjeta crédito" },
  { id: "pse",      label: "PSE" },
];

const PaymentModal = ({ method, onClose, onConfirm, loading }) => {
  const isCard = method === "debito" || method === "credito";
  return (
    <div className="pay-overlay" onClick={onClose}>
      <div className="pay-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="pay-modal-title">
          {method === "efectivo" && "Pago en efectivo"}
          {method === "debito"   && "Tarjeta débito"}
          {method === "credito"  && "Tarjeta crédito"}
          {method === "pse"      && "PSE"}
        </h3>

        {method === "efectivo" && (
          <p className="pay-modal-info">
            Tu pedido llegará y pagarás en efectivo al domiciliario.
            Por favor ten el valor exacto listo.
          </p>
        )}

        {isCard && (
          <div className="pay-form">
            <div className="pay-field">
              <label>Número de tarjeta</label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                inputMode="numeric"
                onInput={e => e.target.value = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim()}
              />
            </div>
            <div className="pay-row">
              <div className="pay-field">
                <label>Vencimiento</label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  maxLength={5}
                  inputMode="numeric"
                  onInput={e => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v.length >= 2) v = v.slice(0,2) + "/" + v.slice(2);
                    e.target.value = v;
                  }}
                />
              </div>
              <div className="pay-field">
                <label>CVV</label>
                <input
                  type="password"
                  placeholder="•••"
                  maxLength={4}
                  inputMode="numeric"
                  onInput={e => e.target.value = e.target.value.replace(/\D/g, "")}
                />
              </div>
            </div>
            <div className="pay-field">
              <label>Nombre en la tarjeta</label>
              <input
                type="text"
                placeholder="Como aparece en la tarjeta"
                onInput={e => e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")}
              />
            </div>
          </div>
        )}

        {method === "pse" && (
          <div className="pay-form">
            <div className="pay-field">
              <label>Banco</label>
              <select>
                <option>Bancolombia</option>
                <option>Davivienda</option>
                <option>Banco de Bogotá</option>
                <option>BBVA</option>
                <option>Nequi</option>
              </select>
            </div>
            <div className="pay-row">
              <div className="pay-field">
                <label>Tipo de documento</label>
                <select><option>CC</option><option>NIT</option><option>CE</option></select>
              </div>
              <div className="pay-field">
                <label>Número de documento</label>
                <input
                  type="text"
                  placeholder="1234567890"
                  inputMode="numeric"
                  onInput={e => e.target.value = e.target.value.replace(/\D/g, "")}
                />
              </div>
            </div>
          </div>
        )}

        <div className="pay-modal-actions">
          <button className="pay-btn-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="pay-btn-confirm" onClick={onConfirm} disabled={loading}>
            {loading ? "Procesando..." : "Confirmar pago"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre]               = useState(user?.nombre || "");
  const [direccion, setDireccion]         = useState("");
  const [telefono, setTelefono]           = useState("");
  const [notas, setNotas]                 = useState("");
  const [payMethod, setPayMethod]         = useState("");
  const [showModal, setShowModal]         = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [programar, setProgramar]         = useState(false);
  const [fechaProg, setFechaProg]         = useState("");
  const [horaProg, setHoraProg]           = useState("");

  if (items.length === 0) {
    navigate("/menu");
    return null;
  }

  const getHorarioPedido = (fechaStr) => {
    if (!fechaStr) return null;
    const dia = new Date(fechaStr + "T12:00:00").getDay();
    if (dia === 0) return null;
    if (dia === 6) return { min: "09:00", max: "16:00", label: "9:00 AM – 4:00 PM" };
    return { min: "08:00", max: "17:00", label: "8:00 AM – 5:00 PM" };
  };

  const horarioPedido = getHorarioPedido(fechaProg);
  const esDomingoPedido = fechaProg && new Date(fechaProg + "T12:00:00").getDay() === 0;
  const horaValida = !programar || !horaProg || !horarioPedido ||
    (horaProg >= horarioPedido.min && horaProg <= horarioPedido.max);

  const handleConfirm = async () => {
    if (programar && esDomingoPedido) {
      setError("No realizamos entregas los domingos.");
      setShowModal(false);
      return;
    }
    if (programar && horaProg && !horaValida) {
      setError(`La hora de entrega debe ser entre ${horarioPedido?.label || "8:00 AM – 5:00 PM"}.`);
      setShowModal(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const body = {
        direccion,
        telefono,
        metodoPago: payMethod,
        notas,
        total,
        usuarioId: user?.id,
        detalles: items.map((item) => ({
          cantidad:       item.qty,
          precioUnitario: item.priceNum,
          menuItemId:     item.id,
        })),
      };

      if (programar && fechaProg && horaProg) {
        body.fechaProgramada = `${fechaProg}T${horaProg}:00`;
      }

      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      clearCart();
      setShowModal(false);
      navigate("/pedido-exitoso");
    } catch {
      setError("No se pudo procesar el pedido. Inténtalo de nuevo.");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="checkout-main">
        <div className="checkout-grid">

          <section className="checkout-summary">
            <span className="checkout-eyebrow">Tu pedido</span>
            <h2 className="checkout-section-title">Resumen</h2>
            <div className="checkout-divider">
              <span className="checkout-divider-line" />
              <span className="checkout-divider-gem">✦</span>
              <span className="checkout-divider-line" />
            </div>
            <ul className="checkout-items">
              {items.map((item) => (
                <li key={item.name} className="checkout-item">
                  <span className="checkout-item-qty">{item.qty}×</span>
                  <span className="checkout-item-name">{item.name}</span>
                  <span className="checkout-item-price">{fmt(item.priceNum * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="checkout-breakdown">
              <div className="checkout-breakdown-row">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="checkout-breakdown-row">
                <span>Costo de envío</span><span>{fmt(shipping)}</span>
              </div>
              <div className="checkout-breakdown-row checkout-breakdown-total">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>
          </section>

          <section className="checkout-form-section">
            <span className="checkout-eyebrow">Entrega</span>
            <h2 className="checkout-section-title">Datos del domicilio</h2>
            <div className="checkout-divider">
              <span className="checkout-divider-line" />
              <span className="checkout-divider-gem">✦</span>
              <span className="checkout-divider-line" />
            </div>

            <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
              <div className="checkout-field">
                <label>Nombre completo</label>
                <input 
                  type="text" 
                  value={nombre} 
                  onChange={(e) => {
                    // Permite solo letras y espacios, bloqueando números y caracteres especiales
                    setNombre(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ""));
                  }} 
                  required 
                />
              </div>
              <div className="checkout-field">
                <label>Dirección de entrega</label>
                <input
                  type="text"
                  placeholder="Calle 10 # 5-23, Apto 301"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  required
                />
              </div>
              <div className="checkout-field">
                <label>Teléfono</label>
                <input
                  type="tel"
                  placeholder="+57 300 000 0000"
                  inputMode="numeric"
                  value={telefono}
                  onChange={(e) => {
                    // Bloquea letras y limita a los primeros 10 dígitos
                    const soloNumeros = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setTelefono(soloNumeros);
                  }}
                  maxLength={10}
                  required
                />
              </div>

              <div className="checkout-field">
                <label>Método de pago</label>
                <div className="pay-methods">
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m.id} className={`pay-method-option ${payMethod === m.id ? "selected" : ""}`}>
                      <input type="radio" name="payment" value={m.id} onChange={() => setPayMethod(m.id)} />
                      {m.label}
                    </label>
                  ))}
                </div>
              </div>

              {user?.suscrito ? (
                <div className="checkout-field">
                  <label className="checkout-toggle-label">
                    <input
                      type="checkbox"
                      checked={programar}
                      onChange={(e) => setProgramar(e.target.checked)}
                    />
                    Programar pedido para una fecha y hora específica
                  </label>
                </div>
              ) : (
                <div className="checkout-field">
                  <div className="checkout-premium-banner">
                    <span className="checkout-premium-icon">✦</span>
                    <div>
                      <p className="checkout-premium-texto">¿Quieres programar tu pedido?</p>
                      <p className="checkout-premium-sub">Esta función es exclusiva para miembros Premium.</p>
                    </div>
                    <a href="/suscripcion" className="checkout-premium-btn">Ver planes</a>
                  </div>
                </div>
              )}

              {programar && (
                <div className="checkout-row">
                  <div className="checkout-field">
                    <label>Fecha de entrega</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={fechaProg}
                      onChange={(e) => setFechaProg(e.target.value)}
                      required={programar}
                    />
                  </div>
                  <div className="checkout-field">
                    <label>Hora de entrega {horarioPedido && <span className="checkout-hora-hint">({horarioPedido.label})</span>}</label>
                    <input
                      type="time"
                      min={horarioPedido?.min || "08:00"}
                      max={horarioPedido?.max || "17:00"}
                      value={horaProg}
                      onChange={(e) => setHoraProg(e.target.value)}
                      disabled={esDomingoPedido}
                      required={programar}
                    />
                    {esDomingoPedido && <span className="checkout-hora-hint" style={{color:"#c0392b"}}>No realizamos entregas los domingos</span>}
                  </div>
                </div>
              )}

              <div className="checkout-field">
                <label>Notas adicionales</label>
                <textarea
                  placeholder="Instrucciones para el domiciliario..."
                  rows={2}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </div>

              {error && <p className="checkout-error">{error}</p>}

              <div className="checkout-actions">
                <button type="button" className="checkout-cancel-btn" onClick={() => navigate("/menu")}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="checkout-submit-btn"
                  disabled={!payMethod || !direccion || !telefono || (programar && (!fechaProg || !horaProg || !horaValida || esDomingoPedido))}
                  onClick={() => setShowModal(true)}
                >
                  Continuar
                </button>
              </div>
            </form>
          </section>

        </div>
      </main>

      <Footer />

      {showModal && (
        <PaymentModal
          method={payMethod}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
          loading={loading}
        />
      )}
    </>
  );
};

export default Checkout;
