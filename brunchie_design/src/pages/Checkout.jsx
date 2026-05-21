import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Checkout.css";

const fmt = (n) => `$${n.toLocaleString("es-CO")}`;

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  if (items.length === 0 && !showModal) {
    navigate("/menu");
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    clearCart();
    setShowModal(true);
  };

  const handleModalAccept = () => {
    setShowModal(false);
    navigate("/");
  };

  return (
    <>
      <Navbar />

      <main className="checkout-main">
        <div className="checkout-grid">

          {/* Resumen del pedido */}
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

            <div className="checkout-total-row">
              <span>Total</span>
              <span className="checkout-total-price">{fmt(total)}</span>
            </div>
          </section>

          {/* Formulario de domicilio */}
          <section className="checkout-form-section">
            <span className="checkout-eyebrow">Entrega</span>
            <h2 className="checkout-section-title">Datos del domicilio</h2>
            <div className="checkout-divider">
              <span className="checkout-divider-line" />
              <span className="checkout-divider-gem">✦</span>
              <span className="checkout-divider-line" />
            </div>

            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="checkout-field">
                <label>Nombre completo</label>
                <input type="text" defaultValue={user?.nombre} required />
              </div>
              <div className="checkout-field">
                <label>Dirección de entrega</label>
                <input type="text" placeholder="Calle 10 # 5-23, Apto 301" required />
              </div>
              <div className="checkout-field">
                <label>Teléfono</label>
                <input type="tel" placeholder="+57 300 000 0000" required />
              </div>
              <div className="checkout-field">
                <label>Método de pago</label>
                <select required>
                  <option value="efectivo">Efectivo contra entrega</option>
                  <option value="transferencia">Transferencia / Nequi</option>
                  <option value="tarjeta">Tarjeta en puerta</option>
                </select>
              </div>
              <div className="checkout-field">
                <label>Notas adicionales</label>
                <textarea placeholder="Instrucciones especiales para el domiciliario..." rows={3} />
              </div>

              <button type="submit" className="checkout-submit-btn">
                Confirmar pedido
              </button>
            </form>
          </section>

        </div>
      </main>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="checkout-modal-overlay" onClick={handleModalAccept}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal-content">
              <span className="checkout-modal-icon">✓</span>
              <h2 className="checkout-modal-title">¡Pedido tomado con éxito!</h2>
              <p className="checkout-modal-text">Pronto estará en tus manos</p>
              <button 
                className="checkout-modal-btn" 
                onClick={handleModalAccept}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Checkout;
