import { useState } from "react";
import { useCart } from "../context/CartContext";
import "./ProductModal.css";

const ProductModal = ({ item, onClose }) => {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  if (!item) return null;

  const handleAdd = () => {
    addToCart(item, qty);
    onClose();
  };

  return (
    <div className="pmodal-overlay" onClick={onClose}>
      <div className="pmodal-card" onClick={(e) => e.stopPropagation()}>
        {item.img && (
          <img src={item.img} alt={item.name} className="pmodal-img" />
        )}

        <div className="pmodal-body">
          <span className="pmodal-eyebrow">Detalle del producto</span>
          <h2 className="pmodal-name">{item.name}</h2>
          <p className="pmodal-price">{item.price}</p>
          <p className="pmodal-desc">{item.desc}</p>

          <div className="pmodal-qty-row">
            <span className="pmodal-qty-label">Cantidad</span>
            <div className="pmodal-qty-ctrl">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
            </div>
          </div>

          <div className="pmodal-actions">
            <button className="pmodal-btn-cancel" onClick={onClose}>Cancelar</button>
            <button className="pmodal-btn-add" onClick={handleAdd}>
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
