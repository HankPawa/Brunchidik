import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import "./CartDrawer.css";

const fmt = (n) => `$${n.toLocaleString("es-CO")}`;

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeFromCart, updateQty, clearCart, subtotal, shipping, total, count } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={`cart-drawer ${isOpen ? "cart-drawer--open" : ""}`}>
        <div className="cart-header">
          <h2 className="cart-title">Tu pedido</h2>
          <button className="cart-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-icon">🛍️</span>
            <p>Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((item) => (
                <li key={item.name} className="cart-item">
                  {item.img && (
                    <img src={item.img} alt={item.name} className="cart-item-img" />
                  )}
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">{fmt(item.priceNum * item.qty)}</span>
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQty(item.name, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.name, item.qty + 1)}>+</button>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.name)}>✕</button>
                </li>
              ))}
            </ul>

            <div className="cart-footer">
              <div className="cart-breakdown">
                <div className="cart-breakdown-row">
                  <span>Subtotal ({count} {count === 1 ? "ítem" : "ítems"})</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="cart-breakdown-row">
                  <span>Costo de envío</span>
                  <span>{fmt(shipping)}</span>
                </div>
                <div className="cart-breakdown-row cart-breakdown-total">
                  <span>Total</span>
                  <span className="cart-total-price">{fmt(total)}</span>
                </div>
              </div>

              <button className="cart-checkout-btn" onClick={handleCheckout}>
                Ir a pagar
              </button>
              <button className="cart-clear-btn" onClick={() => { clearCart(); toast.success("Carrito vaciado."); }}>
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
