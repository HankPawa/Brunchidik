import { useNavigate } from "react-router-dom";
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

  if (items.length === 0) {
    navigate("/menu");
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    clearCart();
    navigate("/pedido-exitoso");
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

      <Footer />
    </>
  );
};

export default Checkout;
